from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.core.security import get_current_user
from app.services.Sustainabilityanalytics_service import (
    get_analytics_dashboard,
)


router = APIRouter(
    prefix="/analytics",
    tags=["Analytics"],
)


@router.get("/dashboard")
def analytics_dashboard(
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    return get_analytics_dashboard(
        db=db,
        company_code=current_user.get(
            "company_code"
        ),
    )