from datetime import datetime

from pydantic import BaseModel


class ReportResponse(BaseModel):

    id: int

    report_name: str

    report_type: str

    generated_by: str

    status: str

    downloads: int

    created_at: datetime

    class Config:
        from_attributes = True


class ReportActivityResponse(BaseModel):

    id: int

    report_id: int

    report_name: str

    report_type: str

    action: str

    username: str

    role: str

    status: str

    created_at: datetime

    class Config:
        from_attributes = True


class ReportDashboardResponse(BaseModel):

    total_reports: int

    this_month: int

    total_downloads: int

    reports_generated: int

    recent_activity: list[ReportActivityResponse]