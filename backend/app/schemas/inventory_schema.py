from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class InventoryCreate(BaseModel):
    item_name: str
    category: str
    material: str
    color: Optional[str] = None
    weight: float
    quantity: int
    condition: str
    location: Optional[str] = None
    image_url: Optional[str] = None


class InventoryUpdate(BaseModel):
    item_name: Optional[str] = None
    category: Optional[str] = None
    material: Optional[str] = None
    color: Optional[str] = None
    weight: Optional[float] = None
    quantity: Optional[int] = None
    condition: Optional[str] = None
    location: Optional[str] = None
    image_url: Optional[str] = None


class InventoryResponse(BaseModel):
    id: int
    item_name: str
    category: str
    material: str
    color: Optional[str]
    weight: float
    quantity: int
    condition: str
    location: Optional[str]
    image_url: Optional[str]
    created_by: int
    created_at: datetime

    class Config:
        from_attributes = True