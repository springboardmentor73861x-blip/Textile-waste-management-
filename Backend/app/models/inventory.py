from sqlalchemy import Column, Integer, String, DateTime
from datetime import datetime
from app.db.database import Base


class Inventory(Base):
    __tablename__ = "inventory"

    id = Column(Integer, primary_key=True, index=True)

    batch_id = Column(String, unique=True, index=True)

    fabric_type = Column(String, nullable=False)

    source = Column(String, nullable=False)

    quantity = Column(Integer, default=1)

    color = Column(String)

    condition = Column(String)

    collection_date = Column(DateTime)

    waste_category = Column(String)

    recyclability = Column(String)

    status = Column(String, default="Available")
    company_name = Column(String, nullable=True)
    company_code = Column(String, nullable=True, index=True)   

    created_at = Column(DateTime, default=datetime.utcnow)