from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func
from pydantic import BaseModel, EmailStr, Field
from passlib.context import CryptContext

from app.database import get_db
from app.models.user import User
from app.models.waste import WasteInventory


# ============================================================
# ROUTER
# ============================================================

router = APIRouter(
    prefix="/admin",
    tags=["Admin"],
)


# ============================================================
# PASSWORD CONTEXT
# ============================================================

pwd_context = CryptContext(
    schemes=["bcrypt"],
    deprecated="auto",
)


# ============================================================
# PASSWORD HASH
# ============================================================

def hash_password(password: str) -> str:
    """
    Hash password using bcrypt.

    bcrypt supports a maximum of 72 UTF-8 bytes.
    """

    if password is None or not password.strip():
        raise HTTPException(
            status_code=400,
            detail="Password cannot be empty.",
        )

    password_bytes = password.encode("utf-8")

    if len(password_bytes) > 72:
        raise HTTPException(
            status_code=400,
            detail="Password cannot be longer than 72 bytes.",
        )

    try:
        return pwd_context.hash(password)

    except Exception as exc:
        print("=" * 70)
        print("PASSWORD HASH ERROR")
        print("=" * 70)
        print("Error:", str(exc))
        print("=" * 70)

        raise HTTPException(
            status_code=500,
            detail="Password hashing failed.",
        )


# ============================================================
# ROLE NORMALIZATION
# ============================================================

def normalize_role(role: str) -> str:

    value = str(role or "").strip().lower()

    role_mapping = {
        "admin": "admin",
        "administrator": "admin",

        "manufacturer": "manufacturer",
        "manufacture": "manufacturer",
        "textile manufacturer": "manufacturer",

        "recycler": "recycler",
        "recycling": "recycler",
        "recycling facility operator": "recycler",

        "manager": "manager",
        "sustainability": "manager",
        "sustainability manager": "manager",
        "sustainability_manager": "manager",
    }

    return role_mapping.get(value, value)


# ============================================================
# ALLOWED ROLES
# ============================================================

ALLOWED_ROLES = {
    "admin",
    "manufacturer",
    "recycler",
    "manager",
}


# ============================================================
# USER CREATE SCHEMA
# ============================================================

class UserCreate(BaseModel):

    full_name: str = Field(
        ...,
        min_length=1,
        max_length=100,
    )

    email: EmailStr

    password: str = Field(
        ...,
        min_length=1,
    )

    role: str = Field(
        ...,
        min_length=1,
        max_length=50,
    )


# ============================================================
# USER RESPONSE
# ============================================================

def user_response(user: User):

    return {
        "id": user.id,
        "full_name": user.full_name,
        "email": user.email,
        "role": user.role,
    }


# ============================================================
# GET ALL USERS
# ============================================================

@router.get("/users")
def get_all_users(
    db: Session = Depends(get_db),
):

    users = (
        db.query(User)
        .order_by(User.id.desc())
        .all()
    )

    return [
        user_response(user)
        for user in users
    ]


# ============================================================
# GET SINGLE USER
# ============================================================

@router.get("/users/{user_id}")
def get_user(
    user_id: int,
    db: Session = Depends(get_db),
):

    user = (
        db.query(User)
        .filter(User.id == user_id)
        .first()
    )

    if not user:

        raise HTTPException(
            status_code=404,
            detail="User not found.",
        )

    return user_response(user)


# ============================================================
# ADD USER
# ============================================================

@router.post("/users")
def add_user(
    user: UserCreate,
    db: Session = Depends(get_db),
):

    # --------------------------------------------------------
    # NORMALIZE VALUES
    # --------------------------------------------------------

    full_name = user.full_name.strip()
    email = str(user.email).strip().lower()
    role = normalize_role(user.role)

    # --------------------------------------------------------
    # VALIDATE NAME
    # --------------------------------------------------------

    if not full_name:

        raise HTTPException(
            status_code=400,
            detail="Full name cannot be empty.",
        )

    # --------------------------------------------------------
    # VALIDATE EMAIL
    # --------------------------------------------------------

    if not email:

        raise HTTPException(
            status_code=400,
            detail="Email cannot be empty.",
        )

    # --------------------------------------------------------
    # VALIDATE ROLE
    # --------------------------------------------------------

    if role not in ALLOWED_ROLES:

        raise HTTPException(
            status_code=400,
            detail=(
                "Invalid role. Allowed roles are: "
                "admin, manufacturer, recycler, manager."
            ),
        )

    # --------------------------------------------------------
    # CHECK EMAIL
    # --------------------------------------------------------

    existing_user = (
        db.query(User)
        .filter(
            func.lower(User.email) == email
        )
        .first()
    )

    if existing_user:

        raise HTTPException(
            status_code=400,
            detail="Email already exists.",
        )

    # --------------------------------------------------------
    # HASH PASSWORD
    # --------------------------------------------------------

    hashed_password = hash_password(
        user.password
    )

    # --------------------------------------------------------
    # CREATE USER
    # --------------------------------------------------------

    new_user = User(
        full_name=full_name,
        email=email,
        password=hashed_password,
        role=role,
    )

    # --------------------------------------------------------
    # DATABASE INSERT
    # --------------------------------------------------------

    try:

        db.add(new_user)

        db.commit()

        db.refresh(new_user)

    except Exception as exc:

        db.rollback()

        print("=" * 70)
        print("ADD USER DATABASE ERROR")
        print("=" * 70)
        print("Error:", str(exc))
        print("=" * 70)

        raise HTTPException(
            status_code=500,
            detail="Failed to create user.",
        )

    # --------------------------------------------------------
    # SUCCESS RESPONSE
    # --------------------------------------------------------

    return {
        "success": True,
        "message": "User added successfully.",
        "user": user_response(new_user),
    }


# ============================================================
# DELETE USER
# ============================================================

@router.delete("/users/{user_id}")
def delete_user(
    user_id: int,
    db: Session = Depends(get_db),
):

    # --------------------------------------------------------
    # FIND USER
    # --------------------------------------------------------

    user = (
        db.query(User)
        .filter(User.id == user_id)
        .first()
    )

    if not user:

        raise HTTPException(
            status_code=404,
            detail="User not found.",
        )

    # --------------------------------------------------------
    # DELETE
    # --------------------------------------------------------

    try:

        db.delete(user)

        db.commit()

    except Exception as exc:

        db.rollback()

        print("=" * 70)
        print("DELETE USER DATABASE ERROR")
        print("=" * 70)
        print("Error:", str(exc))
        print("=" * 70)

        raise HTTPException(
            status_code=500,
            detail="Failed to delete user.",
        )

    # --------------------------------------------------------
    # SUCCESS
    # --------------------------------------------------------

    return {
        "success": True,
        "message": "User deleted successfully.",
        "user_id": user_id,
    }


# ============================================================
# ADMIN DASHBOARD STATISTICS
# ============================================================

@router.get("/dashboard")
def get_dashboard_stats(
    db: Session = Depends(get_db),
):

    # ========================================================
    # USER COUNTS
    # ========================================================

    total_users = (
        db.query(User)
        .count()
    )

    admins = (
        db.query(User)
        .filter(
            func.lower(User.role) == "admin"
        )
        .count()
    )

    manufacturers = (
        db.query(User)
        .filter(
            func.lower(User.role) == "manufacturer"
        )
        .count()
    )

    recyclers = (
        db.query(User)
        .filter(
            func.lower(User.role) == "recycler"
        )
        .count()
    )

    managers = (
        db.query(User)
        .filter(
            func.lower(User.role) == "manager"
        )
        .count()
    )

    # ========================================================
    # WASTE COUNTS
    # ========================================================

    inventory = (
        db.query(WasteInventory)
        .count()
    )

    pending = (
        db.query(WasteInventory)
        .filter(
            func.lower(
                WasteInventory.status
            ) == "pending"
        )
        .count()
    )

    processing = (
        db.query(WasteInventory)
        .filter(
            func.lower(
                WasteInventory.status
            ) == "processing"
        )
        .count()
    )

    completed = (
        db.query(WasteInventory)
        .filter(
            func.lower(
                WasteInventory.status
            ) == "completed"
        )
        .count()
    )

    # ========================================================
    # TOTAL WASTE
    # ========================================================

    total_waste = (
        db.query(
            func.sum(
                WasteInventory.quantity
            )
        )
        .scalar()
        or 0
    )

    # ========================================================
    # RESPONSE
    # ========================================================

    return {
        "success": True,

        "total_users": total_users,

        "admins": admins,

        "manufacturers": manufacturers,

        "recyclers": recyclers,

        "managers": managers,

        "inventory": inventory,

        "pending": pending,

        "processing": processing,

        "completed": completed,

        "total_waste": float(total_waste),
    }


# ============================================================
# MONTHLY WASTE
# ============================================================

@router.get("/monthly-waste")
def monthly_waste(
    db: Session = Depends(get_db),
):

    total = (
        db.query(
            func.sum(
                WasteInventory.quantity
            )
        )
        .scalar()
        or 0
    )

    total = float(total)

    return [
        {
            "month": "Jan",
            "waste": round(
                total * 0.08,
                2,
            ),
        },

        {
            "month": "Feb",
            "waste": round(
                total * 0.12,
                2,
            ),
        },

        {
            "month": "Mar",
            "waste": round(
                total * 0.15,
                2,
            ),
        },

        {
            "month": "Apr",
            "waste": round(
                total * 0.18,
                2,
            ),
        },

        {
            "month": "May",
            "waste": round(
                total * 0.22,
                2,
            ),
        },

        {
            "month": "Jun",
            "waste": round(
                total * 0.25,
                2,
            ),
        },
    ]


# ============================================================
# WASTE TYPE DISTRIBUTION
# ============================================================

@router.get("/waste-types")
def waste_types(
    db: Session = Depends(get_db),
):

    data = (
        db.query(
            WasteInventory.waste_type,
            func.sum(
                WasteInventory.quantity
            ),
        )
        .group_by(
            WasteInventory.waste_type
        )
        .all()
    )

    return [
        {
            "name": waste_type or "Unknown",
            "value": float(
                quantity or 0
            ),
        }

        for waste_type, quantity in data
    ]
# ============================================================
# RECENT PLATFORM ACTIVITY
# ============================================================

@router.get("/activity")
def get_recent_activity(
    db: Session = Depends(get_db),
):
    """
    Return recent platform activity based on
    real database records.
    """

    activities = []

    # ========================================================
    # RECENT USERS
    # ========================================================

    recent_users = (
        db.query(User)
        .order_by(User.id.desc())
        .limit(5)
        .all()
    )

    for user in recent_users:

        activities.append({
            "type": "user",
            "message": f"New {user.role} registered",
            "module": "User Management",
            "user": user.full_name,
            "user_id": user.id,
        })

    # ========================================================
    # RECENT WASTE INVENTORY
    # ========================================================

    recent_waste = (
        db.query(WasteInventory)
        .order_by(WasteInventory.id.desc())
        .limit(5)
        .all()
    )

    for waste in recent_waste:

        quantity = float(
            waste.quantity or 0
        )

        activities.append({
            "type": "waste",
            "message": (
                f"{quantity:g} Kg textile waste uploaded"
            ),
            "module": "Waste Inventory",
            "waste_id": waste.id,
        })

    # ========================================================
    # SORT ACTIVITY
    #
    # We don't have a guaranteed common timestamp on all
    # current models, so keep database order and limit.
    # ========================================================

    activities = activities[:10]

    # ========================================================
    # FALLBACK
    # ========================================================

    if not activities:

        activities = [
            {
                "type": "system",
                "message": "No recent platform activity",
                "module": "System",
            }
        ]

    # ========================================================
    # RESPONSE
    # ========================================================

    return {
        "success": True,
        "count": len(activities),
        "activities": activities,
    }