from collections import Counter
from datetime import datetime, timedelta

from sqlalchemy.orm import Session

from app.models.inventory import Inventory
from app.models.upload import Upload


# ============================================================
# HELPERS
# ============================================================

def _is_recyclable(value):
    if value is None:
        return False

    value = str(value).strip().lower()

    return value in {
        "true",
        "yes",
        "recyclable",
        "recycle",
        "recycled",
        "high",
        "excellent",
    } or "recyclable" in value


def _is_reusable(value):
    if value is None:
        return False

    value = str(value).strip().lower()

    return (
        "reusable" in value
        or "reuse" in value
        or value in {
            "true",
            "yes",
            "high",
            "excellent",
        }
    )


def _normalise_status(value):
    if not value:
        return "Available"

    value = str(value).strip().lower()

    status_map = {
        "available": "Available",
        "under processing": "Under Processing",
        "processing": "Under Processing",
        "recovered": "Recovered",
        "completed": "Completed",
    }

    return status_map.get(value, str(value).strip().title())


def _safe_quantity(value):
    try:
        return float(value or 0)
    except (ValueError, TypeError):
        return 0.0


def _recommendation(item):
    """
    Generate a recycler-oriented recommendation from
    the existing inventory information.
    """

    if _is_recyclable(item.recyclability):
        return "Recycle"

    if _is_reusable(item.recyclability):
        return "Reuse"

    waste_category = str(
        item.waste_category or ""
    ).strip().lower()

    if "repair" in waste_category:
        return "Repair"

    if "upcycl" in waste_category:
        return "Upcycle"

    if "hazard" in waste_category:
        return "Special Disposal"

    return "Review"


# ============================================================
# RECYCLER DASHBOARD
# ============================================================

def get_recycler_dashboard(
    db: Session,
    company_code: str | None,
):
    """
    Return company-scoped recycler dashboard data.

    Uses the existing Inventory and Upload tables.
    No new database tables are required.
    """

    # --------------------------------------------------------
    # INVENTORY
    # --------------------------------------------------------

    inventory_items = (
        db.query(Inventory)
        .filter(
            Inventory.company_code == company_code
        )
        .order_by(
            Inventory.created_at.desc()
        )
        .all()
    )

    # --------------------------------------------------------
    # SUMMARY
    # --------------------------------------------------------

    total_batches = len(inventory_items)

    total_quantity = sum(
        _safe_quantity(item.quantity)
        for item in inventory_items
    )

    recyclable_quantity = sum(
        _safe_quantity(item.quantity)
        for item in inventory_items
        if _is_recyclable(item.recyclability)
    )

    reusable_quantity = sum(
        _safe_quantity(item.quantity)
        for item in inventory_items
        if _is_reusable(item.recyclability)
    )

    available_quantity = sum(
        _safe_quantity(item.quantity)
        for item in inventory_items
        if _normalise_status(item.status) == "Available"
    )

    processing_quantity = sum(
        _safe_quantity(item.quantity)
        for item in inventory_items
        if _normalise_status(item.status)
        == "Under Processing"
    )

    recovered_quantity = sum(
        _safe_quantity(item.quantity)
        for item in inventory_items
        if _normalise_status(item.status)
        == "Recovered"
    )

    completed_quantity = sum(
        _safe_quantity(item.quantity)
        for item in inventory_items
        if _normalise_status(item.status)
        == "Completed"
    )

    # --------------------------------------------------------
    # RECOVERY POTENTIAL
    # --------------------------------------------------------

    recovery_quantity = (
        recyclable_quantity
        + reusable_quantity
    )

    recovery_percentage = (
        (recovery_quantity / total_quantity) * 100
        if total_quantity > 0
        else 0
    )

    # --------------------------------------------------------
    # MATERIAL DISTRIBUTION
    # --------------------------------------------------------

    material_counter = Counter()

    for item in inventory_items:
        material = (
            item.fabric_type
            or "Unknown"
        )

        material_counter[material] += (
            _safe_quantity(item.quantity)
        )

    material_distribution = [
        {
            "material": material,
            "quantity": round(quantity, 2),
        }
        for material, quantity
        in material_counter.items()
    ]

    material_distribution.sort(
        key=lambda x: x["quantity"],
        reverse=True,
    )

    # --------------------------------------------------------
    # WASTE CATEGORY DISTRIBUTION
    # --------------------------------------------------------

    category_counter = Counter()

    for item in inventory_items:
        category = (
            item.waste_category
            or "Unclassified"
        )

        category_counter[category] += (
            _safe_quantity(item.quantity)
        )

    waste_category_distribution = [
        {
            "category": category,
            "quantity": round(quantity, 2),
        }
        for category, quantity
        in category_counter.items()
    ]

    waste_category_distribution.sort(
        key=lambda x: x["quantity"],
        reverse=True,
    )

    # --------------------------------------------------------
    # STATUS DISTRIBUTION
    # --------------------------------------------------------

    status_counter = Counter()

    for item in inventory_items:
        status = _normalise_status(
            item.status
        )

        status_counter[status] += (
            _safe_quantity(item.quantity)
        )

    status_distribution = [
        {
            "status": status,
            "quantity": round(quantity, 2),
        }
        for status, quantity
        in status_counter.items()
    ]

    # --------------------------------------------------------
    # RECENT BATCHES
    # --------------------------------------------------------

    recent_batches = []

    for item in inventory_items[:10]:

        recent_batches.append(
            {
                "id": item.id,
                "batch_id": item.batch_id,
                "fabric_type": item.fabric_type
                or "Unknown",
                "source": item.source
                or "Unknown",
                "quantity": round(
                    _safe_quantity(item.quantity),
                    2,
                ),
                "color": item.color
                or "Unknown",
                "condition": item.condition
                or "Unknown",
                "waste_category": (
                    item.waste_category
                    or "Unclassified"
                ),
                "recyclability": (
                    item.recyclability
                    or "Unknown"
                ),
                "status": _normalise_status(
                    item.status
                ),
                "recommendation": _recommendation(
                    item
                ),
                "collection_date": (
                    item.collection_date.isoformat()
                    if item.collection_date
                    else None
                ),
                "created_at": (
                    item.created_at.isoformat()
                    if item.created_at
                    else None
                ),
            }
        )

    # --------------------------------------------------------
    # RECOVERY RECOMMENDATIONS
    # --------------------------------------------------------

    recommendation_counter = Counter()

    for item in inventory_items:
        recommendation_counter[
            _recommendation(item)
        ] += _safe_quantity(item.quantity)

    recovery_recommendations = [
        {
            "recommendation": recommendation,
            "quantity": round(quantity, 2),
        }
        for recommendation, quantity
        in recommendation_counter.items()
    ]

    recovery_recommendations.sort(
        key=lambda x: x["quantity"],
        reverse=True,
    )

    # --------------------------------------------------------
    # RECENT AI ANALYSIS
    # --------------------------------------------------------

    recent_uploads = (
        db.query(Upload)
        .filter(
            Upload.company_code == company_code
        )
        .order_by(
            Upload.created_at.desc()
        )
        .limit(8)
        .all()
    )

    recent_analysis = []

    for upload in recent_uploads:
        recent_analysis.append(
            {
                "id": upload.id,
                "filename": upload.filename,
                "material": upload.material
                or "Unknown",
                "waste_type": upload.waste_type
                or "Unknown",
                "confidence": upload.confidence,
                "recycle": upload.recycle,
                "reuse": upload.reuse,
                "repair": upload.repair,
                "score": upload.score or 0,
                "created_at": (
                    upload.created_at.isoformat()
                    if upload.created_at
                    else None
                ),
            }
        )

    # --------------------------------------------------------
    # RESPONSE
    # --------------------------------------------------------

    return {
        "company_code": company_code,

        "summary": {
            "total_batches": total_batches,
            "total_quantity": round(
                total_quantity,
                2,
            ),
            "recyclable_quantity": round(
                recyclable_quantity,
                2,
            ),
            "reusable_quantity": round(
                reusable_quantity,
                2,
            ),
            "recovery_quantity": round(
                recovery_quantity,
                2,
            ),
            "recovery_percentage": round(
                recovery_percentage,
                2,
            ),
            "available_quantity": round(
                available_quantity,
                2,
            ),
            "processing_quantity": round(
                processing_quantity,
                2,
            ),
            "recovered_quantity": round(
                recovered_quantity,
                2,
            ),
            "completed_quantity": round(
                completed_quantity,
                2,
            ),
        },

        "material_distribution":
            material_distribution,

        "waste_category_distribution":
            waste_category_distribution,

        "status_distribution":
            status_distribution,

        "recovery_recommendations":
            recovery_recommendations,

        "recent_batches":
            recent_batches,

        "recent_analysis":
            recent_analysis,

        "generated_at":
            datetime.utcnow().isoformat(),
    }


# ============================================================
# BATCH STATUS UPDATE
# ============================================================

def update_batch_status(
    db: Session,
    batch_id: str,
    company_code: str | None,
    status: str,
):
    """
    Update the processing status of a company-scoped
    recycling batch.
    """

    allowed_statuses = {
        "Available",
        "Under Processing",
        "Recovered",
        "Completed",
    }

    clean_status = _normalise_status(status)

    if clean_status not in allowed_statuses:
        raise ValueError(
            "Invalid batch status. "
            "Allowed values: Available, "
            "Under Processing, Recovered, Completed."
        )

    item = (
        db.query(Inventory)
        .filter(
            Inventory.batch_id == batch_id,
            Inventory.company_code == company_code,
        )
        .first()
    )

    if not item:
        return None

    item.status = clean_status

    db.commit()
    db.refresh(item)

    return {
        "id": item.id,
        "batch_id": item.batch_id,
        "status": item.status,
        "company_code": item.company_code,
        "updated_at": datetime.utcnow().isoformat(),
    }