from datetime import datetime

from sqlalchemy.orm import Session

from app.models.report import Report, ReportActivity
from app.models.user import User
from app.models.upload import Upload
from app.models.inventory import Inventory


# =========================================================
# REPORT DASHBOARD
# =========================================================

def get_report_dashboard(
    db: Session,
    company_code: str | None
):

    total_reports = (
        db.query(Report)
        .filter(
            Report.company_code == company_code
        )
        .count()
    )

    now = datetime.utcnow()

    month_start = datetime(
        now.year,
        now.month,
        1
    )

    this_month = (
        db.query(Report)
        .filter(
            Report.company_code == company_code,
            Report.created_at >= month_start
        )
        .count()
    )

    total_downloads = (
        db.query(Report.downloads)
        .filter(
            Report.company_code == company_code
        )
        .all()
    )

    total_downloads = sum(
        value[0] or 0
        for value in total_downloads
    )

    reports_generated = (
        db.query(Report)
        .filter(
            Report.company_code == company_code,
            Report.status == "Completed"
        )
        .count()
    )

    # IMPORTANT:
    # Recent Activity here means ONLY report activity.
    # It does NOT use Admin Dashboard activities.

    recent_activity = (
        db.query(ReportActivity)
        .filter(
            ReportActivity.company_code == company_code
        )
        .order_by(
            ReportActivity.created_at.desc()
        )
        .limit(5)
        .all()
    )

    return {
        "total_reports": total_reports,
        "this_month": this_month,
        "total_downloads": total_downloads,
        "reports_generated": reports_generated,
        "recent_activity": recent_activity
    }


# =========================================================
# GENERATE REPORT
# =========================================================

def generate_report(
    db: Session,
    report_name: str,
    report_type: str,
    generated_by: str,
    role: str,
    company_name: str | None = None,
    company_code: str | None = None
):

    report = Report(
        report_name=report_name,
        report_type=report_type,
        generated_by=generated_by,

        # Company information
        company_name=company_name,
        company_code=company_code,

        status="Completed",
        downloads=0
    )

    db.add(report)
    db.commit()
    db.refresh(report)

    # Store report generation activity
    activity = ReportActivity(
        report_id=report.id,
        report_name=report.report_name,
        report_type=report.report_type,
        action="Report Generated",
        username=generated_by,
        role=role,

        # Company information
        company_name=company_name,
        company_code=company_code,

        status="Success"
    )

    db.add(activity)
    db.commit()
    db.refresh(activity)

    return report


# =========================================================
# GET REPORT
# =========================================================

def get_report_by_id(
    db: Session,
    report_id: int,
    company_code: str | None
):

    return (
        db.query(Report)
        .filter(
            Report.id == report_id,
            Report.company_code == company_code
        )
        .first()
    )


# =========================================================
# DOWNLOAD COUNT
# =========================================================

def increment_download(
    db: Session,
    report: Report
):

    report.downloads = (
        report.downloads or 0
    ) + 1

    db.commit()
    db.refresh(report)

    return report


# =========================================================
# REPORT DOWNLOAD ACTIVITY
# =========================================================

def create_download_activity(
    db: Session,
    report: Report,
    username: str,
    role: str
):

    activity = ReportActivity(
        report_id=report.id,
        report_name=report.report_name,
        report_type=report.report_type,
        action="Report Downloaded",
        username=username,
        role=role,

        # Take company information
        # directly from the report
        company_name=report.company_name,
        company_code=report.company_code,

        status="Success"
    )

    db.add(activity)
    db.commit()
    db.refresh(activity)

    return activity


# =========================================================
# REPORT SOURCE DATA
# =========================================================

def get_report_source_data(
    db: Session,
    company_code: str | None
):

    return {
        "total_users": (
            db.query(User)
            .filter(
                User.company_code == company_code
            )
            .count()
        ),

        "total_inventory": (
            db.query(Inventory)
            .filter(
                Inventory.company_code == company_code
            )
            .count()
        ),

        "total_uploads": (
            db.query(Upload)
            .filter(
                Upload.company_code == company_code
            )
            .count()
        )
    }