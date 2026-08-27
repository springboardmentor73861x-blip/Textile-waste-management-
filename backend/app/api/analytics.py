from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.core.dependencies import get_current_user
from app.services.circular_analytics_service import CircularAnalyticsService

router = APIRouter(
    prefix="/api/v1/analytics",
    tags=["Circular Economy Analytics"],
)


@router.get("/circular-economy")
async def get_circular_economy_analytics(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    """
    Returns platform-wide Circular Economy Analytics:
    - Material Circularity Indicator (MCI) score & tier
    - Closed-Loop vs Open-Loop loop distribution
    - Economic value recovery breakdown
    - Temporal environmental savings trends
    """
    data = CircularAnalyticsService.get_circular_economy_analytics(db)
    return {
        "status": "success",
        "data": data,
    }


@router.get("/impact-trends")
async def get_impact_trends(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    """
    Returns 6-month historical time series of CO2 offsets, water savings, and MCI scores.
    """
    data = CircularAnalyticsService.get_circular_economy_analytics(db)
    return {
        "status": "success",
        "impact_trends": data["impact_trends"],
    }


@router.get("/waste-stream-flow")
async def get_waste_stream_flow(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    """
    Returns waste stream flow mapping across materials, recommended pathways, and offtakers.
    """
    data = CircularAnalyticsService.get_circular_economy_analytics(db)
    return {
        "status": "success",
        "waste_stream_flows": data["waste_stream_flows"],
    }
