from sqlalchemy import Column, Integer, String
from app.database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)

    full_name = Column(String(100), nullable=False)

    email = Column(
        String(100),
        unique=True,
        index=True,
        nullable=False
    )

    hashed_password = Column(
        String(255),
        nullable=False
    )

    # ==========================================================
    # ROLE-BASED ACCESS (Module 1 requirement)
    # ==========================================================

    role = Column(
        String(50),
        nullable=False,
        default="recycling_operator",
        server_default="recycling_operator",
    )
    # New — links a Google account; null for email/password users
    google_id = Column(
        String(255),
        unique=True,
        nullable=True,
        index=True,
    )