from pydantic import BaseModel
from datetime import datetime


class RecentActivityResponse(BaseModel):
    username: str
    action: str
    status: str
    created_at: datetime

    class Config:
        from_attributes = True


class AdminDashboardResponse(BaseModel):
    total_users: int
    total_inventory: int
    total_uploads: int
    total_reports: int
    recent_activity: list[RecentActivityResponse]