from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.core.security import get_current_user

from app.schemas.textile_dashboard import (
    TextileDashboardResponse
)

from app.services.textile_dashboard_service import (
    get_textile_dashboard
)


router = APIRouter(
    prefix="/textile-dashboard",
    tags=["Textile Dashboard"]
)


@router.get(
    "/",
    response_model=TextileDashboardResponse
)
def textile_dashboard(
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):

    return get_textile_dashboard(db,current_user["company_code"])