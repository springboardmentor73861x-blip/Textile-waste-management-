from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.dependencies import get_current_user
from app.db.session import get_db
from app.schemas.inventory_schema import (
    InventoryCreate,
    InventoryUpdate,
    InventoryResponse,
)
from app.services.inventory_service import InventoryService

router = APIRouter(
    prefix="/inventory",
    tags=["Inventory"],
)


@router.post(
    "/",
    response_model=InventoryResponse,
)
def create_inventory(
    inventory: InventoryCreate,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    return InventoryService.create_inventory(
        db,
        inventory,
        current_user.id,
    )


@router.get(
    "/",
    response_model=list[InventoryResponse],
)
def get_inventory(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    return InventoryService.get_inventory(db)


@router.get(
    "/{inventory_id}",
    response_model=InventoryResponse,
)
def get_inventory_by_id(
    inventory_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    try:
        return InventoryService.get_inventory_by_id(
            db,
            inventory_id,
        )
    except ValueError as e:
        raise HTTPException(
            status_code=404,
            detail=str(e),
        )


@router.put(
    "/{inventory_id}",
    response_model=InventoryResponse,
)
def update_inventory(
    inventory_id: int,
    inventory: InventoryUpdate,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    try:
        return InventoryService.update_inventory(
            db,
            inventory_id,
            inventory,
        )
    except ValueError as e:
        raise HTTPException(
            status_code=404,
            detail=str(e),
        )


@router.delete("/{inventory_id}")
def delete_inventory(
    inventory_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    try:
        return InventoryService.delete_inventory(
            db,
            inventory_id,
        )
    except ValueError as e:
        raise HTTPException(
            status_code=404,
            detail=str(e),
        )