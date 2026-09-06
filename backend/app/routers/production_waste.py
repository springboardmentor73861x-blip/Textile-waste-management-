from fastapi import (
    APIRouter,
    Depends,
    HTTPException,
)

from sqlalchemy.orm import Session

from app.database import get_db

from app.models.production_waste import ProductionWaste

from app.schemas.production_waste import (
    ProductionWasteCreate,
    ProductionWasteResponse,
)


router = APIRouter(
    prefix="/production-waste",
    tags=["Production Waste"],
)


# ============================================================
# CREATE PRODUCTION WASTE
# ============================================================

@router.post(
    "/",
    response_model=ProductionWasteResponse,
)
def create_production_waste(
    waste: ProductionWasteCreate,
    db: Session = Depends(get_db),
):

    new_waste = ProductionWaste(
        production_unit=waste.production_unit,
        production_process=waste.production_process,
        machine=waste.machine,
        waste_type=waste.waste_type,
        waste_category=waste.waste_category,
        quantity=waste.quantity,
        unit=waste.unit,
        weight=waste.weight,
        material_type=waste.material_type,
        fabric_type=waste.fabric_type,
        color=waste.color,
        condition=waste.condition,
        location=waste.location,
        status=waste.status,
        notes=waste.notes,
    )

    db.add(new_waste)

    db.commit()

    db.refresh(new_waste)

    return new_waste


# ============================================================
# GET ALL PRODUCTION WASTE
# ============================================================

@router.get(
    "/",
    response_model=list[ProductionWasteResponse],
)
def get_all_production_waste(
    db: Session = Depends(get_db),
):

    return (
        db
        .query(ProductionWaste)
        .order_by(
            ProductionWaste.id.desc()
        )
        .all()
    )


# ============================================================
# GET PRODUCTION WASTE BY ID
# ============================================================

@router.get(
    "/{waste_id}",
    response_model=ProductionWasteResponse,
)
def get_production_waste(
    waste_id: int,
    db: Session = Depends(get_db),
):

    waste = (
        db
        .query(ProductionWaste)
        .filter(
            ProductionWaste.id == waste_id
        )
        .first()
    )

    if not waste:

        raise HTTPException(
            status_code=404,
            detail="Production waste not found",
        )

    return waste


# ============================================================
# UPDATE PRODUCTION WASTE
# ============================================================

@router.put(
    "/{waste_id}",
    response_model=ProductionWasteResponse,
)
def update_production_waste(
    waste_id: int,
    updated_waste: ProductionWasteCreate,
    db: Session = Depends(get_db),
):

    waste = (
        db
        .query(ProductionWaste)
        .filter(
            ProductionWaste.id == waste_id
        )
        .first()
    )

    if not waste:

        raise HTTPException(
            status_code=404,
            detail="Production waste not found",
        )

    waste.production_unit = (
        updated_waste.production_unit
    )

    waste.production_process = (
        updated_waste.production_process
    )

    waste.machine = (
        updated_waste.machine
    )

    waste.waste_type = (
        updated_waste.waste_type
    )

    waste.waste_category = (
        updated_waste.waste_category
    )

    waste.quantity = (
        updated_waste.quantity
    )

    waste.unit = (
        updated_waste.unit
    )

    waste.weight = (
        updated_waste.weight
    )

    waste.material_type = (
        updated_waste.material_type
    )

    waste.fabric_type = (
        updated_waste.fabric_type
    )

    waste.color = (
        updated_waste.color
    )

    waste.condition = (
        updated_waste.condition
    )

    waste.location = (
        updated_waste.location
    )

    waste.status = (
        updated_waste.status
    )

    waste.notes = (
        updated_waste.notes
    )

    db.commit()

    db.refresh(waste)

    return waste


# ============================================================
# DELETE PRODUCTION WASTE
# ============================================================

@router.delete(
    "/{waste_id}"
)
def delete_production_waste(
    waste_id: int,
    db: Session = Depends(get_db),
):

    waste = (
        db
        .query(ProductionWaste)
        .filter(
            ProductionWaste.id == waste_id
        )
        .first()
    )

    if not waste:

        raise HTTPException(
            status_code=404,
            detail="Production waste not found",
        )

    db.delete(waste)

    db.commit()

    return {
        "message":
            "Production waste deleted successfully"
    }