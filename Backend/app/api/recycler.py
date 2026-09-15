from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.core.security import get_current_user
from app.db.database import get_db
from app.services.recycler_service import (
    get_recycler_dashboard,
    update_batch_status,
)


router = APIRouter(
    prefix="/recycler",
    tags=["Recycler"],
)


# ============================================================
# STATUS REQUEST
# ============================================================

class BatchStatusUpdate(BaseModel):
    status: str


# ============================================================
# RECYCLER DASHBOARD
# ============================================================

@router.get("/dashboard")
def recycler_dashboard(
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    """
    Company-scoped Recycler Dashboard.
    """

    company_code = current_user.get(
        "company_code"
    )

    if not company_code:
        raise HTTPException(
            status_code=400,
            detail="Company information is missing from the current user.",
        )

    return get_recycler_dashboard(
        db=db,
        company_code=company_code,
    )


# ============================================================
# BATCH LIST
# ============================================================

@router.get("/batches")
def recycler_batches(
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    """
    Return all recycling batches for the
    logged-in user's company.
    """

    company_code = current_user.get(
        "company_code"
    )

    if not company_code:
        raise HTTPException(
            status_code=400,
            detail="Company information is missing from the current user.",
        )

    dashboard = get_recycler_dashboard(
        db=db,
        company_code=company_code,
    )

    return {
        "company_code": company_code,
        "batches": dashboard["recent_batches"],
    }


# ============================================================
# RECYCLING & RECOVERY
# ============================================================

@router.get("/recovery")
def recycler_recovery(
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    """
    Company-scoped Recycling & Recovery data.
    """

    company_code = current_user.get("company_code")

    if not company_code:
        raise HTTPException(
            status_code=400,
            detail="Company information is missing from the current user.",
        )

    dashboard = get_recycler_dashboard(
        db=db,
        company_code=company_code,
    )

    return {
        "company_code": company_code,
        "summary": dashboard.get("summary", {}),
        "recovery_recommendations": dashboard.get(
            "recovery_recommendations", []
        ),
        "recent_batches": dashboard.get(
            "recent_batches", []
        ),
    }

# ============================================================
# UPDATE BATCH STATUS
# ============================================================

@router.patch("/batches/{batch_id}/status")
def recycler_update_batch_status(
    batch_id: str,
    payload: BatchStatusUpdate,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    """
    Update a recycling batch status.

    Status flow:
    Available
    -> Under Processing
    -> Recovered
    -> Completed
    """

    company_code = current_user.get(
        "company_code"
    )

    if not company_code:
        raise HTTPException(
            status_code=400,
            detail="Company information is missing from the current user.",
        )

    try:
        result = update_batch_status(
            db=db,
            batch_id=batch_id,
            company_code=company_code,
            status=payload.status,
        )
    except ValueError as exc:
        raise HTTPException(
            status_code=400,
            detail=str(exc),
        )

    if not result:
        raise HTTPException(
            status_code=404,
            detail="Batch not found for this company.",
        )

    return {
        "message": "Batch status updated successfully.",
        "batch": result,
    }