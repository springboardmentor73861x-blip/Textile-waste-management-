from typing import Optional

from pydantic import BaseModel, ConfigDict


# ============================================================
# CREATE WASTE
# ============================================================

class WasteCreate(BaseModel):

    manufacturer_id: Optional[int] = None

    manufacturer: Optional[str] = None

    # --------------------------------------------------------
    # BASIC INFORMATION
    # --------------------------------------------------------

    waste_type: str

    quantity: float

    unit: str

    location: str

    status: str = "Available"

    # --------------------------------------------------------
    # TEXTILE INFORMATION
    # --------------------------------------------------------

    source: Optional[str] = None

    waste_category: Optional[str] = None

    color: Optional[str] = None

    condition: Optional[str] = None

    weight: Optional[float] = None

    notes: Optional[str] = None

    # --------------------------------------------------------
    # AI INFORMATION
    # --------------------------------------------------------

    material_type: Optional[str] = None

    fabric_type: Optional[str] = None

    class_index: Optional[int] = None

    confidence: Optional[float] = None

    composition: Optional[str] = None

    recyclability: Optional[str] = None

    biodegradability: Optional[str] = None

    environmental_impact: Optional[str] = None

    recommended_processing: Optional[str] = None

    recycling_method: Optional[str] = None

    disposal_method: Optional[str] = None

    potential_reuse: Optional[str] = None

    predicted_color: Optional[str] = None

    predicted_condition: Optional[str] = None


# ============================================================
# RESPONSE
# ============================================================

class WasteResponse(BaseModel):

    id: int

    manufacturer_id: Optional[int] = None

    manufacturer: Optional[str] = None

    # --------------------------------------------------------
    # BASIC INFORMATION
    # --------------------------------------------------------

    waste_type: str

    quantity: float

    unit: str

    location: str

    status: str

    # --------------------------------------------------------
    # TEXTILE INFORMATION
    # --------------------------------------------------------

    source: Optional[str] = None

    waste_category: Optional[str] = None

    color: Optional[str] = None

    condition: Optional[str] = None

    weight: Optional[float] = None

    notes: Optional[str] = None

    # --------------------------------------------------------
    # AI INFORMATION
    # --------------------------------------------------------

    material_type: Optional[str] = None

    fabric_type: Optional[str] = None

    class_index: Optional[int] = None

    confidence: Optional[float] = None

    composition: Optional[str] = None

    recyclability: Optional[str] = None

    biodegradability: Optional[str] = None

    environmental_impact: Optional[str] = None

    recommended_processing: Optional[str] = None

    recycling_method: Optional[str] = None

    disposal_method: Optional[str] = None

    potential_reuse: Optional[str] = None

    predicted_color: Optional[str] = None

    predicted_condition: Optional[str] = None

    # --------------------------------------------------------
    # PYDANTIC CONFIG
    # --------------------------------------------------------

    model_config = ConfigDict(
        from_attributes=True
    )