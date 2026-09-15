from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.schemas.inventory import InventoryCreate, InventoryResponse
from app.services.inventory_service import (
    create_inventory,
    get_all_inventory,
    update_inventory,
    delete_inventory
)
from app.core.security import admin_required

router = APIRouter(
    prefix="/inventory",
    tags=["Inventory"]
)

@router.post("/", response_model=InventoryResponse)
def add_inventory(
    item: InventoryCreate,
    db: Session = Depends(get_db),
    current_user: dict = Depends(admin_required)
):
    return create_inventory(db, item, current_user)

@router.get("/", response_model=list[InventoryResponse])
def view_inventory(db: Session = Depends(get_db),
    current_user: dict = Depends(admin_required)
):
    return get_all_inventory(db, current_user)

@router.put("/{item_id}", response_model=InventoryResponse)
def edit_inventory(
    item_id: int,
    item: InventoryCreate,
    db: Session = Depends(get_db),
    current_user: dict = Depends(admin_required)
):
    updated_item = update_inventory(db, item_id, item, current_user)

    if not updated_item:
        from fastapi import HTTPException
        raise HTTPException(status_code=404, detail="Inventory item not found")

    return updated_item

@router.delete("/{item_id}")
def remove_inventory(
    item_id: int,
    db: Session = Depends(get_db),
    current_user: dict = Depends(admin_required)
):
    deleted_item = delete_inventory(db, item_id,current_user)

    if not deleted_item:
        from fastapi import HTTPException
        raise HTTPException(status_code=404, detail="Inventory item not found")

    return {
        "message": "Inventory item deleted successfully"
    }