from pydantic import BaseModel
from datetime import datetime


class ActivityResponse(BaseModel):
    id: int
    username: str
    action: str
    status: str
    created_at: datetime

    class Config:
        from_attributes = True