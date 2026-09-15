from pydantic import BaseModel
from typing import List


class TextileMaterial(BaseModel):
    name: str
    percentage: float
    color: str


class TextileMonthlyUpload(BaseModel):
    month: str
    value: int


class TextileRecentAnalysis(BaseModel):
    id: str
    material: str
    classification: str
    recommendation: str
    confidence: float
    date: str


class TextileDashboardResponse(BaseModel):

    totalWaste: int
    analyzed: int
    recyclable: int
    reusable: int
    nonRecyclable: int

    materials: List[TextileMaterial]

    monthlyUploads: List[TextileMonthlyUpload]

    recentAnalysis: List[TextileRecentAnalysis]