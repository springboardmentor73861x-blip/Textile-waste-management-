from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.core.security import get_current_user
from app.models.upload import Upload


router = APIRouter(
    prefix="/recommendations",
    tags=["Recommendations"]
)


# =========================================================
# HELPER FUNCTIONS
# =========================================================

def to_number(value, default=0):
    """
    Safely convert database values to float.
    """
    try:
        if value is None:
            return default

        if isinstance(value, str):
            value = value.replace("%", "").strip()

        return float(value)

    except (ValueError, TypeError):
        return default


def normalize_text(value):
    """
    Safely convert values to lowercase text.
    """
    if value is None:
        return ""

    return str(value).strip().lower()


def get_priority(score, recycle, reuse, repair):
    """
    Determine recommendation priority from existing
    prediction/scoring data.
    """

    values = [
        to_number(score),
        to_number(recycle),
        to_number(reuse),
        to_number(repair),
    ]

    highest = max(values)

    if highest >= 80:
        return "High"

    return "Medium"


def get_impact(score, recycle, reuse, repair):
    """
    Determine expected sustainability impact.
    """

    values = [
        to_number(score),
        to_number(recycle),
        to_number(reuse),
        to_number(repair),
    ]

    highest = max(values)

    if highest >= 80:
        return "High"

    return "Medium"


def build_recommendation(upload):
    """
    Generate a recommendation from the actual
    prediction stored in the Upload table.

    No hardcoded textile records are used here.
    """

    material = upload.material or "Unknown"
    waste_type = upload.waste_type or "Unknown"

    recycle = to_number(upload.recycle)
    reuse = to_number(upload.reuse)
    repair = to_number(upload.repair)
    score = to_number(upload.score)

    waste_text = normalize_text(waste_type)

    # -----------------------------------------------------
    # Determine recommendation
    # -----------------------------------------------------

    # 1. Recycling
    if recycle >= 70 and recycle >= reuse and recycle >= repair:

        category = "Recycling"

        title = f"Prioritize {material} Recycling"

        description = (
            f"The AI analysis indicates that {material} has "
            f"strong recycling potential. Route suitable "
            f"{material} textile waste to an appropriate "
            f"recycling process."
        )

        action = "Send for Recycling"

    # -----------------------------------------------------
    # 2. Reuse
    # -----------------------------------------------------

    elif reuse >= 60 and reuse >= recycle and reuse >= repair:

        category = "Reuse"

        title = f"Reuse {material} Textile"

        description = (
            f"The AI analysis indicates that the {material} "
            f"textile has good reuse potential. Consider "
            f"secondary applications before recycling."
        )

        action = "Reuse Material"

    # -----------------------------------------------------
    # 3. Repair / Reuse
    # -----------------------------------------------------

    elif repair >= 60:

        category = "Reuse"

        title = f"Repair and Reuse {material}"

        description = (
            f"The analyzed {material} textile shows repair "
            f"potential. Repairing the material before disposal "
            f"can extend its useful life and reduce textile waste."
        )

        action = "Repair Material"

    # -----------------------------------------------------
    # 4. Waste Reduction
    # -----------------------------------------------------

    else:

        category = "Waste Reduction"

        title = f"Reduce {material} Waste"

        description = (
            f"The current AI analysis does not show a strong "
            f"recycling, reuse or repair pathway for this "
            f"{material} textile. Improve material utilization "
            f"and reduce avoidable waste."
        )

        action = "Reduce Waste"

    # -----------------------------------------------------
    # Priority and impact
    # -----------------------------------------------------

    priority = get_priority(
        score,
        recycle,
        reuse,
        repair
    )

    impact = get_impact(
        score,
        recycle,
        reuse,
        repair
    )

    # -----------------------------------------------------
    # Status
    # -----------------------------------------------------

    status = "Recommended"

    # -----------------------------------------------------
    # Return frontend-ready object
    # -----------------------------------------------------

    return {
        "id": upload.id,
        "priority": priority,
        "category": category,
        "material": material,
        "title": title,
        "description": description,
        "action": action,
        "impact": impact,
        "status": status,

        # Real prediction information
        "waste_type": waste_type,
        "confidence": to_number(upload.confidence),
        "recycle": recycle,
        "reuse": reuse,
        "repair": repair,
        "score": score,

        "created_at": (
            upload.created_at.isoformat()
            if upload.created_at
            else None
        ),
    }


# =========================================================
# GET RECOMMENDATIONS
# =========================================================

@router.get("/")
def get_recommendations(
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    """
    Return recommendations generated from the user's
    real uploaded textile predictions.
    """

    user_email = current_user["email"]

    uploads = (
        db.query(Upload)
        .filter(
            Upload.uploaded_by == user_email
        )
        .order_by(
            Upload.created_at.desc()
        )
        .limit(20)
        .all()
    )

    recommendations = [
        build_recommendation(upload)
        for upload in uploads
    ]

    # -----------------------------------------------------
    # Overview counts
    # -----------------------------------------------------

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

    # -----------------------------------------------------
    # Expected overall impact
    # -----------------------------------------------------

    high_impact_count = sum(
        1
        for item in recommendations
        if item["impact"] == "High"
    )

    if high_impact_count > 0:
        expected_impact = "High"
    elif recommendations:
        expected_impact = "Medium"
    else:
        expected_impact = "—"

    # -----------------------------------------------------
    # Dynamic AI insight
    # -----------------------------------------------------

    if not recommendations:

        insight_title = "No textile analysis available yet"

        insight_description = (
            "Upload and analyze textile images to generate "
            "AI-based sustainability recommendations."
        )

    elif recycling_count >= reuse_count and recycling_count >= waste_reduction_count:

        insight_title = "Prioritize recyclable textile materials first"

        insight_description = (
            f"Current AI analysis contains {recycling_count} "
            f"recycling recommendation(s). Suitable textile "
            f"waste should be routed toward recycling where "
            f"material conditions allow."
        )

    elif reuse_count >= waste_reduction_count:

        insight_title = "Prioritize textile reuse opportunities"

        insight_description = (
            f"Current AI analysis contains {reuse_count} "
            f"reuse recommendation(s). Suitable materials "
            f"should be considered for secondary use before "
            f"disposal."
        )

    else:

        insight_title = "Focus on reducing avoidable textile waste"

        insight_description = (
            f"Current AI analysis contains {waste_reduction_count} "
            f"waste-reduction recommendation(s). Improving "
            f"material utilization can help reduce avoidable waste."
        )

    return {
        "total": len(recommendations),

        "overview": {
            "recycling": recycling_count,
            "reuse": reuse_count,
            "waste_reduction": waste_reduction_count,
            "expected_impact": expected_impact,
        },

        "insight": {
            "title": insight_title,
            "description": insight_description,
        },

        "recommendations": recommendations,
    }