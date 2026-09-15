from sqlalchemy import Column, Integer, String, DateTime
from datetime import datetime

from app.db.database import Base


class Activity(Base):
    __tablename__ = "activities"

    id = Column(Integer, primary_key=True, index=True)

    username = Column(String, nullable=False)

    role = Column(
        String,
        nullable=False,
        default="user"
    )
    company_name = Column(String, nullable=True)
    company_code = Column(String, nullable=True, index=True)

    action = Column(String, nullable=False)

    status = Column(String, nullable=False)

    created_at = Column(
        DateTime,
        default=datetime.utcnow
    )