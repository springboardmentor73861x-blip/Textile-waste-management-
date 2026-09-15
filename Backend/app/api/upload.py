from fastapi import APIRouter, Depends, UploadFile, File
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.services.upload_service import save_uploaded_file
from app.core.security import get_current_user, admin_required
from app.schemas.upload import UploadResponse
from app.models.upload import Upload

router = APIRouter(
    prefix="/upload",
    tags=["Upload"]
)


@router.post("/", response_model=UploadResponse)
def upload_image(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    return save_uploaded_file(
        db=db,
        file=file,
        uploaded_by=current_user["email"]
    )

# ==========================
# Admin - View All Uploads
# ==========================

@router.get("/admin")
def admin_uploads(
    db: Session = Depends(get_db),
    _current_user: dict = Depends(admin_required)
):
    uploads = (
    db.query(Upload)
    .filter(
        Upload.company_code == _current_user["company_code"]
    )
    .order_by(Upload.created_at.desc())
    .all()
)

    return uploads    

# ============================================================
# Textile Manager - Latest 5 AI Predictions
# ============================================================

@router.get("/predictions")
def latest_predictions(
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    uploads = (
        db.query(Upload)
        .filter(
    Upload.uploaded_by == current_user["email"],
    Upload.company_code == current_user["company_code"]
)
        .order_by(Upload.created_at.desc())
        .limit(5)
        .all()
    )

    return uploads    