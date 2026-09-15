from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.schemas.activity import ActivityResponse
from app.services.activity_service import get_recent_activities
from app.core.security import admin_required
from app.core.security import get_current_user
from app.models.activity import Activity


router = APIRouter(
    prefix="/activity",
    tags=["Activity"]
)


@router.get("/recent")
def recent_activities(
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    return (
        db.query(Activity)
        .filter(
            Activity.company_code == current_user["company_code"]
        )
        .order_by(Activity.created_at.desc())
        .limit(10)
        .all()
    )