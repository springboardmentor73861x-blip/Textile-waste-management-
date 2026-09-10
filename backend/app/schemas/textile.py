from datetime import datetime

from pydantic import BaseModel


# ==========================================================
# TEXTILE RESPONSE
# ==========================================================

class TextileResponse(BaseModel):

    id: int

    textile_name: str | None = None

    description: str | None = None

    image_path: str

    # AI
    prediction: str | None = None

    confidence: float | None = None

    category: str | None = None

    recyclable: str | None = None

    recommendation: str | None = None

    top_predictions: str | None = None

    # Sustainability
    sustainability_score: float | None = None

    circularity_score: float | None = None

    recovery_category: str | None = None

    # Recommendation
    primary_action: str | None = None

    alternative_action: str | None = None

    # Environmental
    estimated_co2_savings_kg: float | None = None

    estimated_water_savings_liters: float | None = None

    estimated_landfill_diversion_kg: float | None = None

    estimated_resource_recovery_kg: float | None = None

    environmental_benefit_score: float | None = None

    environmental_benefit: str | None = None

    uploaded_at: datetime

    class Config:

        from_attributes = True


# ==========================================================
# TEXTILE UPDATE
# ==========================================================

class TextileUpdate(BaseModel):

    textile_name: str | None = None

    description: str | None = None