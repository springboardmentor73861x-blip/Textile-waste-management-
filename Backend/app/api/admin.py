from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.core.security import admin_required

from app.schemas.user import UserResponse
from app.schemas.admin_dashboard import AdminDashboardResponse

from app.models.user import User
from app.models.inventory import Inventory
from app.models.upload import Upload
from app.models.activity import Activity
from app.models.report import Report

from app.services.activity_service import create_activity

from app.services.user_service import (
    get_all_users,
    update_user_role,
    delete_user
)


router = APIRouter(
    prefix="/admin",
    tags=["Admin"]
)


# ==========================
# View All Users
# ==========================

@router.get(
    "/users",
    response_model=list[UserResponse]
)
def view_users(
    db: Session = Depends(get_db),
    current_user: dict = Depends(admin_required)
):
    return get_all_users(db, current_user["company_code"])


# ==========================
# Change User Role
# ==========================

@router.put("/users/{user_id}")
def change_role(
    user_id: int,
    role: str,
    db: Session = Depends(get_db),
    current_user: dict = Depends(admin_required)
):

    user = update_user_role(db, user_id, role, current_user["company_code"])

    if not user:
        raise HTTPException(
            status_code=404,
            detail="User not found"
        )

    # Find admin username for activity log
    admin_user = (
        db.query(User)
        .filter(User.email == current_user["email"])
        .first()
    )

    if admin_user:
        create_activity(
            db=db,
            username=admin_user.username,
            role=admin_user.role,
            action=f"Updated user role for user ID {user_id}",
            status="Success"
        )

    return {
        "message": "Role Updated Successfully"
    }


# ==========================
# Delete User
# ==========================

@router.delete("/users/{user_id}")
def remove_user(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: dict = Depends(admin_required)
):

    user = delete_user(db, user_id, current_user["company_code"])

    if not user:
        raise HTTPException(
            status_code=404,
            detail="User not found"
        )

    # Find admin username for activity log
    admin_user = (
        db.query(User)
        .filter(User.email == current_user["email"])
        .first()
    )

    if admin_user:
        create_activity(
            db=db,
            username=admin_user.username,
            role=admin_user.role,
            action=f"Deleted user ID {user_id}",
            status="Success"
        )

    return {
        "message": "User Deleted Successfully"
    }


# ==========================
# Admin Dashboard
# ==========================

@router.get(
    "/dashboard",
    response_model=AdminDashboardResponse
)
def admin_dashboard(
    db: Session = Depends(get_db),
    current_user: dict = Depends(admin_required)
):
    company_code = current_user["company_code"]

    total_users = (
        db.query(User)
       .filter(User.company_code == company_code)
       .count()
)

    total_inventory = ( 
        db.query(Inventory)
       .filter(Inventory.company_code == company_code)
       .count()
)

    total_uploads = (
        db.query(Upload)
        .filter(Upload.company_code == company_code)
        .count()
)

    total_reports = (
        db.query(Report)
        .filter(Report.company_code == company_code)
        .count()
)

    recent_activity = (
    db.query(Activity)
    .filter(
        Activity.company_code == current_user["company_code"]
    )
    .order_by(Activity.created_at.desc())
    .limit(10)
    .all()
)

    return {
        "total_users": total_users,
        "total_inventory": total_inventory,
        "total_uploads": total_uploads,
        "total_reports": total_reports,
        "recent_activity": recent_activity
    }