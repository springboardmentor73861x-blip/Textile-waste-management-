from collections import defaultdict
from datetime import datetime, timedelta

from sqlalchemy.orm import Session

from app.models.inventory import Inventory
from app.models.upload import Upload


# ============================================================
# HELPERS
# ============================================================

def _percentage(value):
    if value is None:
        return 0.0

    try:
        return float(
            str(value)
            .strip()
            .replace("%", "")
        )
    except (ValueError, TypeError):
        return 0.0


def _is_recyclable(value):
    if value is None:
        return False

    value = str(value).strip().lower()

    return (
        value in {
            "recyclable",
            "recycle",
            "recycled",
            "yes",
            "high",
            "excellent",
        }
        or "recyclable" in value
    )


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


def _is_repairable(value):
    if value is None:
        return False

    value = str(value).strip().lower()

    return (
        "repair" in value
        or value in {
            "yes",
            "high",
            "excellent",
        }
    )


def _performance(score):
    if score >= 85:
        return "Excellent"

    if score >= 70:
        return "Good"

    if score >= 50:
        return "Moderate"

    return "Needs Improvement"


def _average(values):
    if not values:
        return 0.0

    return round(
        sum(values) / len(values),
        2
    )


# ============================================================
# MONTHLY PERFORMANCE
# ============================================================

def _get_month_labels():
    """
    Returns the last 6 calendar months including the current month.
    """
    now = datetime.utcnow()

    months = []

    year = now.year
    month = now.month

    for _ in range(6):
        months.append(
            f"{year:04d}-{month:02d}"
        )

        month -= 1

        if month == 0:
            month = 12
            year -= 1

    return list(reversed(months))


def _month_label(month_key):
    return datetime.strptime(
        month_key,
        "%Y-%m"
    ).strftime("%b")


# ============================================================
# MAIN ANALYTICS SERVICE
# ============================================================

def get_analytics_dashboard(
    db: Session,
    company_code: str | None,
):
    """
    Company-wise sustainability analytics.

    IMPORTANT:
    - Uses existing Inventory and Upload data.
    - Does not create or modify database records.
    - Does not change existing Sustainability Dashboard calculations.
    - Does not duplicate report generation.
    """

    # ========================================================
    # COMPANY-WISE DATA
    # ========================================================

    inventory_items = (
        db.query(Inventory)
        .filter(
            Inventory.company_code == company_code
        )
        .order_by(
            Inventory.created_at.asc()
        )
        .all()
    )

    uploads = (
        db.query(Upload)
        .filter(
            Upload.company_code == company_code
        )
        .order_by(
            Upload.created_at.asc()
        )
        .all()
    )

    # ========================================================
    # BASIC TOTALS
    # ========================================================

    total_waste = sum(
        item.quantity or 0
        for item in inventory_items
    )

    recyclable_quantity = sum(
        item.quantity or 0
        for item in inventory_items
        if _is_recyclable(
            item.recyclability
        )
    )

    reusable_quantity = sum(
        item.quantity or 0
        for item in inventory_items
        if _is_reusable(
            item.recyclability
        )
    )

    repairable_quantity = sum(
        item.quantity or 0
        for item in inventory_items
        if _is_repairable(
            item.recyclability
        )
    )

    # ========================================================
    # RECOVERY / EFFICIENCY RATES
    # ========================================================

    if total_waste > 0:
        recycling_rate = round(
            (recyclable_quantity / total_waste) * 100,
            2
        )

        reuse_rate = round(
            (reusable_quantity / total_waste) * 100,
            2
        )

        repair_rate = round(
            (repairable_quantity / total_waste) * 100,
            2
        )

        recovery_quantity = (
            recyclable_quantity
            + reusable_quantity
            + repairable_quantity
        )

        recovery_rate = round(
            min(
                (recovery_quantity / total_waste) * 100,
                100
            ),
            2
        )
    else:
        recycling_rate = 0.0
        reuse_rate = 0.0
        repair_rate = 0.0
        recovery_rate = 0.0

    # ========================================================
    # SUSTAINABILITY SCORE
    # ========================================================

    upload_scores = [
        float(upload.score)
        for upload in uploads
        if upload.score is not None
    ]

    if upload_scores:
        sustainability_score = _average(
            upload_scores
        )
    else:
        inventory_scores = [
            _percentage(item.recyclability)
            for item in inventory_items
            if _percentage(
                item.recyclability
            ) > 0
        ]

        sustainability_score = _average(
            inventory_scores
        )

    sustainability_score = round(
        min(
            max(
                sustainability_score,
                0.0
            ),
            100.0
        ),
        2
    )

    # ========================================================
    # 1. PERFORMANCE TRENDS
    # ========================================================

    months = _get_month_labels()

    monthly_data = defaultdict(
        lambda: {
            "waste": 0,
            "recyclable": 0,
            "reusable": 0,
            "repairable": 0,
            "scores": [],
        }
    )

    for item in inventory_items:

        if not item.created_at:
            continue

        month_key = item.created_at.strftime(
            "%Y-%m"
        )

        if month_key not in months:
            continue

        quantity = item.quantity or 0

        monthly_data[
            month_key
        ]["waste"] += quantity

        if _is_recyclable(
            item.recyclability
        ):
            monthly_data[
                month_key
            ]["recyclable"] += quantity

        if _is_reusable(
            item.recyclability
        ):
            monthly_data[
                month_key
            ]["reusable"] += quantity

        if _is_repairable(
            item.recyclability
        ):
            monthly_data[
                month_key
            ]["repairable"] += quantity

    for upload in uploads:

        if not upload.created_at:
            continue

        month_key = upload.created_at.strftime(
            "%Y-%m"
        )

        if (
            month_key in months
            and upload.score is not None
        ):
            monthly_data[
                month_key
            ]["scores"].append(
                float(upload.score)
            )

    performance_trends = []

    for month in months:

        data = monthly_data[month]

        waste = data["waste"]

        if waste > 0:
            monthly_recycling_rate = round(
                (
                    data["recyclable"]
                    / waste
                ) * 100,
                2
            )

            monthly_reuse_rate = round(
                (
                    data["reusable"]
                    / waste
                ) * 100,
                2
            )

            monthly_recovery_rate = round(
                min(
                    (
                        (
                            data["recyclable"]
                            + data["reusable"]
                            + data["repairable"]
                        )
                        / waste
                    ) * 100,
                    100
                ),
                2
            )
        else:
            monthly_recycling_rate = 0.0
            monthly_reuse_rate = 0.0
            monthly_recovery_rate = 0.0

        monthly_score = _average(
            data["scores"]
        )

        performance_trends.append(
            {
                "month": _month_label(month),
                "waste": waste,
                "recycling_rate": monthly_recycling_rate,
                "reuse_rate": monthly_reuse_rate,
                "recovery_rate": monthly_recovery_rate,
                "sustainability_score": monthly_score,
            }
        )

    # ========================================================
    # 2. MATERIAL EFFICIENCY INSIGHTS
    # ========================================================

    material_data = defaultdict(
        lambda: {
            "quantity": 0,
            "recyclable": 0,
            "reusable": 0,
            "repairable": 0,
        }
    )

    for item in inventory_items:

        material = (
            item.fabric_type
            or "Unknown"
        )

        quantity = item.quantity or 0

        material_data[
            material
        ]["quantity"] += quantity

        if _is_recyclable(
            item.recyclability
        ):
            material_data[
                material
            ]["recyclable"] += quantity

        if _is_reusable(
            item.recyclability
        ):
            material_data[
                material
            ]["reusable"] += quantity

        if _is_repairable(
            item.recyclability
        ):
            material_data[
                material
            ]["repairable"] += quantity

    material_efficiency = []

    for material, data in material_data.items():

        quantity = data["quantity"]

        if quantity > 0:

            recovery = (
                data["recyclable"]
                + data["reusable"]
                + data["repairable"]
            )

            efficiency = round(
                min(
                    (recovery / quantity) * 100,
                    100
                ),
                2
            )

            recycling = round(
                (
                    data["recyclable"]
                    / quantity
                ) * 100,
                2
            )

            reuse = round(
                (
                    data["reusable"]
                    / quantity
                ) * 100,
                2
            )
        else:
            efficiency = 0.0
            recycling = 0.0
            reuse = 0.0

        material_efficiency.append(
            {
                "material": material,
                "waste_quantity": quantity,
                "recovery_efficiency": efficiency,
                "recycling_rate": recycling,
                "reuse_rate": reuse,
                "performance": _performance(
                    efficiency
                ),
            }
        )

    material_efficiency.sort(
        key=lambda item: item[
            "recovery_efficiency"
        ],
        reverse=True
    )

    # ========================================================
    # 3. CURRENT VS PREVIOUS PERIOD
    # ========================================================

    now = datetime.utcnow()

    current_start = now - timedelta(
        days=30
    )

    previous_start = now - timedelta(
        days=60
    )

    current_period_uploads = [
        upload
        for upload in uploads
        if upload.created_at
        and upload.created_at >= current_start
    ]

    previous_period_uploads = [
        upload
        for upload in uploads
        if upload.created_at
        and previous_start
        <= upload.created_at
        < current_start
    ]

    def period_metrics(
        period_uploads,
        period_inventory
    ):
        scores = [
            float(upload.score)
            for upload in period_uploads
            if upload.score is not None
        ]

        score = _average(scores)

        waste = sum(
            item.quantity or 0
            for item in period_inventory
        )

        recyclable = sum(
            item.quantity or 0
            for item in period_inventory
            if _is_recyclable(
                item.recyclability
            )
        )

        reusable = sum(
            item.quantity or 0
            for item in period_inventory
            if _is_reusable(
                item.recyclability
            )
        )

        repairable = sum(
            item.quantity or 0
            for item in period_inventory
            if _is_repairable(
                item.recyclability
            )
        )

        if waste > 0:
            recycling = round(
                recyclable / waste * 100,
                2
            )

            reuse = round(
                reusable / waste * 100,
                2
            )

            recovery = round(
                min(
                    (
                        recyclable
                        + reusable
                        + repairable
                    )
                    / waste
                    * 100,
                    100
                ),
                2
            )
        else:
            recycling = 0.0
            reuse = 0.0
            recovery = 0.0

        return {
            "sustainability_score": score,
            "recycling_rate": recycling,
            "reuse_rate": reuse,
            "recovery_rate": recovery,
        }

    current_inventory = [
        item
        for item in inventory_items
        if item.created_at
        and item.created_at >= current_start
    ]

    previous_inventory = [
        item
        for item in inventory_items
        if item.created_at
        and previous_start
        <= item.created_at
        < current_start
    ]

    current_metrics = period_metrics(
        current_period_uploads,
        current_inventory
    )

    previous_metrics = period_metrics(
        previous_period_uploads,
        previous_inventory
    )

    period_comparison = []

    comparison_fields = [
        (
            "Sustainability Score",
            "sustainability_score"
        ),
        (
            "Recycling Rate",
            "recycling_rate"
        ),
        (
            "Reuse Rate",
            "reuse_rate"
        ),
        (
            "Recovery Rate",
            "recovery_rate"
        ),
    ]

    for label, key in comparison_fields:

        current_value = current_metrics[key]
        previous_value = previous_metrics[key]

        change = round(
            current_value - previous_value,
            2
        )

        period_comparison.append(
            {
                "metric": label,
                "current": current_value,
                "previous": previous_value,
                "change": change,
            }
        )

    # ========================================================
    # 4. KEY INSIGHTS
    # ========================================================

    insights = []

    # Recycling insight
    if recycling_rate > 0:
        insights.append(
            {
                "type": "recycling",
                "title": "Recycling performance",
                "message": (
                    f"Current recycling rate is "
                    f"{recycling_rate}%."
                ),
                "value": recycling_rate,
            }
        )

    # Highest waste material
    highest_waste_material = None

    if material_efficiency:
        highest_waste_material = max(
            material_efficiency,
            key=lambda item: item[
                "waste_quantity"
            ]
        )

        insights.append(
            {
                "type": "material",
                "title": "Highest waste material",
                "message": (
                    f"{highest_waste_material['material']} "
                    f"has the highest recorded waste quantity "
                    f"at {highest_waste_material['waste_quantity']}."
                ),
                "value": highest_waste_material[
                    "waste_quantity"
                ],
            }
        )

    # Best-performing material
    best_material = None

    if material_efficiency:
        best_material = max(
            material_efficiency,
            key=lambda item: item[
                "recovery_efficiency"
            ]
        )

        insights.append(
            {
                "type": "efficiency",
                "title": "Best recovery efficiency",
                "message": (
                    f"{best_material['material']} has the "
                    f"highest recovery efficiency at "
                    f"{best_material['recovery_efficiency']}%."
                ),
                "value": best_material[
                    "recovery_efficiency"
                ],
            }
        )

    # Sustainability score
    insights.append(
        {
            "type": "score",
            "title": "Sustainability performance",
            "message": (
                f"Overall sustainability score is "
                f"{sustainability_score}/100."
            ),
            "value": sustainability_score,
        }
    )

    # Improvement insight
    score_change = (
        current_metrics[
            "sustainability_score"
        ]
        - previous_metrics[
            "sustainability_score"
        ]
    )

    if score_change > 0:
        insights.append(
            {
                "type": "improvement",
                "title": "Positive performance trend",
                "message": (
                    f"Sustainability score improved by "
                    f"{round(score_change, 2)} points "
                    f"compared with the previous period."
                ),
                "value": round(
                    score_change,
                    2
                ),
            }
        )

    elif score_change < 0:
        insights.append(
            {
                "type": "attention",
                "title": "Performance needs attention",
                "message": (
                    f"Sustainability score decreased by "
                    f"{abs(round(score_change, 2))} points "
                    f"compared with the previous period."
                ),
                "value": round(
                    score_change,
                    2
                ),
            }
        )

    # ========================================================
    # RESPONSE
    # ========================================================

    return {
        "overview": {
            "sustainability_score": sustainability_score,
            "recycling_rate": recycling_rate,
            "reuse_rate": reuse_rate,
            "recovery_rate": recovery_rate,
            "total_waste": total_waste,
        },

        "performance_trends": performance_trends,

        "material_efficiency": material_efficiency,

        "period_comparison": period_comparison,

        "insights": insights,
    }