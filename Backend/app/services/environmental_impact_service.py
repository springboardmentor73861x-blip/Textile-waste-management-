from sqlalchemy.orm import Session

from app.models.inventory import Inventory


# ------------------------------------------------------------
# ENVIRONMENTAL IMPACT ESTIMATION FACTORS
# ------------------------------------------------------------
# These are project estimation factors.
# All results produced by this service are estimates.
#
# CO2  -> kg CO2e saved per kg textile diverted
# Water -> litres of water saved per kg textile diverted
# Land -> square metres of land-use pressure avoided per kg textile diverted
#
# Keep these values centralized so they can be changed later
# without modifying the calculation logic.

CO2_SAVED_PER_KG = 3.6
WATER_SAVED_PER_KG = 2700
LAND_SAVED_PER_KG = 0.01


# ------------------------------------------------------------
# HELPER FUNCTIONS
# ------------------------------------------------------------

def _is_recyclable(value):
    """
    Check whether a textile is marked as recyclable.
    """

    if value is None:
        return False

    value = str(value).strip().lower()

    return value in {
        "true",
        "recyclable",
        "recycle",
        "recycled",
        "yes",
        "high",
        "excellent",
    } or "recyclable" in value


def _is_reusable(value):
    """
    Check whether a textile is reusable.
    """

    if value is None:
        return False

    value = str(value).strip().lower()

    return value in {
        "true",
        "reusable",
        "reuse",
        "yes",
        "high",
        "excellent",
    } or "reusable" in value


# ------------------------------------------------------------
# ENVIRONMENTAL IMPACT CALCULATION
# ------------------------------------------------------------

def get_environmental_impact(
    db: Session,
    company_code: str | None
):
    """
    Calculate estimated environmental savings from textile
    quantities already stored in the Inventory table.

    Returns:
        - diverted_quantity
        - co2_saved
        - water_saved
        - land_saved
    """

    inventory_items = (
    db.query(Inventory)
    .filter(Inventory.company_code == company_code)
    .order_by(Inventory.created_at.asc())
    .all()
)

    total_quantity = 0
    recyclable_quantity = 0
    reusable_quantity = 0
    diverted_quantity = 0

    for item in inventory_items:

        quantity = item.quantity or 0

        try:
            quantity = float(quantity)
        except (ValueError, TypeError):
            quantity = 0

        total_quantity += quantity

        recyclable = _is_recyclable(item.recyclability)
        reusable = _is_reusable(item.recyclability)

        if recyclable:
            recyclable_quantity += quantity

        if reusable:
            reusable_quantity += quantity

        # Count textile only once even if it qualifies
        # for both reuse and recycling.
        if recyclable or reusable:
            diverted_quantity += quantity

    # --------------------------------------------------------
    # ENVIRONMENTAL SAVINGS
    # --------------------------------------------------------

    co2_saved = diverted_quantity * CO2_SAVED_PER_KG
    water_saved = diverted_quantity * WATER_SAVED_PER_KG
    land_saved = diverted_quantity * LAND_SAVED_PER_KG

    return {
        "total_quantity": round(total_quantity, 2),
        "recyclable_quantity": round(recyclable_quantity, 2),
        "reusable_quantity": round(reusable_quantity, 2),
        "diverted_quantity": round(diverted_quantity, 2),

        "co2_saved": round(co2_saved, 2),
        "water_saved": round(water_saved, 2),
        "land_saved": round(land_saved, 4),

        "co2_unit": "kg CO₂e",
        "water_unit": "L",
        "land_unit": "m²",

        "is_estimated": True,
    }