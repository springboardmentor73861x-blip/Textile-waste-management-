from fastapi import (
    APIRouter,
    Depends,
    HTTPException,
    Response
)

from sqlalchemy.orm import Session

from app.db.database import get_db

from app.core.security import get_current_user

from app.models.report import Report
from app.core.security import get_current_user

from app.services.report_dashboard_service import (
    get_report_analytics_dashboard,
    generate_analytics_report,
    _create_report_pdf,
    export_analytics_excel
)


router = APIRouter(
    prefix="/report-dashboard",
    tags=["Report Dashboard"]
)


# =========================================================
# REPORTS & ANALYTICS DASHBOARD
# =========================================================

@router.get("/dashboard")
def report_analytics_dashboard(
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    return get_report_analytics_dashboard(
        db,
        current_user["company_code"]
    )


# =========================================================
# GENERATE REPORT
# =========================================================

@router.post("/generate")
def generate_report_dashboard_report(
    report_type: str,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):

    try:

        generated_by = (
            current_user.get("email")
            or current_user.get("username")
            or "Sustainability Manager"
        )

        report, _ = generate_analytics_report(
           db=db,
           report_type=report_type,
           generated_by=generated_by,
           company_name=current_user.get("company_name"),
           company_code=current_user.get("company_code")
)

        return {
            "success": True,
            "report_id": report.id,
            "report_type": report.report_type,
            "message": "Report generated successfully"
        }

    except Exception as e:

        db.rollback()

        raise HTTPException(
            status_code=500,
            detail=str(e)
        )


# =========================================================
# DOWNLOAD GENERATED REPORT
# =========================================================

@router.get("/download/{report_id}")
def download_report_dashboard_report(
    report_id: int,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):

    report = (
    db.query(Report)
    .filter(
        Report.id == report_id,
        Report.company_code == current_user["company_code"]
    )
    .first()
)

    if not report:

        raise HTTPException(
            status_code=404,
            detail="Report not found"
        )

    # Get current real dashboard data
    dashboard_data = (
    get_report_analytics_dashboard(
        db,
        current_user["company_code"]
    )
)

    # Generate PDF WITHOUT creating
    # another Report database record
    pdf_buffer = _create_report_pdf(
        dashboard_data=dashboard_data,
        report_type=report.report_type,
        generated_by=report.generated_by,
        report_id=report.id
    )

    # Increase download count
    report.downloads = (
        report.downloads or 0
    ) + 1

    db.commit()

    filename = (
        report.report_type
        .replace(" ", "_")
        .replace("/", "_")
        + ".pdf"
    )

    return Response(
        content=pdf_buffer.getvalue(),
        media_type="application/pdf",
        headers={
            "Content-Disposition":
                f'attachment; filename="{filename}"'
        }
    )

# =========================================================
# EXPORT ANALYTICS TO EXCEL
# =========================================================

@router.get("/export/excel")
def export_report_dashboard_excel(
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):

    try:

        excel_buffer = export_analytics_excel(
    db,
    current_user["company_code"]
)

        return Response(
            content=excel_buffer.getvalue(),
            media_type=(
                "application/vnd.openxmlformats-"
                "officedocument.spreadsheetml.sheet"
            ),
            headers={
                "Content-Disposition":
                    'attachment; filename="Reports_Analytics.xlsx"'
            }
        )

    except Exception as e:

        db.rollback()

        raise HTTPException(
            status_code=500,
            detail=str(e)
        )    