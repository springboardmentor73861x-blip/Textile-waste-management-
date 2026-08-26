from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.waste import WasteInventory
from app.models.user import User

from app.schemas.waste import (
    WasteCreate,
    WasteResponse,
)


router = APIRouter(
    prefix="/waste",
    tags=["Waste Inventory"],
)


# ============================================================
# HELPER - FIND REGISTERED USER
# ============================================================

def find_manufacturer(
    db: Session,
    manufacturer_id=None,
    manufacturer=None,
):
    """
    Find the registered user who owns/uploads the waste.

    Priority:
    1. manufacturer_id
    2. manufacturer full name
    3. manufacturer email

    IMPORTANT:
    We do NOT require role == "manufacturer".

    This allows an admin user such as:
        ID = 17
        Name = shashi
        Role = admin

    to upload/test waste.

    Waste source values such as:
        Industrial
        Household
        Retail
        Manufacturing
        Garment Production

    are NEVER treated as manufacturer names.
    """

    user = None

    # ========================================================
    # FIND BY USER ID
    # ========================================================

    if manufacturer_id is not None:

        try:
            manufacturer_id = int(manufacturer_id)
        except (TypeError, ValueError):

            raise HTTPException(
                status_code=400,
                detail="Invalid manufacturer_id.",
            )

        user = (
            db.query(User)
            .filter(
                User.id == manufacturer_id
            )
            .first()
        )

        if user:
            return user

    # ========================================================
    # FIND BY NAME OR EMAIL
    # ========================================================

    if manufacturer:

        value = str(
            manufacturer
        ).strip()

        if value:

            user = (
                db.query(User)
                .filter(
                    (User.full_name == value)
                    |
                    (User.email == value)
                )
                .first()
            )

            if user:
                return user

    return None


# ============================================================
# VALIDATE MANUFACTURER VALUE
# ============================================================

def validate_manufacturer_user(
    user: User,
):
    """
    Make sure the resolved user is valid.

    Admin users are allowed.

    Only obvious waste-source values are rejected.
    """

    if not user:

        raise HTTPException(
            status_code=400,
            detail="Registered user not found.",
        )

    manufacturer_name = (
        user.full_name or ""
    ).strip()

    if not manufacturer_name:

        raise HTTPException(
            status_code=400,
            detail="Registered user does not have a valid name.",
        )

    # ========================================================
    # SOURCE VALUES THAT MUST NEVER BE MANUFACTURERS
    # ========================================================

    invalid_manufacturer_values = {

        "industrial",

        "industrial waste",

        "manufacturing",

        "garment production",

        "collection center",

        "household",

        "retail",

        "donation center",

        "production",

        "production unit",

        "textile waste",

        "other",

    }

    if (
        manufacturer_name.lower()
        in invalid_manufacturer_values
    ):

        raise HTTPException(
            status_code=400,
            detail=(
                f'"{manufacturer_name}" is a waste source, '
                "not a registered user."
            ),
        )

    return manufacturer_name


# ============================================================
# CREATE WASTE
# ============================================================

@router.post(
    "/",
    response_model=WasteResponse,
)
def create_waste(
    waste: WasteCreate,
    db: Session = Depends(get_db),
):

    print()
    print("=" * 60)
    print("CREATE WASTE")
    print("=" * 60)

    print(
        "Manufacturer ID:",
        waste.manufacturer_id,
    )

    print(
        "Manufacturer:",
        waste.manufacturer,
    )

    print(
        "Source:",
        waste.source,
    )

    print(
        "Material:",
        waste.material_type or waste.fabric_type or waste.waste_type,
    )

    print(
        "Quantity:",
        waste.quantity,
    )

    # ========================================================
    # FIND REGISTERED USER
    # ========================================================

    manufacturer_user = find_manufacturer(
        db=db,
        manufacturer_id=waste.manufacturer_id,
        manufacturer=waste.manufacturer,
    )

    # ========================================================
    # USER NOT FOUND
    # ========================================================

    if not manufacturer_user:

        print(
            "REGISTERED USER NOT FOUND"
        )

        print("=" * 60)

        raise HTTPException(
            status_code=400,
            detail=(
                "Registered user not found. "
                "Please provide a valid manufacturer_id "
                "or registered user name/email."
            ),
        )

    # ========================================================
    # DEBUG FOUND USER
    # ========================================================

    print(
        "FOUND USER ID:",
        manufacturer_user.id,
    )

    print(
        "FOUND USER NAME:",
        manufacturer_user.full_name,
    )

    print(
        "FOUND USER ROLE:",
        manufacturer_user.role,
    )

    # ========================================================
    # VALIDATE USER
    # ========================================================

    manufacturer_name = (
        validate_manufacturer_user(
            manufacturer_user
        )
    )

    # ========================================================
    # VALIDATE QUANTITY
    # ========================================================

    if waste.quantity is None:

        raise HTTPException(
            status_code=400,
            detail="Waste quantity is required.",
        )

    if waste.quantity <= 0:

        raise HTTPException(
            status_code=400,
            detail="Waste quantity must be greater than 0.",
        )

    # ========================================================
    # VALIDATE WEIGHT
    # ========================================================

    if (
        waste.weight is not None
        and waste.weight < 0
    ):

        raise HTTPException(
            status_code=400,
            detail="Weight cannot be negative.",
        )

    # ========================================================
    # CREATE WASTE OBJECT
    # ========================================================

    new_waste = WasteInventory(

        # ====================================================
        # USER / MANUFACTURER
        # ====================================================

        manufacturer_id=manufacturer_user.id,

        manufacturer=manufacturer_name,

        # ====================================================
        # BASIC WASTE INFORMATION
        # ====================================================

        waste_type=waste.waste_type,

        quantity=waste.quantity,

        unit=waste.unit,

        location=waste.location,

        status=(
            waste.status
            if waste.status
            else "Available"
        ),

        # ====================================================
        # TEXTILE INFORMATION
        # ====================================================

        source=waste.source,

        waste_category=waste.waste_category,

        color=waste.color,

        condition=waste.condition,

        weight=waste.weight,

        notes=waste.notes,

        # ====================================================
        # AI INFORMATION
        # ====================================================

        material_type=waste.material_type,

        fabric_type=waste.fabric_type,

        class_index=waste.class_index,

        confidence=waste.confidence,

        composition=waste.composition,

        recyclability=waste.recyclability,

        biodegradability=waste.biodegradability,

        environmental_impact=(
            waste.environmental_impact
        ),

        recommended_processing=(
            waste.recommended_processing
        ),

        recycling_method=(
            waste.recycling_method
        ),

        disposal_method=(
            waste.disposal_method
        ),

        potential_reuse=(
            waste.potential_reuse
        ),

        predicted_color=(
            waste.predicted_color
        ),

        predicted_condition=(
            waste.predicted_condition
        ),
    )

    # ========================================================
    # SAVE DATABASE
    # ========================================================

    try:

        db.add(
            new_waste
        )

        db.commit()

        db.refresh(
            new_waste
        )

    except Exception as exc:

        db.rollback()

        print(
            "DATABASE ERROR:",
            repr(exc)
        )

        raise HTTPException(
            status_code=500,
            detail="Failed to create waste.",
        ) from exc

    # ========================================================
    # SUCCESS
    # ========================================================

    print(
        "WASTE SAVED SUCCESSFULLY"
    )

    print(
        "Waste ID:",
        new_waste.id,
    )

    print(
        "Manufacturer ID:",
        new_waste.manufacturer_id,
    )

    print(
        "Manufacturer:",
        new_waste.manufacturer,
    )

    print("=" * 60)
    print()

    return new_waste


# ============================================================
# GET ALL WASTE
# ============================================================

@router.get(
    "/",
    response_model=list[WasteResponse],
)
def get_all_waste(
    db: Session = Depends(get_db),
):

    return (
        db.query(WasteInventory)
        .order_by(
            WasteInventory.id.desc()
        )
        .all()
    )


# ============================================================
# GET WASTE BY ID
# ============================================================

@router.get(
    "/{waste_id}",
    response_model=WasteResponse,
)
def get_waste(
    waste_id: int,
    db: Session = Depends(get_db),
):

    waste = (
        db.query(WasteInventory)
        .filter(
            WasteInventory.id == waste_id
        )
        .first()
    )

    if not waste:

        raise HTTPException(
            status_code=404,
            detail="Waste not found.",
        )

    return waste


# ============================================================
# UPDATE WASTE
# ============================================================

@router.put(
    "/{waste_id}",
    response_model=WasteResponse,
)
def update_waste(
    waste_id: int,
    updated_waste: WasteCreate,
    db: Session = Depends(get_db),
):

    waste = (
        db.query(WasteInventory)
        .filter(
            WasteInventory.id == waste_id
        )
        .first()
    )

    if not waste:

        raise HTTPException(
            status_code=404,
            detail="Waste not found.",
        )

    # ========================================================
    # FIND USER
    # ========================================================

    manufacturer_user = find_manufacturer(
        db=db,
        manufacturer_id=updated_waste.manufacturer_id,
        manufacturer=updated_waste.manufacturer,
    )

    if not manufacturer_user:

        raise HTTPException(
            status_code=400,
            detail="Registered user not found.",
        )

    # ========================================================
    # VALIDATE USER
    # ========================================================

    manufacturer_name = (
        validate_manufacturer_user(
            manufacturer_user
        )
    )

    # ========================================================
    # VALIDATE QUANTITY
    # ========================================================

    if updated_waste.quantity is None:

        raise HTTPException(
            status_code=400,
            detail="Waste quantity is required.",
        )

    if updated_waste.quantity <= 0:

        raise HTTPException(
            status_code=400,
            detail="Waste quantity must be greater than 0.",
        )

    # ========================================================
    # VALIDATE WEIGHT
    # ========================================================

    if (
        updated_waste.weight is not None
        and updated_waste.weight < 0
    ):

        raise HTTPException(
            status_code=400,
            detail="Weight cannot be negative.",
        )

    # ========================================================
    # USER / MANUFACTURER
    # ========================================================

    waste.manufacturer_id = (
        manufacturer_user.id
    )

    waste.manufacturer = (
        manufacturer_name
    )

    # ========================================================
    # BASIC INFORMATION
    # ========================================================

    waste.waste_type = (
        updated_waste.waste_type
    )

    waste.quantity = (
        updated_waste.quantity
    )

    waste.unit = (
        updated_waste.unit
    )

    waste.location = (
        updated_waste.location
    )

    waste.status = (
        updated_waste.status
        or "Available"
    )

    # ========================================================
    # TEXTILE INFORMATION
    # ========================================================

    waste.source = (
        updated_waste.source
    )

    waste.waste_category = (
        updated_waste.waste_category
    )

    waste.color = (
        updated_waste.color
    )

    waste.condition = (
        updated_waste.condition
    )

    waste.weight = (
        updated_waste.weight
    )

    waste.notes = (
        updated_waste.notes
    )

    # ========================================================
    # AI INFORMATION
    # ========================================================

    waste.material_type = (
        updated_waste.material_type
    )

    waste.fabric_type = (
        updated_waste.fabric_type
    )

    waste.class_index = (
        updated_waste.class_index
    )

    waste.confidence = (
        updated_waste.confidence
    )

    waste.composition = (
        updated_waste.composition
    )

    waste.recyclability = (
        updated_waste.recyclability
    )

    waste.biodegradability = (
        updated_waste.biodegradability
    )

    waste.environmental_impact = (
        updated_waste.environmental_impact
    )

    waste.recommended_processing = (
        updated_waste.recommended_processing
    )

    waste.recycling_method = (
        updated_waste.recycling_method
    )

    waste.disposal_method = (
        updated_waste.disposal_method
    )

    waste.potential_reuse = (
        updated_waste.potential_reuse
    )

    waste.predicted_color = (
        updated_waste.predicted_color
    )

    waste.predicted_condition = (
        updated_waste.predicted_condition
    )

    # ========================================================
    # SAVE
    # ========================================================

    try:

        db.commit()

        db.refresh(
            waste
        )

    except Exception as exc:

        db.rollback()

        print(
            "DATABASE UPDATE ERROR:",
            repr(exc)
        )

        raise HTTPException(
            status_code=500,
            detail="Failed to update waste.",
        ) from exc

    return waste


# ============================================================
# DELETE WASTE
# ============================================================

@router.delete(
    "/{waste_id}",
)
def delete_waste(
    waste_id: int,
    db: Session = Depends(get_db),
):

    waste = (
        db.query(WasteInventory)
        .filter(
            WasteInventory.id == waste_id
        )
        .first()
    )

    if not waste:

        raise HTTPException(
            status_code=404,
            detail="Waste not found.",
        )

    try:

        db.delete(
            waste
        )

        db.commit()

    except Exception as exc:

        db.rollback()

        print(
            "DATABASE DELETE ERROR:",
            repr(exc)
        )

        raise HTTPException(
            status_code=500,
            detail="Failed to delete waste.",
        ) from exc

    return {

        "success": True,

        "message":
            "Waste deleted successfully.",

        "waste_id":
            waste_id,

    }