from sqlalchemy.orm import Session
from app.models.user import User
from app.schemas.user import UserCreate
from app.core.security import hash_password

import secrets
import string


def get_user_by_email(db: Session, email: str):
    return db.query(User).filter(User.email == email).first()


def generate_company_code(db: Session):
    """
    Generate a unique company code.
    Example: TXL-A7K92P
    """

    characters = string.ascii_uppercase + string.digits

    while True:
        code = "TXL-" + "".join(
            secrets.choice(characters) for _ in range(6)
        )

        existing_company = (
            db.query(User)
            .filter(User.company_code == code)
            .first()
        )

        if not existing_company:
            return code


def create_user(db: Session, user: UserCreate):
    hashed_password = hash_password(user.password)
    role = user.role

    # -------------------------------------------------
    # ADMINISTRATOR
    # -------------------------------------------------
    if role == "admin":

        if not user.company_name:
            raise ValueError(
                "Company name is required for Administrator registration"
            )

        company_code = generate_company_code(db)

        new_user = User(
            username=user.username,
            email=user.email,
            password=hashed_password,
            role="admin",
            company_name=user.company_name.strip(),
            company_code=company_code
        )

    # -------------------------------------------------
    # OTHER ROLES
    # -------------------------------------------------
    elif role in [
        "recycler",
        "sustainability_manager",
        "textile_manager"
    ]:

        if not user.company_code:
            raise ValueError(
                "Company code is required for this role"
            )

        company_code = user.company_code.strip().upper()

        company_admin = (
            db.query(User)
            .filter(
                User.company_code == company_code,
                User.role == "admin"
            )
            .first()
        )

        if not company_admin:
            raise ValueError(
                "Invalid Company Code"
            )

        new_user = User(
            username=user.username,
            email=user.email,
            password=hashed_password,
            role=role,
            company_name=company_admin.company_name,
            company_code=company_admin.company_code
        )

    else:
        raise ValueError(
            "Invalid role selected"
        )

    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    return new_user


def authenticate_user(db: Session, email: str):
    return db.query(User).filter(User.email == email).first()


# ==========================
# Admin Functions
# ==========================

def get_all_users(
    db: Session,
    company_code: str | None
):
    return (
        db.query(User)
        .filter(
            User.company_code == company_code
        )
        .all()
    )


def get_user_by_id(
    db: Session,
    user_id: int,
    company_code: str | None = None
):
    return (
        db.query(User)
        .filter(
            User.id == user_id,
            User.company_code == company_code
        )
        .first()
    )


def update_user_role(
    db: Session,
    user_id: int,
    role: str,
    company_code: str | None
):

    user = (
        db.query(User)
        .filter(
            User.id == user_id,
            User.company_code == company_code
        )
        .first()
    )

    if not user:
        return None

    user.role = role

    db.commit()
    db.refresh(user)

    return user


def delete_user(
    db: Session,
    user_id: int,
    company_code: str | None
):

    user = (
        db.query(User)
        .filter(
            User.id == user_id,
            User.company_code == company_code
        )
        .first()
    )

    if not user:
        return None

    db.delete(user)
    db.commit()

    return user