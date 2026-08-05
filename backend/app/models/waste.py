from sqlalchemy import Column, Integer, String, Float
from app.database import Base


class WasteInventory(Base):
    __tablename__ = "waste_inventory"

    id = Column(Integer, primary_key=True, index=True)
    waste_type = Column(String(100), nullable=False)
    quantity = Column(Float, nullable=False)
    unit = Column(String(20), nullable=False)
    location = Column(String(100), nullable=False)
    status = Column(String(50), nullable=False)