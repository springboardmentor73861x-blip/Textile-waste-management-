from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from typing import Optional, List
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.core.dependencies import get_current_user
from app.models.inventory import Inventory
from app.services.recommendation_engine import RecommendationEngine

router = APIRouter(
    prefix="/api/v1/recommendations",
    tags=["Recycling Recommendation Workflows"],
)


class BatchRecommendationRequest(BaseModel):
    fabric_class: str
    weight_kg: float = 1.0
    condition: Optional[str] = "Good"
    color: Optional[str] = "Unknown"


class ApplyRecommendationRequest(BaseModel):
    inventory_id: int
    selected_pathway_id: str


@router.get("/pathways")
async def get_circular_pathway_catalog(
    current_user=Depends(get_current_user),
):
    """
    Catalog of supported circular pathways, processing steps, and target offtakers.
    """
    return {
        "status": "success",
        "pathways": RecommendationEngine.PATHWAY_CATALOG,
    }


@router.post("/generate")
async def generate_batch_recommendations(
    request: BatchRecommendationRequest,
    current_user=Depends(get_current_user),
):
    """
    Generates ranked recycling pathways, match scores, ROI, and actionable workflows
    for specified batch properties.
    """
    recommendations = RecommendationEngine.generate_recommendations_for_item(
        fabric_class=request.fabric_class,
        weight_kg=request.weight_kg,
        condition=request.condition,
        color=request.color,
    )
    return {
        "status": "success",
        "data": recommendations,
    }


@router.get("/inventory/{inventory_id}")
async def get_inventory_recommendation(
    inventory_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    """
    Retrieves ranked circular pathways for an existing inventory item in the database.
    """
    item = db.query(Inventory).filter(Inventory.id == inventory_id).first()
    if not item:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Inventory item with ID {inventory_id} not found.",
        )

    recommendations = RecommendationEngine.generate_recommendations_for_item(
        fabric_class=item.material or item.category,
        weight_kg=(item.weight or 1.0) * (item.quantity or 1),
        condition=item.condition or "Good",
        color=item.color or "Unknown",
    )
    return {
        "status": "success",
        "inventory_item": {
            "id": item.id,
            "item_name": item.item_name,
            "category": item.category,
            "material": item.material,
            "weight": item.weight,
            "quantity": item.quantity,
            "condition": item.condition,
        },
        "recommendations": recommendations,
    }


@router.post("/apply")
async def apply_recommendation_pathway(
    request: ApplyRecommendationRequest,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    """
    Executes/assigns a selected circular recycling pathway to an inventory item.
    """
    item = db.query(Inventory).filter(Inventory.id == request.inventory_id).first()
    if not item:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Inventory item with ID {request.inventory_id} not found.",
        )

    pathway_info = RecommendationEngine.PATHWAY_CATALOG.get(request.selected_pathway_id)
    if not pathway_info:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid pathway ID {request.selected_pathway_id}.",
        )

    # Update item location / status to indicate assigned pathway
    item.location = f"Assigned Pathway: {pathway_info['name']}"
    db.commit()
    db.refresh(item)

    return {
        "status": "success",
        "message": f"Successfully assigned pathway '{pathway_info['name']}' to inventory item #{item.id}.",
        "updated_inventory_id": item.id,
        "assigned_pathway": pathway_info,
    }
