from fastapi import APIRouter, Depends, HTTPException, Query, status
from pydantic import BaseModel
from typing import Optional
from app.core.dependencies import get_current_user
from app.services.sustainability_engine import SustainabilityEngine
from app.services.circular_analytics_service import CircularAnalyticsService

router = APIRouter(
    prefix="/api/v1/sustainability",
    tags=["Sustainability Intelligence Engine"],
)


class LCAScenarioRequest(BaseModel):
    fabric_class: str
    weight_kg: float
    pathway: Optional[str] = "mechanical_recycling"
    condition: Optional[str] = "Good"


@router.get("/summary")
async def get_sustainability_summary(
    current_user=Depends(get_current_user),
):
    """
    Returns executive sustainability metrics & environmental footprint KPIs.
    """
    analytics = CircularAnalyticsService.get_circular_economy_analytics()
    return {
        "status": "success",
        "message": "Sustainability summary metrics retrieved successfully.",
        "data": analytics["summary"],
    }


@router.post("/lca-calculate")
async def calculate_lca_scenario(
    request: LCAScenarioRequest,
    current_user=Depends(get_current_user),
):
    """
    Real-time Life Cycle Assessment (LCA) Scenario Calculator.
    Simulates comparative environmental impacts across Virgin, Mechanical, Chemical, Upcycling, and Landfill.
    """
    scenario_result = SustainabilityEngine.calculate_lca_scenario(
        fabric_class=request.fabric_class,
        weight_kg=request.weight_kg,
        pathway=request.pathway,
    )
    item_impact = SustainabilityEngine.calculate_item_impact(
        fabric_class=request.fabric_class,
        weight_kg=request.weight_kg,
        condition=request.condition,
    )

    return {
        "status": "success",
        "message": "LCA scenario calculation completed.",
        "item_impact": item_impact,
        "lca_scenarios": scenario_result,
    }


@router.get("/footprint-breakdown")
async def get_footprint_breakdown(
    current_user=Depends(get_current_user),
):
    """
    Returns material-by-material LCA footprint benchmarks.
    """
    benchmarks = {}
    for fabric_class in SustainabilityEngine.LCA_BENCHMARKS:
        benchmarks[fabric_class] = SustainabilityEngine.calculate_item_impact(
            fabric_class=fabric_class,
            weight_kg=100.0,
            condition="Good",
        )
    return {
        "status": "success",
        "benchmark_weight_kg": 100.0,
        "footprint_breakdown": benchmarks,
    }
