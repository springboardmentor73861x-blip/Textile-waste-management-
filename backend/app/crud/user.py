from sqlalchemy.orm import Session
from app.models.user import User


def get_all_users(db: Session):
    return db.query(User).order_by(User.id.asc()).all()


def get_user_by_id(db: Session, user_id: int):
    return db.query(User).filter(User.id == user_id).first()


def update_user_role(db: Session, user: User, role: str):
    user.role = role
    db.commit()
    db.refresh(user)
    return user


def delete_user(db: Session, user: User):
    db.delete(user)
    db.commit()