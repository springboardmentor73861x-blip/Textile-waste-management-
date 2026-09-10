from fastapi import APIRouter, Depends
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.core.auth import get_current_user
from app.models.user import User
from app.database import get_db


router = APIRouter(
    prefix="/users",
    tags=["Users"]
)


# ==========================================================
# UPDATE USER SCHEMA
# ==========================================================

class UserUpdate(BaseModel):
    full_name: str


# ==========================================================
# GET CURRENT USER
# ==========================================================

@router.get("/me")
def get_profile(
    current_user: User = Depends(get_current_user)
):
    return {
        "message": "Authenticated successfully",
        "id": current_user.id,
        "full_name": current_user.full_name,
        "email": current_user.email,
        "role": current_user.role,
        "is_google_account": current_user.google_id is not None,
    }


# ==========================================================
# UPDATE CURRENT USER
# ==========================================================

@router.put("/me")
def update_profile(
    data: UserUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Update full name
    current_user.full_name = data.full_name

    # Save changes
    db.commit()

    # Refresh object from database
    db.refresh(current_user)

    return {
        "message": "Profile updated successfully",
        "id": current_user.id,
        "full_name": current_user.full_name,
        "email": current_user.email
    }
    
from app.core.security import verify_password, hash_password

class PasswordChange(BaseModel):
    current_password: str
    new_password: str

@router.put("/me/password")
def change_password(
    data: PasswordChange,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if not current_user.hashed_password:
        raise HTTPException(
            status_code=400,
            detail="Password change is not available for Google-linked accounts.",
        )

    if not verify_password(
        data.current_password,
        current_user.hashed_password,
    ):
        raise HTTPException(
            status_code=400,
            detail="Current password is incorrect.",
        )

    if len(data.new_password) < 6:
        raise HTTPException(
            status_code=400,
            detail="New password must be at least 6 characters.",
        )

    current_user.hashed_password = hash_password(data.new_password)
    db.commit()

    return {"success": True, "message": "Password updated successfully."}    