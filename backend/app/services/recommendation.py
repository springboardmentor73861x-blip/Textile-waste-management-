"""
TextileAI - Recycling Recommendation Engine

Milestone 3.2

Generates a practical recycling / recovery workflow
based on:
- Detected fabric
- Recyclability
- Circularity score
- Recovery potential
"""

# ==========================================================
# Recommendation Profiles
# ==========================================================

RECOMMENDATION_PROFILES = {

    "Cotton": {
        "primary_action": "Mechanical Recycling",
        "alternative_action": "Fabric Reuse",
        "reason": (
            "Cotton can be mechanically processed into "
            "recovered fibers and new yarn."
        ),
        "priority": "High",
    },

    "Denim": {
        "primary_action": "Mechanical Recycling",
        "alternative_action": "Upcycling",
        "reason": (
            "Denim can be recovered into textile fibers "
            "or converted into reusable textile products."
        ),
        "priority": "High",
    },

    "Wool": {
        "primary_action": "Reuse / Mechanical Recycling",
        "alternative_action": "Upcycling",
        "reason": (
            "Wool has strong reuse potential and can also "
            "be mechanically recovered into textile fibers."
        ),
        "priority": "High",
    },

    "Linen": {
        "primary_action": "Mechanical Recycling",
        "alternative_action": "Fabric Reuse",
        "reason": (
            "Linen fibers can be recovered and reused in "
            "new textile applications."
        ),
        "priority": "High",
    },

    "Silk": {
        "primary_action": "Reuse",
        "alternative_action": "Upcycling",
        "reason": (
            "Silk has high reuse value, so extending the "
            "material's life is preferred."
        ),
        "priority": "Medium",
    },

    "Polyester": {
        "primary_action": "Chemical Recycling",
        "alternative_action": "Mechanical Recycling",
        "reason": (
            "Polyester can be recovered through recycling "
            "processes and converted into reusable material."
        ),
        "priority": "High",
    },

    "Nylon": {
        "primary_action": "Chemical Recycling",
        "alternative_action": "Mechanical Recycling",
        "reason": (
            "Nylon can be recovered through specialized "
            "recycling processes."
        ),
        "priority": "Medium",
    },

    "Acrylic": {
        "primary_action": "Reuse / Upcycling",
        "alternative_action": "Industrial Recovery",
        "reason": (
            "Reuse or upcycling is preferable when direct "
            "recycling is technically difficult."
        ),
        "priority": "Medium",
    },

    "Rayon": {
        "primary_action": "Reuse",
        "alternative_action": "Industrial Recovery",
        "reason": (
            "Reuse can extend the life of rayon products "
            "before considering recovery processes."
        ),
        "priority": "Medium",
    },

    "Leather": {
        "primary_action": "Reuse / Upcycling",
        "alternative_action": "Industrial Recovery",
        "reason": (
            "Leather products can often be reused or "
            "converted into new products through upcycling."
        ),
        "priority": "High",
    },

    "Fleece": {
        "primary_action": "Mechanical Recycling",
        "alternative_action": "Reuse",
        "reason": (
            "Fleece can be recovered into reusable textile "
            "material where suitable processing facilities exist."
        ),
        "priority": "Medium",
    },

    "Corduroy": {
        "primary_action": "Mechanical Recycling",
        "alternative_action": "Upcycling",
        "reason": (
            "Corduroy can be recovered into textile fibers "
            "or repurposed into new textile products."
        ),
        "priority": "Medium",
    },

    "Velvet": {
        "primary_action": "Reuse / Upcycling",
        "alternative_action": "Mechanical Recycling",
        "reason": (
            "Reuse and upcycling can preserve material value "
            "before recycling is considered."
        ),
        "priority": "Medium",
    },
}


# ==========================================================
# Default Recommendation
# ==========================================================

DEFAULT_PROFILE = {
    "primary_action": "Industrial Recovery",
    "alternative_action": "Reuse",
    "reason": (
        "The material requires further assessment before "
        "selecting an appropriate recovery pathway."
    ),
    "priority": "Low",
}


# ==========================================================
# Normalize Fabric Name
# ==========================================================

def normalize_fabric(fabric: str | None) -> str:

    if not fabric:
        return "Unknown"

    fabric = fabric.strip()

    for known_fabric in RECOMMENDATION_PROFILES:

        if fabric.lower() == known_fabric.lower():
            return known_fabric

    return fabric.title()


# ==========================================================
# Determine Recommendation Priority
# ==========================================================

def determine_priority(
    circularity_score: float,
    recyclability: str | None,
) -> str:

    if circularity_score >= 80:
        return "High"

    if circularity_score >= 60:
        return "Medium"

    if recyclability:

        value = recyclability.lower()

        if value == "high":
            return "High"

        if value in {"medium", "moderate"}:
            return "Medium"

    return "Low"


# ==========================================================
# Main Recommendation Function
# ==========================================================

def generate_recommendation(
    fabric: str | None,
    recyclability: str | None = None,
    circularity_score: float = 0,
    recovery_category: str | None = None,
) -> dict:
    """
    Generate a recycling/recovery workflow.

    Parameters
    ----------
    fabric:
        AI predicted textile.

    recyclability:
        AI recyclability classification.

    circularity_score:
        Sustainability engine circularity score.

    recovery_category:
        Sustainability recovery classification.
    """

    material = normalize_fabric(fabric)

    profile = RECOMMENDATION_PROFILES.get(
        material,
        DEFAULT_PROFILE,
    ).copy()

    # ------------------------------------------------------
    # Priority
    # ------------------------------------------------------

    priority = determine_priority(
        circularity_score,
        recyclability,
    )

    # ------------------------------------------------------
    # Low Recovery Override
    # ------------------------------------------------------

    if circularity_score < 40:

        profile["primary_action"] = (
            "Industrial Recovery / Controlled Disposal"
        )

        profile["alternative_action"] = (
            "Material Assessment"
        )

        profile["reason"] = (
            "The current recovery potential is limited. "
            "Further material assessment is recommended "
            "before selecting a recovery pathway."
        )

        priority = "Low"

    # ------------------------------------------------------
    # Build Workflow
    # ------------------------------------------------------

    workflow = [
        "Inspect and sort textile",
        "Separate unsuitable materials",
        profile["primary_action"],
        "Recover or process material",
        "Reuse recovered material",
    ]

    # ------------------------------------------------------
    # Return Result
    # ------------------------------------------------------

    return {
        "fabric": material,

        "primary_action": profile[
            "primary_action"
        ],

        "alternative_action": profile[
            "alternative_action"
        ],

        "reason": profile[
            "reason"
        ],

        "priority": priority,

        "recyclability": recyclability or "Unknown",

        "circularity_score": round(
            float(circularity_score),
            2,
        ),

        "recovery_category": (
            recovery_category
            or "Unknown"
        ),

        "workflow": workflow,
    }