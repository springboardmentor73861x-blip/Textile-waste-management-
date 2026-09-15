from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
#new-for authorizze button
from fastapi.security import OAuth2PasswordRequestForm

from app.core.security import get_current_user
from app.db.database import get_db
from app.schemas.user import UserCreate, UserResponse, UserLogin
from app.services.activity_service import create_activity
from app.services.user_service import (
    create_user,
    get_user_by_email,
    authenticate_user
)
from app.core.security import verify_password, create_access_token

router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post("/register", response_model=UserResponse)
def register(user: UserCreate, db: Session = Depends(get_db)):

    existing_user = get_user_by_email(db, user.email)

    if existing_user:
        raise HTTPException(
            status_code=400,
            detail="Email already registered"
        )

    try:
        new_user = create_user(db, user)

    except ValueError as e:
        raise HTTPException(
            status_code=400,
            detail=str(e)
        )

    create_activity(
        db=db,
        username=new_user.username,
        role=new_user.role,
        action="Register",
        status="Success"
    )

    return new_user




@router.post("/login")
def login(user: UserLogin, db: Session = Depends(get_db)):

    db_user = authenticate_user(db, user.email)

    if not db_user:
        raise HTTPException(
            status_code=401,
            detail="Invalid Email"
        )

    if not verify_password(user.password, db_user.password):
        raise HTTPException(
            status_code=401,
            detail="Invalid Password"
        )

    token = create_access_token({
        "sub": db_user.email,
        "role": db_user.role,
        "company_name": db_user.company_name,
        "company_code": db_user.company_code
    })

    create_activity(
        db=db,
        username=db_user.username,
        role=db_user.role,
        action="Login",
        status="Success"
    )

    return {
        "access_token": token,
        "token_type": "bearer"
    }


@router.post("/token")
def token_login(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db)
):

    db_user = authenticate_user(db, form_data.username)

    if not db_user:
        raise HTTPException(status_code=401, detail="Invalid Email")

    if not verify_password(form_data.password, db_user.password):
        raise HTTPException(status_code=401, detail="Invalid Password")

    token = create_access_token(
        {
            "sub": db_user.email,
            "role": db_user.role,
            "company_name": db_user.company_name,
            "company_code": db_user.company_code
        }
    )

    return {
    "access_token": token,
    "token_type": "bearer",
    "role": db_user.role,
    "email": db_user.email,
    "username": db_user.username
}


@router.get("/me")
def get_profile(
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    db_user = get_user_by_email(db, current_user["email"])

    if not db_user:
        raise HTTPException(status_code=404, detail="User not found")

    return {
        "username": db_user.username,
        "email": db_user.email,
        "role": db_user.role,
        "company_name": db_user.company_name,
    "company_code": db_user.company_code
    }