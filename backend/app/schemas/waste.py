from pydantic import BaseModel


class WasteCreate(BaseModel):
    waste_type: str
    quantity: float
    unit: str
    location: str
    status: str


class WasteResponse(WasteCreate):
    id: int

    class Config:
        from_attributes = True