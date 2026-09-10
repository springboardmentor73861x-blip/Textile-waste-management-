from pydantic import BaseModel
from datetime import datetime
from typing import Optional


# ==========================================================
# CREATE NOTIFICATION
# ==========================================================

class NotificationCreate(BaseModel):

    title: str

    message: str

    notification_type: str = "info"


# ==========================================================
# NOTIFICATION RESPONSE
# ==========================================================

class NotificationResponse(BaseModel):

    id: int

    title: str

    message: str

    notification_type: str

    is_read: bool

    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True