from pydantic import BaseModel
from datetime import datetime

class UploadResponse(BaseModel):

    id: int
    filename: str
    file_path: str
    uploaded_by: str
    created_at: datetime

    material: str
    waste_type: str
    confidence: str

    recycle: str
    reuse: str
    repair: str

    score: int

    class Config:
        from_attributes = True