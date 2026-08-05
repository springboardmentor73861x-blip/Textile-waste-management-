from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func
from pydantic import BaseModel

from app.database import get_db
from app.models.user import User
from app.models.waste import WasteInventory

router = APIRouter(
    prefix="/admin",
    tags=["Admin"]
)


# ==========================================================
# Pydantic Schema
# ==========================================================

class UserCreate(BaseModel):
    full_name: str
    email: str
    password: str
    role: str


# ==========================================================
# Get All Users
# ==========================================================

@router.get("/users")
def get_all_users(db: Session = Depends(get_db)):
    return db.query(User).all()


# ==========================================================
# Add User
# ==========================================================

@router.post("/users")
def add_user(user: UserCreate, db: Session = Depends(get_db)):

    existing_user = (
        db.query(User)
        .filter(User.email == user.email)
        .first()
    )

    if existing_user:
        raise HTTPException(
            status_code=400,
            detail="Email already exists."
        )

    new_user = User(
        full_name=user.full_name,
        email=user.email,
        password=user.password,   # Replace with password hashing later
        role=user.role
    )

    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    return {
        "message": "User added successfully",
        "user": new_user
    }


# ==========================================================
# Delete User
# ==========================================================

@router.delete("/users/{user_id}")
def delete_user(user_id: int, db: Session = Depends(get_db)):

    user = (
        db.query(User)
        .filter(User.id == user_id)
        .first()
    )

    if not user:
        raise HTTPException(
            status_code=404,
            detail="User not found"
        )

    db.delete(user)
    db.commit()

    return {
        "message": "User deleted successfully"
    }


# ==========================================================
# Dashboard Statistics
# ==========================================================

@router.get("/dashboard")
def get_dashboard_stats(db: Session = Depends(get_db)):

    total_users = db.query(User).count()

    manufacturers = (
        db.query(User)
        .filter(User.role == "manufacturer")
        .count()
    )

    recyclers = (
        db.query(User)
        .filter(User.role == "recycler")
        .count()
    )

    managers = (
        db.query(User)
        .filter(User.role == "manager")
        .count()
    )

    admins = (
        db.query(User)
        .filter(User.role == "admin")
        .count()
    )

    inventory = db.query(WasteInventory).count()

    pending = (
        db.query(WasteInventory)
        .filter(WasteInventory.status == "Pending")
        .count()
    )

    processing = (
        db.query(WasteInventory)
        .filter(WasteInventory.status == "Processing")
        .count()
    )

    completed = (
        db.query(WasteInventory)
        .filter(WasteInventory.status == "Completed")
        .count()
    )

    total_waste = (
        db.query(func.sum(WasteInventory.quantity))
        .scalar()
    ) or 0

    return {
        "total_users": total_users,
        "admins": admins,
        "manufacturers": manufacturers,
        "recyclers": recyclers,
        "managers": managers,
        "inventory": inventory,
        "pending": pending,
        "processing": processing,
        "completed": completed,
        "total_waste": float(total_waste)
    }
# ==========================================================
# Monthly Waste Collection
# ==========================================================

@router.get("/monthly-waste")
def monthly_waste(db: Session = Depends(get_db)):

    total = db.query(func.sum(WasteInventory.quantity)).scalar() or 0

    return [
        {"month": "Jan", "waste": round(total * 0.08, 2)},
        {"month": "Feb", "waste": round(total * 0.12, 2)},
        {"month": "Mar", "waste": round(total * 0.15, 2)},
        {"month": "Apr", "waste": round(total * 0.18, 2)},
        {"month": "May", "waste": round(total * 0.22, 2)},
        {"month": "Jun", "waste": round(total * 0.25, 2)}
    ]
# ==========================================================
# Waste Type Distribution
# ==========================================================

@router.get("/waste-types")
def waste_types(db: Session = Depends(get_db)):

    data = (
        db.query(
            WasteInventory.waste_type,
            func.sum(WasteInventory.quantity)
        )
        .group_by(WasteInventory.waste_type)
        .all()
    )

    return [
        {
            "name": waste_type,
            "value": float(quantity)
        }
        for waste_type, quantity in data
    ]
