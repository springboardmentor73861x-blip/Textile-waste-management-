from datetime import datetime

from pydantic import BaseModel, ConfigDict


# ============================================================
# CREATE / UPDATE
# ============================================================

class ProductionWasteCreate(BaseModel):

    production_unit: str

    production_process: str | None = None

    machine: str | None = None

    waste_type: str

    waste_category: str | None = None

    quantity: float

    unit: str = "Kg"

    weight: float | None = None

    material_type: str | None = None

    fabric_type: str | None = None

    color: str | None = None

    condition: str | None = None

    location: str

    status: str = "Pending"

    notes: str | None = None


# ============================================================
# RESPONSE
# ============================================================

class ProductionWasteResponse(
    ProductionWasteCreate
):

    id: int

    created_at: datetime

    model_config = ConfigDict(
        from_attributes=True
    )