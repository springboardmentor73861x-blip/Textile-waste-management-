from collections import Counter, defaultdict
from datetime import datetime

from sqlalchemy.orm import Session

from app.models.inventory import Inventory
from app.models.upload import Upload


# ============================================================
# HELPER FUNCTIONS
# ============================================================

def normalize(value):
    if value is None:
        return ""

    return str(value).strip().lower()


def classify_waste(value):
    """
    Converts stored waste/recyclability information
    into dashboard categories.
    """

    value = normalize(value)

    if "reusable" in value:
        return "Reusable"

    if "recyclable" in value:
        return "Recyclable"

    return "Non-Recyclable"


def get_recommendation(upload):
    """
    Uses the recommendation fields already stored
    in the Upload model.
    """

    recycle = normalize(upload.recycle)
    reuse = normalize(upload.reuse)
    repair = normalize(upload.repair)

    if reuse:
        return upload.reuse

    if recycle:
        return upload.recycle

    if repair:
        return upload.repair

    waste_type = normalize(upload.waste_type)

    if "reusable" in waste_type:
        return "Reuse for secondary applications"

    if "recyclable" in waste_type:
        return "Recycle into fibers"

    return "Energy recovery / Disposal"


def get_material_color(index):
    colors = [
        "purple",
        "blue",
        "teal",
        "orange",
        "gray",
    ]

    return colors[index % len(colors)]


def get_confidence(value):
    try:
        return float(value or 0)
    except (ValueError, TypeError):
        return 0.0


# ============================================================
# TEXTILE MANAGER DASHBOARD
# ============================================================

def get_textile_dashboard(
    db: Session,
    company_code: str | None
):

    # ========================================================
    # FETCH INVENTORY DATA
    # ========================================================

    inventory_items = (
    db.query(Inventory)
    .filter(Inventory.company_code == company_code)
    .order_by(Inventory.created_at.asc())
    .all()
)

    # ========================================================
    # FETCH UPLOAD / AI ANALYSIS DATA
    # ========================================================

    uploads = (
    db.query(Upload)
    .filter(Upload.company_code == company_code)
    .order_by(Upload.created_at.desc())
    .all()
)

    # ========================================================
    # TOTAL TEXTILE WASTE
    # ========================================================

    total_waste = sum(
        item.quantity or 0
        for item in inventory_items
    )

    # ========================================================
    # ANALYZED
    # ========================================================

    analyzed = len(uploads)

    # ========================================================
    # WASTE CLASSIFICATION
    # ========================================================

    recyclable = 0
    reusable = 0
    non_recyclable = 0

    for item in inventory_items:

        quantity = item.quantity or 0

        # Prefer waste_category.
        # If it is empty, use recyclability.

        classification_value = (
            item.waste_category
            or item.recyclability
            or ""
        )

        classification = classify_waste(
            classification_value
        )

        if classification == "Recyclable":

            recyclable += quantity

        elif classification == "Reusable":

            reusable += quantity

        else:

            non_recyclable += quantity

    # ========================================================
    # MATERIAL COMPOSITION
    # ========================================================

    material_counter = Counter()

    for item in inventory_items:

        material = (
            item.fabric_type
            or "Unknown"
        )

        quantity = item.quantity or 0

        material_counter[material] += quantity

    materials = []

    if total_waste > 0:

        sorted_materials = (
            material_counter
            .most_common()
        )

        # Top 4 materials
        top_materials = sorted_materials[:4]

        # Remaining materials
        others_quantity = sum(
            quantity
            for _, quantity
            in sorted_materials[4:]
        )

        if others_quantity > 0:

            top_materials.append(
                (
                    "Others",
                    others_quantity
                )
            )

        for index, (name, quantity) in enumerate(
            top_materials
        ):

            percentage = (
                quantity / total_waste
            ) * 100

            materials.append(
                {
                    "name": name,
                    "percentage": round(
                        percentage,
                        2
                    ),
                    "color": get_material_color(
                        index
                    ),
                }
            )

    # ========================================================
    # MONTHLY UPLOAD / WASTE TREND
    # ========================================================

    monthly_data = defaultdict(int)

    for item in inventory_items:

        if not item.created_at:
            continue

        month_key = item.created_at.strftime(
            "%Y-%m"
        )

        monthly_data[month_key] += (
            item.quantity or 0
        )

    sorted_months = sorted(
        monthly_data.keys()
    )[-6:]

    monthly_uploads = []

    for month_key in sorted_months:

        month_date = datetime.strptime(
            month_key,
            "%Y-%m"
        )

        monthly_uploads.append(
            {
                "month": month_date.strftime(
                    "%b"
                ),
                "value": monthly_data[
                    month_key
                ],
            }
        )

    # ========================================================
    # RECENT TEXTILE ANALYSIS
    # ========================================================

    recent_analysis = []

    for upload in uploads[:10]:

        classification = classify_waste(
            upload.waste_type
        )

        confidence = get_confidence(
            upload.confidence
        )

        if upload.created_at:

            date = upload.created_at.strftime(
                "%b %d, %Y"
            )

        else:

            date = "-"

        recent_analysis.append(
            {
                "id": f"TX-{upload.id:04d}",

                "material": (
                    upload.material
                    or "Unknown"
                ),

                "classification": classification,

                "recommendation":
                    get_recommendation(
                        upload
                    ),

                "confidence": round(
                    confidence,
                    2
                ),

                "date": date,
            }
        )

    # ========================================================
    # FINAL RESPONSE
    # ========================================================

    return {
        "totalWaste": total_waste,

        "analyzed": analyzed,

        "recyclable": recyclable,

        "reusable": reusable,

        "nonRecyclable": non_recyclable,

        "materials": materials,

        "monthlyUploads": monthly_uploads,

        "recentAnalysis": recent_analysis,
    }