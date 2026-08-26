from pydantic import BaseModel
from typing import Optional


# ============================================================
# CREATE WASTE REQUEST
# ============================================================

class WasteRequestCreate(BaseModel):

    # Registered manufacturer name
    manufacturer: Optional[str] = None

    # Better option: registered manufacturer user ID
    manufacturer_id: Optional[int] = None

    recycler: str

    material: str

    quantity: float

    unit: str = "Kg"

    status: str = "Pending"

    machine: Optional[str] = None

    progress: int = 0

    notes: Optional[str] = None


# ============================================================
# UPDATE STATUS
# ============================================================

class WasteRequestStatusUpdate(BaseModel):

    status: str


# ============================================================
# UPDATE PROCESSING
# ============================================================

class WasteRequestProcessingUpdate(BaseModel):

    machine: Optional[str] = None

    progress: int


# ============================================================
# RESPONSE
# ============================================================

class WasteRequestResponse(BaseModel):

    id: int

    manufacturer: str

    recycler: str

    material: str

    quantity: float

    unit: str

    status: str

    machine: Optional[str] = None

    progress: int

    notes: Optional[str] = None

    class Config:
        from_attributes = True