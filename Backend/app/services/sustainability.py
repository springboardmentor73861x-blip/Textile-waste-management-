from collections import defaultdict
from datetime import datetime

from sqlalchemy.orm import Session

from app.models.inventory import Inventory
from app.models.upload import Upload


# ============================================================
# NEW: ENVIRONMENTAL IMPACT SERVICE
# ============================================================

from app.services.environmental_impact_service import (
    get_environmental_impact,
)


def _percentage(value):
    if value is None:
        return 0.0

    try:
        return float(
            str(value).strip().replace("%", "")
        )
    except (ValueError, TypeError):
        return 0.0


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


def _performance(value):
    if value >= 85:
        return "Excellent"

    if value >= 70:
        return "Good"

    if value >= 50:
        return "Moderate"

    return "Needs Improvement"


def _recommendation(upload):
    recycle = _percentage(upload.recycle)
    reuse = _percentage(upload.reuse)
    repair = _percentage(upload.repair)

    values = {
        "Recycle": recycle,
        "Reuse": reuse,
        "Repair": repair,
    }

    if max(values.values()) == 0:
        return "Review"

    return max(
        values,
        key=values.get,
    )


def get_sustainability_dashboard(
    db: Session,
    company_code: str | None,
):
    # ========================================================
    # INVENTORY
    # ========================================================

    inventory_items = (
    db.query(Inventory)
    .filter(Inventory.company_code == company_code)
    .order_by(Inventory.created_at.asc())
    .all()
)

    total_textile_waste = sum(
        item.quantity or 0
        for item in inventory_items
    )

    recyclable_waste = sum(
        item.quantity or 0
        for item in inventory_items
        if _is_recyclable(item.recyclability)
    )

    reusable_waste = sum(
        item.quantity or 0
        for item in inventory_items
        if _is_reusable(item.recyclability)
    )

    # ========================================================
    # NEW: ENVIRONMENTAL IMPACT
    # ========================================================
    # Uses the same database inventory data.
    # Nothing in the existing sustainability calculation
    # is changed.

    environmental_impact = get_environmental_impact(
    db,
    company_code
)

    # ========================================================
    # FABRIC ANALYSIS
    # ========================================================

    fabric_data = defaultdict(
        lambda: {
            "quantity": 0,
            "recyclability": [],
            "reuse": [],
        }
    )

    for item in inventory_items:

        fabric = item.fabric_type or "Unknown"

        fabric_data[fabric]["quantity"] += (
            item.quantity or 0
        )

        recyclability = _percentage(
            item.recyclability
        )

        if recyclability > 0:
            fabric_data[fabric][
                "recyclability"
            ].append(recyclability)

        if _is_reusable(
            item.recyclability
        ):
            fabric_data[fabric][
                "reuse"
            ].append(100.0)

    fabric_analysis = []

    for fabric, data in fabric_data.items():

        recycle_values = data[
            "recyclability"
        ]

        reuse_values = data["reuse"]

        avg_recyclability = (
            sum(recycle_values)
            / len(recycle_values)
            if recycle_values
            else 0.0
        )

        reuse_potential = (
            sum(reuse_values)
            / len(reuse_values)
            if reuse_values
            else 0.0
        )

        fabric_analysis.append(
            {
                "fabric_type": fabric,
                "waste_quantity": data[
                    "quantity"
                ],
                "recyclability": round(
                    avg_recyclability,
                    2,
                ),
                "reuse_potential": round(
                    reuse_potential,
                    2,
                ),
                "performance": _performance(
                    avg_recyclability
                ),
            }
        )

    fabric_analysis.sort(
        key=lambda item: item[
            "waste_quantity"
        ],
        reverse=True,
    )

    # ========================================================
    # UPLOAD ANALYSIS
    # ========================================================

    uploads = (
    db.query(Upload)
    .filter(Upload.company_code == company_code)
    .order_by(Upload.created_at.desc())
    .all()
)

    # ========================================================
    # SUSTAINABILITY SCORE
    # ========================================================

    scores = [
        float(upload.score)
        for upload in uploads
        if upload.score is not None
    ]

    if scores:
        sustainability_score = (
            sum(scores) / len(scores)
        )
    else:
        recyclability_scores = [
            _percentage(item.recyclability)
            for item in inventory_items
            if _percentage(
                item.recyclability
            ) > 0
        ]

        sustainability_score = (
            sum(recyclability_scores)
            / len(recyclability_scores)
            if recyclability_scores
            else 0.0
        )

    sustainability_score = round(
        min(
            max(
                sustainability_score,
                0.0,
            ),
            100.0,
        ),
        2,
    )

    # ========================================================
    # RECENT ANALYSIS
    # ========================================================

    recent_analysis = []

    for upload in uploads[:10]:

        if upload.score is not None:
            score = float(upload.score)
        else:
            score = max(
                _percentage(upload.recycle),
                _percentage(upload.reuse),
                _percentage(upload.repair),
                _percentage(upload.confidence),
            )

        if score >= 85:
            status = "Highly Sustainable"
        elif score >= 70:
            status = "Sustainable"
        elif score >= 50:
            status = "Moderately Sustainable"
        else:
            status = "Needs Improvement"

        created_at = upload.created_at

        if created_at:
            time = created_at.strftime(
                "%Y-%m-%d %H:%M:%S"
            )
        else:
            time = "-"

        recent_analysis.append(
            {
                "material": (
                    upload.material
                    or "Unknown"
                ),
                "status": status,
                "score": round(score, 2),
                "recommendation": (
                    _recommendation(upload)
                ),
                "time": time,
            }
        )

    # ========================================================
    # MONTHLY WASTE
    # ========================================================

    monthly_waste = defaultdict(int)

    for item in inventory_items:

        if item.created_at:

            month = item.created_at.strftime(
                "%Y-%m"
            )

            monthly_waste[month] += (
                item.quantity or 0
            )

    months = sorted(
        monthly_waste.keys()
    )[-6:]

    waste_overview = []

    for month in months:

        waste_overview.append(
            {
                "month": datetime.strptime(
                    month,
                    "%Y-%m",
                ).strftime("%b"),
                "value": monthly_waste[
                    month
                ],
            }
        )

    # ========================================================
    # RESPONSE
    # ========================================================

    return {
        "stats": {
            # ------------------------------------------------
            # EXISTING DATA — UNCHANGED
            # ------------------------------------------------

            "total_textile_waste": (
                total_textile_waste
            ),

            "recyclable_waste": (
                recyclable_waste
            ),

            "reusable_waste": (
                reusable_waste
            ),

            "sustainability_score": (
                sustainability_score
            ),

            # ------------------------------------------------
            # NEW ENVIRONMENTAL DATA
            # ------------------------------------------------

            "co2_saved": (
                environmental_impact[
                    "co2_saved"
                ]
            ),

            "water_saved": (
                environmental_impact[
                    "water_saved"
                ]
            ),

            "land_saved": (
                environmental_impact[
                    "land_saved"
                ]
            ),

            "diverted_quantity": (
                environmental_impact[
                    "diverted_quantity"
                ]
            ),

            "co2_unit": (
                environmental_impact[
                    "co2_unit"
                ]
            ),

            "water_unit": (
                environmental_impact[
                    "water_unit"
                ]
            ),

            "land_unit": (
                environmental_impact[
                    "land_unit"
                ]
            ),

            "environmental_impact_estimated": (
                environmental_impact[
                    "is_estimated"
                ]
            ),
        },

        # ----------------------------------------------------
        # EXISTING DATA — UNCHANGED
        # ----------------------------------------------------

        "waste_overview": waste_overview,

        "fabric_analysis": fabric_analysis,

        "recent_analysis": recent_analysis,
    }