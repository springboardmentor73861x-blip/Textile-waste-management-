from sqlalchemy.orm import Session

from app.models.user import User
from app.repositories.user_repository import UserRepository
from app.schemas.user_schema import UserRegister
from app.core.security import (
    hash_password,
    verify_password,
    create_access_token,
)


class AuthService:

    @staticmethod
    def register_user(
        db: Session,
        user_data: UserRegister,
    ):
        existing_user = UserRepository.get_by_email(
            db,
            user_data.email,
        )

        from fastapi import HTTPException, status

        if existing_user:
          raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered.",

        )
        new_user = User(
            full_name=user_data.full_name,
            email=user_data.email,
            password=hash_password(user_data.password),
            role=user_data.role,
        )

        return UserRepository.create_user(
            db,
            new_user,
        )

    @staticmethod
    def login_user(
        db: Session,
        email: str,
        password: str,
    ):
        user = UserRepository.get_by_email(
            db,
            email,
        )

        if user is None:
            return None

        if not verify_password(
            password,
            user.password,
        ):
            return None

        token = create_access_token(
            {
                "sub": user.email,
                "role": user.role,
            }
        )

        return {
            "access_token": token,
            "token_type": "bearer",
            "user": {
                "id": user.id,
                "full_name": user.full_name,
                "email": user.email,
                "role": user.role,
                "is_active": user.is_active,
            },
        }