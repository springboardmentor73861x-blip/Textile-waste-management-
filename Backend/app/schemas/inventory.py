from pydantic import BaseModel
from datetime import datetime


class InventoryCreate(BaseModel):
    batch_id: str
    fabric_type: str
    source: str
    quantity: int
    color: str
    condition: str
    collection_date: datetime
    waste_category: str
    recyclability: str
    status: str


class InventoryResponse(BaseModel):
    id: int
    batch_id: str
    fabric_type: str
    source: str
    quantity: int
    color: str
    condition: str
    collection_date: datetime
    waste_category: str
    recyclability: str
    status: str
    created_at: datetime

    class Config:
        from_attributes = True