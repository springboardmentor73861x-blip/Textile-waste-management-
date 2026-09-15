from sqlalchemy import Column, Integer, String, DateTime
from datetime import datetime

from app.db.database import Base


class Report(Base):
    __tablename__ = "reports"

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    report_name = Column(
        String,
        nullable=False
    )

    report_type = Column(
        String,
        nullable=False
    )

    generated_by = Column(
        String,
        nullable=False,
    )
    company_name = Column(String, nullable=True)
    company_code = Column(String, nullable=True, index=True)


    status = Column(
        String,
        nullable=False,
        default="Completed"
    )

    downloads = Column(
        Integer,
        nullable=False,
        default=0
    )

    created_at = Column(
        DateTime,
        default=datetime.utcnow
    )


class ReportActivity(Base):
    __tablename__ = "report_activities"

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    report_id = Column(
        Integer,
        nullable=False
    )

    report_name = Column(
        String,
        nullable=False
    )

    report_type = Column(
        String,
        nullable=False
    )

    action = Column(
        String,
        nullable=False
    )

    username = Column(
        String,
        nullable=False
    )

    role = Column(
        String,
        nullable=False,
        default="user"
    )
    company_name = Column(String, nullable=True)
    company_code = Column(String, nullable=True, index=True)

    status = Column(
        String,
        nullable=False,
        default="Success"
    )

    created_at = Column(
        DateTime,
        default=datetime.utcnow
    )