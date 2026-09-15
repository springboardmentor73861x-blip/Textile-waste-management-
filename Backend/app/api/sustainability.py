from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.core.security import get_current_user
from app.db.database import get_db
from fastapi import APIRouter, Depends, Response

from app.schemas.sustainability import (
    SustainabilityDashboardResponse,
)
from app.services.sustainability import (
    get_sustainability_dashboard,
)


router = APIRouter(
    prefix="/sustainability",
    tags=["Sustainability"],
)


@router.get(
    "/dashboard",
    response_model=SustainabilityDashboardResponse,
)
def sustainability_dashboard(
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    return get_sustainability_dashboard(
        db,
        current_user["company_code"]
    )

# =========================================================
# SUSTAINABILITY PDF REPORT
# =========================================================

@router.get("/generate-report")
def generate_sustainability_report(
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    from io import BytesIO

    from reportlab.lib import colors
    from reportlab.lib.pagesizes import A4
    from reportlab.lib.styles import (
        getSampleStyleSheet,
        ParagraphStyle,
    )
    from reportlab.lib.enums import TA_CENTER
    from reportlab.lib.units import mm
    from reportlab.platypus import (
        SimpleDocTemplate,
        Paragraph,
        Spacer,
        Table,
        TableStyle,
    )

    from app.services.report_service import get_report_source_data

    company_code = current_user.get("company_code")
    company_name = current_user.get("company_name") or "Company"

    source_data = get_report_source_data(
        db,
        company_code
    )

    pdf_buffer = BytesIO()

    document = SimpleDocTemplate(
        pdf_buffer,
        pagesize=A4,
        rightMargin=20 * mm,
        leftMargin=20 * mm,
        topMargin=20 * mm,
        bottomMargin=20 * mm,
    )

    styles = getSampleStyleSheet()

    title_style = ParagraphStyle(
        "SustainabilityTitle",
        parent=styles["Title"],
        alignment=TA_CENTER,
        fontSize=20,
        leading=24,
        spaceAfter=8,
    )

    subtitle_style = ParagraphStyle(
        "SustainabilitySubtitle",
        parent=styles["Normal"],
        alignment=TA_CENTER,
        fontSize=10,
        leading=14,
        textColor=colors.grey,
        spaceAfter=20,
    )

    heading_style = ParagraphStyle(
        "SustainabilityHeading",
        parent=styles["Heading2"],
        fontSize=14,
        leading=18,
        spaceBefore=12,
        spaceAfter=10,
    )

    normal_style = ParagraphStyle(
        "SustainabilityNormal",
        parent=styles["Normal"],
        fontSize=10,
        leading=14,
    )

    story = []

    story.append(
        Paragraph(
            "Textile Waste Intelligence Platform",
            title_style,
        )
    )

    story.append(
        Paragraph(
            f"Sustainability Report<br/>"
            f"Company: {company_name}<br/>"
            f"Company Code: {company_code}",
            subtitle_style,
        )
    )

    story.append(
        Paragraph(
            "Sustainability Summary",
            heading_style,
        )
    )

    summary_data = [
        [
            Paragraph("<b>Total Users</b>", normal_style),
            Paragraph("<b>Total Inventory</b>", normal_style),
            Paragraph("<b>Total Uploads</b>", normal_style),
        ],
        [
            str(source_data["total_users"]),
            str(source_data["total_inventory"]),
            str(source_data["total_uploads"]),
        ],
    ]

    summary_table = Table(
        summary_data,
        colWidths=[
            55 * mm,
            55 * mm,
            55 * mm,
        ],
    )

    summary_table.setStyle(
        TableStyle([
            ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#F1F5FA")),
            ("BOX", (0, 0), (-1, -1), 0.8, colors.HexColor("#D9E2EF")),
            ("INNERGRID", (0, 0), (-1, -1), 0.5, colors.HexColor("#D9E2EF")),
            ("ALIGN", (0, 0), (-1, -1), "CENTER"),
            ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
            ("TOPPADDING", (0, 0), (-1, -1), 10),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 10),
        ])
    )

    story.append(summary_table)
    story.append(Spacer(1, 20))

    story.append(
        Paragraph(
            "Environmental & Sustainability Overview",
            heading_style,
        )
    )

    report_data = [
        [
            Paragraph("<b>Metric</b>", normal_style),
            Paragraph("<b>Value</b>", normal_style),
        ],
        [
            Paragraph("Textile Waste Records", normal_style),
            str(source_data["total_uploads"]),
        ],
        [
            Paragraph("Inventory Records", normal_style),
            str(source_data["total_inventory"]),
        ],
        [
            Paragraph("Company Users", normal_style),
            str(source_data["total_users"]),
        ],
    ]

    report_table = Table(
        report_data,
        colWidths=[110 * mm, 55 * mm],
    )

    report_table.setStyle(
        TableStyle([
            ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#F1F5FA")),
            ("BOX", (0, 0), (-1, -1), 0.8, colors.HexColor("#D9E2EF")),
            ("INNERGRID", (0, 0), (-1, -1), 0.5, colors.HexColor("#D9E2EF")),
            ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
            ("TOPPADDING", (0, 0), (-1, -1), 9),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 9),
        ])
    )

    story.append(report_table)
    story.append(Spacer(1, 20))

    story.append(
        Paragraph(
            "This sustainability report is generated for the "
            "authenticated company and contains company-specific "
            "textile waste and sustainability information.",
            subtitle_style,
        )
    )

    document.build(story)

    pdf_buffer.seek(0)

    return Response(
        content=pdf_buffer.getvalue(),
        media_type="application/pdf",
        headers={
            "Content-Disposition":
                'attachment; filename="Sustainability_Report.pdf"'
        },
    )
    