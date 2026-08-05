from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.waste import WasteInventory
from app.schemas.waste import WasteCreate, WasteResponse

router = APIRouter(
    prefix="/waste",
    tags=["Waste Inventory"]
)


# ------------------------
# Create Waste
# ------------------------
@router.post("/", response_model=WasteResponse)
def create_waste(waste: WasteCreate, db: Session = Depends(get_db)):
    new_waste = WasteInventory(
        waste_type=waste.waste_type,
        quantity=waste.quantity,
        unit=waste.unit,
        location=waste.location,
        status=waste.status
    )

    db.add(new_waste)
    db.commit()
    db.refresh(new_waste)

    return new_waste


# ------------------------
# Get All Waste
# ------------------------
@router.get("/", response_model=list[WasteResponse])
def get_all_waste(db: Session = Depends(get_db)):
    return db.query(WasteInventory).all()


# ------------------------
# Get Waste by ID
# ------------------------
@router.get("/{waste_id}", response_model=WasteResponse)
def get_waste(waste_id: int, db: Session = Depends(get_db)):
    waste = db.query(WasteInventory).filter(
        WasteInventory.id == waste_id
    ).first()

    if not waste:
        raise HTTPException(status_code=404, detail="Waste not found")

    return waste


# ------------------------
# Update Waste
# ------------------------
@router.put("/{waste_id}", response_model=WasteResponse)
def update_waste(
    waste_id: int,
    updated_waste: WasteCreate,
    db: Session = Depends(get_db)
):
    waste = db.query(WasteInventory).filter(
        WasteInventory.id == waste_id
    ).first()

    if not waste:
        raise HTTPException(status_code=404, detail="Waste not found")

    waste.waste_type = updated_waste.waste_type
    waste.quantity = updated_waste.quantity
    waste.unit = updated_waste.unit
    waste.location = updated_waste.location
    waste.status = updated_waste.status

    db.commit()
    db.refresh(waste)

    return waste


# ------------------------
# Delete Waste
# ------------------------
@router.delete("/{waste_id}")
def delete_waste(waste_id: int, db: Session = Depends(get_db)):
    waste = db.query(WasteInventory).filter(
        WasteInventory.id == waste_id
    ).first()

    if not waste:
        raise HTTPException(status_code=404, detail="Waste not found")

    db.delete(waste)
    db.commit()

    return {"message": "Waste deleted successfully"}