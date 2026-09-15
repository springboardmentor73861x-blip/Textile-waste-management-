from pydantic import BaseModel
from typing import List


class SustainabilityStats(BaseModel):
    total_textile_waste: int
    recyclable_waste: int
    reusable_waste: int
    sustainability_score: float
    co2_saved: float

    water_saved: float

    land_saved: float

    diverted_quantity: float

    co2_unit: str

    water_unit: str

    land_unit: str

    environmental_impact_estimated: bool
    


class WasteOverviewItem(BaseModel):
    month: str
    value: int


class FabricSustainabilityItem(BaseModel):
    fabric_type: str
    waste_quantity: int
    recyclability: float
    reuse_potential: float
    performance: str


class RecentAnalysisItem(BaseModel):
    material: str
    status: str
    score: float
    recommendation: str
    time: str


class SustainabilityDashboardResponse(BaseModel):
    stats: SustainabilityStats
    waste_overview: List[WasteOverviewItem]
    fabric_analysis: List[FabricSustainabilityItem]
    recent_analysis: List[RecentAnalysisItem]