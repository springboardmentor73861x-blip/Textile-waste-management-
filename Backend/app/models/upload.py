from sqlalchemy import Column, Integer, String, DateTime
from datetime import datetime

from app.db.database import Base


class Upload(Base):
    __tablename__ = "uploads"

    id = Column(Integer, primary_key=True, index=True)

    filename = Column(String, nullable=False)

    file_path = Column(String, nullable=False)

    uploaded_by = Column(String, nullable=False)

    company_name = Column(String, nullable=True)
    company_code = Column(String, nullable=True, index=True)

    material = Column(String)
    waste_type = Column(String)
    confidence = Column(String)

    recycle = Column(String)
    reuse = Column(String)
    repair = Column(String)

    score = Column(Integer)
    
    created_at = Column(DateTime, default=datetime.utcnow)