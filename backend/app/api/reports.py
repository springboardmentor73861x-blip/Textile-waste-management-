from fastapi import APIRouter, Depends, Response
from app.core.dependencies import get_current_user
from app.services.report_service import ReportService

router = APIRouter(
    prefix="/api/v1/reports",
    tags=["Waste Classification Reports"],
)


@router.get("/waste-classification")
async def generate_waste_classification_report(
    current_user=Depends(get_current_user),
):
    """
    Generates a structured Waste Classification & Recyclability Assessment Report.
    """
    report = ReportService.generate_summary_report()
    return {
        "status": "success",
        "data": report,
    }


@router.get("/export/csv")
async def export_waste_classification_report_csv(
    current_user=Depends(get_current_user),
):
    """
    Exports the waste classification report as a CSV document.
    """
    csv_content = ReportService.generate_csv_report()
    return Response(
        content=csv_content,
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=textile_waste_audit_report.csv"},
    )
