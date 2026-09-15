from typing import Any


def _score(value: Any) -> float:
    """
    Convert different backend values into a 0-100 score.

    Supports:
    - 91
    - "91"
    - "91%"
    - "High"
    - "Medium"
    - "Low"
    - "Yes"
    - "No"
    """

    if value is None:
        return 0.0

    if isinstance(value, (int, float)):
        return max(0.0, min(100.0, float(value)))

    text = str(value).strip().lower()

    if not text:
        return 0.0

    # Numeric values
    cleaned = text.replace("%", "").strip()

    try:
        number = float(cleaned)

        # If backend ever sends 0.0 - 1.0
        if 0 <= number <= 1:
            number *= 100

        return max(0.0, min(100.0, number))

    except ValueError:
        pass

    # Text-based values
    if text in {"yes", "true", "recommended", "high", "excellent"}:
        return 90.0

    if text in {"medium", "moderate", "good"}:
        return 65.0

    if text in {"low", "limited", "poor"}:
        return 30.0

    if text in {"no", "false", "not recommended"}:
        return 10.0

    return 0.0


def _priority(score: float) -> str:
    if score >= 75:
        return "High"

    return "Medium"


def _impact(score: float) -> str:
    if score >= 75:
        return "High"

    if score >= 50:
        return "Medium"

    return "Low"


def _recommendation_from_upload(upload):
    """
    Generate one recommendation from one real Upload database record.
    """

    material = upload.material or "Unknown Material"
    waste_type = upload.waste_type or "Unknown Waste"

    recycle_score = _score(upload.recycle)
    reuse_score = _score(upload.reuse)
    repair_score = _score(upload.repair)

    overall_score = _score(upload.score)

    # ---------------------------------------------------------
    # Determine best action
    # ---------------------------------------------------------

    scores = {
        "Recycling": recycle_score,
        "Reuse": reuse_score,
        "Repair": repair_score,
    }

    best_category = max(scores, key=scores.get)
    best_score = scores[best_category]

    waste_text = waste_type.lower()

    # ---------------------------------------------------------
    # Waste-specific priority
    # ---------------------------------------------------------

    if "hazard" in waste_text:
        category = "Waste Reduction"
        action = "Reduce Waste"
        title = f"Reduce {material} Waste"
        description = (
            f"{material} has been identified as hazardous textile waste. "
            "Prioritize safe handling, controlled processing and waste "
            "reduction instead of conventional disposal."
        )

    elif "upcycl" in waste_text:
        category = "Reuse"
        action = "Upcycle Material"
        title = f"Upcycle {material} Textile"
        description = (
            f"The analyzed {material} textile has upcycling potential. "
            "Consider converting the material into secondary textile "
            "products before disposal."
        )

    elif "repair" in waste_text or best_category == "Repair":
        category = "Reuse"
        action = "Repair Material"
        title = f"Repair {material} Textile"
        description = (
            f"The analyzed {material} textile shows repair potential. "
            "Repair and extend its useful life before sending it for recycling."
        )

    elif best_category == "Reuse":
        category = "Reuse"
        action = "Reuse Material"
        title = f"Reuse {material} Textile"
        description = (
            f"The analyzed {material} material shows strong reuse potential. "
            "Consider secondary applications before recycling or disposal."
        )

    elif best_category == "Recycling":
        category = "Recycling"
        action = "Send for Recycling"
        title = f"Prioritize {material} Recycling"
        description = (
            f"{material} textile waste shows recycling potential. "
            "Route suitable material to an appropriate textile recycling "
            "process to improve material recovery."
        )

    else:
        category = "Waste Reduction"
        action = "Reduce Waste"
        title = f"Reduce {material} Waste"
        description = (
            f"The analyzed {material} textile has limited immediate recovery "
            "potential. Improve material utilization and reduce avoidable waste."
        )

    # ---------------------------------------------------------
    # Use actual stored score for priority/impact
    # ---------------------------------------------------------

    decision_score = overall_score if overall_score > 0 else best_score

    return {
        "id": upload.id,
        "priority": _priority(decision_score),
        "category": category,
        "material": material,
        "title": title,
        "description": description,
        "action": action,
        "impact": _impact(decision_score),
        "status": "Recommended",
        "score": round(decision_score, 2),
        "wasteType": waste_type,
        "recycleScore": round(recycle_score, 2),
        "reuseScore": round(reuse_score, 2),
        "repairScore": round(repair_score, 2),
        "createdAt": (
            upload.created_at.isoformat()
            if upload.created_at
            else None
        ),
    }


def build_recommendations(uploads):
    recommendations = []

    for upload in uploads:
        recommendations.append(
            _recommendation_from_upload(upload)
        )

    return recommendations


def build_summary(recommendations):
    recycling_count = sum(
        1
        for item in recommendations
        if item["category"] == "Recycling"
    )

    reuse_count = sum(
        1
        for item in recommendations
        if item["category"] == "Reuse"
    )

    waste_reduction_count = sum(
        1
        for item in recommendations
        if item["category"] == "Waste Reduction"
    )

    impacts = {
        "High": 3,
        "Medium": 2,
        "Low": 1,
    }

    if recommendations:
        highest_impact = max(
            recommendations,
            key=lambda item: impacts.get(item["impact"], 0)
        )["impact"]
    else:
        highest_impact = "Low"

    return {
        "activeRecommendations": len(recommendations),
        "recycling": recycling_count,
        "reuse": reuse_count,
        "wasteReduction": waste_reduction_count,
        "expectedImpact": highest_impact,
    }


def build_ai_insight(recommendations):
    if not recommendations:
        return {
            "title": "No AI recommendations yet",
            "description": (
                "Upload and analyze a textile image to generate "
                "AI-based sustainability recommendations."
            ),
        }

    high_priority = sum(
        1
        for item in recommendations
        if item["priority"] == "High"
    )

    recycling = sum(
        1
        for item in recommendations
        if item["category"] == "Recycling"
    )

    reuse = sum(
        1
        for item in recommendations
        if item["category"] == "Reuse"
    )

    if recycling >= reuse and recycling > 0:
        return {
            "title": "Prioritize recyclable textile materials first",
            "description": (
                f"Current AI analysis identifies {recycling} "
                "recommendation(s) where recycling should be prioritized. "
                "Suitable textile waste should be routed toward material "
                "recovery instead of unnecessary disposal."
            ),
        }

    if reuse > 0:
        return {
            "title": "Prioritize textile reuse opportunities",
            "description": (
                f"Current AI analysis identifies {reuse} "
                "recommendation(s) with reuse potential. "
                "Consider secondary applications before recycling or disposal."
            ),
        }

    return {
        "title": "Improve textile waste utilization",
        "description": (
            f"Current AI analysis generated {len(recommendations)} "
            f"recommendation(s), including {high_priority} high-priority "
            "actions. Focus on reducing avoidable waste and improving "
            "material recovery."
        ),
    }