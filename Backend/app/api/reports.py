from io import BytesIO

from fastapi import (
    APIRouter,
    Depends,
    HTTPException,
    Response
)

from sqlalchemy.orm import Session

from app.db.database import get_db
from app.core.security import admin_required

from app.schemas.report import (
    ReportResponse,
    ReportDashboardResponse
)

from app.services.report_service import (
    get_report_dashboard,
    generate_report,
    get_report_by_id,
    increment_download,
    create_download_activity,
    get_report_source_data
)

from app.models.user import User

from reportlab.lib import colors
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.enums import TA_CENTER
from reportlab.lib.units import mm
from reportlab.platypus import (
    SimpleDocTemplate,
    Paragraph,
    Spacer,
    Table,
    TableStyle
)


router = APIRouter(
    prefix="/reports",
    tags=["Reports"]
)


# =========================================================
# REPORT DASHBOARD
# =========================================================

@router.get(
    "/dashboard",
    response_model=ReportDashboardResponse
)
def reports_dashboard(
    db: Session = Depends(get_db),
    current_user: dict = Depends(admin_required)
):

    return get_report_dashboard(db, current_user["company_code"])


# =========================================================
# REPORT SOURCE DATA
# =========================================================

@router.get(
    "/source-data"
)
def report_source_data(
    db: Session = Depends(get_db),
    current_user: dict = Depends(admin_required)
):

    return get_report_source_data(db,current_user["company_code"])


# =========================================================
# GENERATE REPORT
# =========================================================

@router.post(
    "/generate",
    response_model=ReportResponse
)
def create_report(
    report_name: str,
    report_type: str,
    db: Session = Depends(get_db),
    current_user: dict = Depends(admin_required)
):

    current_db_user = (
        db.query(User)
        .filter(
            User.email == current_user["email"]
        )
        .first()
    )

    if not current_db_user:
        raise HTTPException(
            status_code=404,
            detail="User not found"
        )

    return generate_report(
        db=db,
        report_name=report_name,
        report_type=report_type,
        generated_by=current_db_user.username,
        role=current_db_user.role,
        company_name=current_db_user.company_name,
        company_code=current_db_user.company_code
    )


# =========================================================
# DOWNLOAD REPORT AS PDF
# =========================================================

@router.get(
    "/{report_id}/download"
)
def download_report(
    report_id: int,
    db: Session = Depends(get_db),
    current_user: dict = Depends(admin_required)
):

    # -----------------------------------------------------
    # GET REPORT
    # -----------------------------------------------------

    report = get_report_by_id(
        db,
        report_id,
        current_user["company_code"]
    )

    if not report:
        raise HTTPException(
            status_code=404,
            detail="Report not found"
        )

    # -----------------------------------------------------
    # GET CURRENT USER
    # -----------------------------------------------------

    current_db_user = (
        db.query(User)
        .filter(
            User.email == current_user["email"]
        )
        .first()
    )

    if not current_db_user:
        raise HTTPException(
            status_code=404,
            detail="User not found"
        )

    # -----------------------------------------------------
    # INCREASE DOWNLOAD COUNT
    # -----------------------------------------------------

    increment_download(
        db,
        report
    )

    # -----------------------------------------------------
    # STORE DOWNLOAD ACTIVITY
    # -----------------------------------------------------

    create_download_activity(
        db=db,
        report=report,
        username=current_db_user.username,
        role=current_db_user.role
    )

    # -----------------------------------------------------
    # SOURCE DATA
    # -----------------------------------------------------

    source_data = get_report_source_data(
        db,
        current_db_user.company_code
    )

    # -----------------------------------------------------
    # CREATE PDF IN MEMORY
    # -----------------------------------------------------

    pdf_buffer = BytesIO()

    document = SimpleDocTemplate(
        pdf_buffer,
        pagesize=A4,
        rightMargin=20 * mm,
        leftMargin=20 * mm,
        topMargin=20 * mm,
        bottomMargin=20 * mm
    )

    styles = getSampleStyleSheet()

    title_style = ParagraphStyle(
        "ReportTitle",
        parent=styles["Title"],
        alignment=TA_CENTER,
        fontSize=20,
        leading=24,
        spaceAfter=8
    )

    subtitle_style = ParagraphStyle(
        "ReportSubtitle",
        parent=styles["Normal"],
        alignment=TA_CENTER,
        fontSize=10,
        leading=14,
        textColor=colors.grey,
        spaceAfter=20
    )

    heading_style = ParagraphStyle(
        "SectionHeading",
        parent=styles["Heading2"],
        fontSize=14,
        leading=18,
        spaceBefore=12,
        spaceAfter=10
    )

    normal_style = ParagraphStyle(
        "NormalText",
        parent=styles["Normal"],
        fontSize=10,
        leading=14
    )

    # -----------------------------------------------------
    # PDF CONTENT
    # -----------------------------------------------------

    story = []

    story.append(
        Paragraph(
            "Textile Waste Intelligence Platform",
            title_style
        )
    )

    story.append(
        Paragraph(
            f"{report.report_name}<br/>"
            f"Report Type: {report.report_type}<br/>"
            f"Generated By: {report.generated_by}<br/>"
            f"Generated: {report.created_at}",
            subtitle_style
        )
    )

    # -----------------------------------------------------
    # SUMMARY
    # -----------------------------------------------------

    story.append(
        Paragraph(
            "Dashboard Summary",
            heading_style
        )
    )

    summary_data = [
        [
            Paragraph("<b>Total Users</b>", normal_style),
            Paragraph("<b>Total Inventory</b>", normal_style),
            Paragraph("<b>Total Uploads</b>", normal_style)
        ],
        [
            str(source_data["total_users"]),
            str(source_data["total_inventory"]),
            str(source_data["total_uploads"])
        ]
    ]

    summary_table = Table(
        summary_data,
        colWidths=[
            55 * mm,
            55 * mm,
            55 * mm
        ]
    )

    summary_table.setStyle(
        TableStyle([
            (
                "BACKGROUND",
                (0, 0),
                (-1, 0),
                colors.HexColor("#F1F5FA")
            ),
            (
                "BOX",
                (0, 0),
                (-1, -1),
                0.8,
                colors.HexColor("#D9E2EF")
            ),
            (
                "INNERGRID",
                (0, 0),
                (-1, -1),
                0.5,
                colors.HexColor("#D9E2EF")
            ),
            (
                "ALIGN",
                (0, 0),
                (-1, -1),
                "CENTER"
            ),
            (
                "VALIGN",
                (0, 0),
                (-1, -1),
                "MIDDLE"
            ),
            (
                "TOPPADDING",
                (0, 0),
                (-1, -1),
                10
            ),
            (
                "BOTTOMPADDING",
                (0, 0),
                (-1, -1),
                10
            )
        ])
    )

    story.append(summary_table)

    story.append(Spacer(1, 20))

    # -----------------------------------------------------
    # REPORT INFORMATION
    # -----------------------------------------------------

    story.append(
        Paragraph(
            "Report Information",
            heading_style
        )
    )

    report_data = [
        [
            Paragraph("<b>Report Name</b>", normal_style),
            Paragraph(
                str(report.report_name),
                normal_style
            )
        ],
        [
            Paragraph("<b>Report Type</b>", normal_style),
            Paragraph(
                str(report.report_type),
                normal_style
            )
        ],
        [
            Paragraph("<b>Generated By</b>", normal_style),
            Paragraph(
                str(report.generated_by),
                normal_style
            )
        ],
        [
            Paragraph("<b>Status</b>", normal_style),
            Paragraph(
                str(report.status),
                normal_style
            )
        ],
        [
            Paragraph("<b>Total Downloads</b>", normal_style),
            Paragraph(
                str(report.downloads),
                normal_style
            )
        ]
    ]

    report_table = Table(
        report_data,
        colWidths=[
            55 * mm,
            110 * mm
        ]
    )

    report_table.setStyle(
        TableStyle([
            (
                "BACKGROUND",
                (0, 0),
                (0, -1),
                colors.HexColor("#F1F5FA")
            ),
            (
                "BOX",
                (0, 0),
                (-1, -1),
                0.8,
                colors.HexColor("#D9E2EF")
            ),
            (
                "INNERGRID",
                (0, 0),
                (-1, -1),
                0.5,
                colors.HexColor("#D9E2EF")
            ),
            (
                "VALIGN",
                (0, 0),
                (-1, -1),
                "MIDDLE"
            ),
            (
                "TOPPADDING",
                (0, 0),
                (-1, -1),
                9
            ),
            (
                "BOTTOMPADDING",
                (0, 0),
                (-1, -1),
                9
            )
        ])
    )

    story.append(report_table)

    story.append(Spacer(1, 20))

    story.append(
        Paragraph(
            "This report was generated from the "
            "Textile Waste Intelligence Platform "
            "administrative dashboard.",
            subtitle_style
        )
    )

    # -----------------------------------------------------
    # BUILD PDF
    # -----------------------------------------------------

    document.build(story)

    pdf_buffer.seek(0)

    pdf_content = pdf_buffer.getvalue()

    # -----------------------------------------------------
    # SAFE FILE NAME
    # -----------------------------------------------------

    filename = (
        report.report_name
        .replace(" ", "-")
        .replace("/", "-")
        .replace("\\", "-")
    )

    if not filename.lower().endswith(".pdf"):
        filename += ".pdf"

    # -----------------------------------------------------
    # RETURN PDF
    # -----------------------------------------------------

    return Response(
        content=pdf_content,
        media_type="application/pdf",
        headers={
            "Content-Disposition":
                f'attachment; filename="{filename}"'
        }
    )