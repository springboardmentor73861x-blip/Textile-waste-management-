"""
TextileAI - Sustainability Intelligence Engine

Milestone 3.1

This module calculates:
- Sustainability score
- Circularity score
- Recovery potential
- Reuse potential
- Environmental benefit score
- Processing feasibility
- Sustainability classification

The scoring structure follows the project specification.
"""


# ============================================================
# Circularity Score Weights
# ============================================================

MATERIAL_RECYCLABILITY_WEIGHT = 0.35
MATERIAL_CONDITION_WEIGHT = 0.20
REUSE_POTENTIAL_WEIGHT = 0.20
ENVIRONMENTAL_BENEFIT_WEIGHT = 0.15
PROCESSING_FEASIBILITY_WEIGHT = 0.10


# ============================================================
# Recyclability Scores
# ============================================================

RECYCLABILITY_SCORES = {
    "High": 90,
    "Medium": 65,
    "Moderate": 65,
    "Low": 35,
    "Not Recyclable": 10,
    "Unknown": 50,
}


# ============================================================
# Material Profiles
# ============================================================

MATERIAL_PROFILES = {
    "Cotton": {
        "recyclability": 90,
        "reuse": 85,
        "environmental_benefit": 80,
        "processing": 85,
    },

    "Polyester": {
        "recyclability": 80,
        "reuse": 75,
        "environmental_benefit": 70,
        "processing": 75,
    },

    "Wool": {
        "recyclability": 85,
        "reuse": 90,
        "environmental_benefit": 85,
        "processing": 75,
    },

    "Silk": {
        "recyclability": 70,
        "reuse": 90,
        "environmental_benefit": 80,
        "processing": 65,
    },

    "Linen": {
        "recyclability": 90,
        "reuse": 85,
        "environmental_benefit": 90,
        "processing": 85,
    },

    "Denim": {
        "recyclability": 85,
        "reuse": 90,
        "environmental_benefit": 85,
        "processing": 85,
    },

    "Nylon": {
        "recyclability": 75,
        "reuse": 70,
        "environmental_benefit": 65,
        "processing": 70,
    },

    "Rayon": {
        "recyclability": 60,
        "reuse": 70,
        "environmental_benefit": 65,
        "processing": 60,
    },

    "Acrylic": {
        "recyclability": 50,
        "reuse": 60,
        "environmental_benefit": 50,
        "processing": 55,
    },

    "Mixed Fabrics": {
        "recyclability": 45,
        "reuse": 65,
        "environmental_benefit": 45,
        "processing": 40,
    },
}


# ============================================================
# Utility Functions
# ============================================================

def normalize_material(material: str | None) -> str:
    """
    Normalize AI predicted fabric name.
    """

    if not material:
        return "Unknown"

    material = material.strip()

    for known_material in MATERIAL_PROFILES:
        if material.lower() == known_material.lower():
            return known_material

    return material.title()


def get_recyclability_score(
    recyclability: str | None,
    material: str
) -> float:
    """
    Calculate material recyclability score.
    """

    if recyclability:
        value = RECYCLABILITY_SCORES.get(
            recyclability.strip(),
            None
        )

        if value is not None:
            return float(value)

    profile = MATERIAL_PROFILES.get(material)

    if profile:
        return float(profile["recyclability"])

    return 50.0


def get_material_profile(material: str) -> dict:
    """
    Return sustainability profile for a material.
    """

    profile = MATERIAL_PROFILES.get(material)

    if profile:
        return profile.copy()

    # Neutral fallback when the AI detects
    # a material not yet included in the profile.
    return {
        "recyclability": 50,
        "reuse": 50,
        "environmental_benefit": 50,
        "processing": 50,
    }


# ============================================================
# Circularity Classification
# ============================================================

def classify_circularity(score: float) -> str:
    """
    Convert circularity score into a recovery category.

    Categories follow the project specification.
    """

    if score >= 85:
        return "Excellent Recovery Potential"

    if score >= 70:
        return "High Recovery Potential"

    if score >= 55:
        return "Moderate Recovery Potential"

    if score >= 40:
        return "Limited Recovery Potential"

    return "Disposal Recommended"


# ============================================================
# Main Sustainability Intelligence Function
# ============================================================

def calculate_sustainability(
    fabric: str | None,
    recyclability: str | None = None,
    material_condition: float = 70,
    reuse_potential: float | None = None,
    environmental_benefit: float | None = None,
    processing_feasibility: float | None = None,
) -> dict:
    """
    Calculate sustainability intelligence for a textile.

    Parameters
    ----------
    fabric:
        AI predicted textile/fabric.

    recyclability:
        AI recyclability classification.

    material_condition:
        Estimated condition score from 0-100.

    reuse_potential:
        Reuse score from 0-100.

    environmental_benefit:
        Environmental benefit score from 0-100.

    processing_feasibility:
        Processing feasibility score from 0-100.
    """

    material = normalize_material(fabric)

    profile = get_material_profile(material)

    # --------------------------------------------------------
    # Determine individual scores
    # --------------------------------------------------------

    recyclability_score = get_recyclability_score(
        recyclability,
        material
    )

    if reuse_potential is None:
        reuse_potential = profile["reuse"]

    if environmental_benefit is None:
        environmental_benefit = profile["environmental_benefit"]

    if processing_feasibility is None:
        processing_feasibility = profile["processing"]

    # Keep all scores inside 0-100.
    material_condition = max(
        0,
        min(100, material_condition)
    )

    reuse_potential = max(
        0,
        min(100, reuse_potential)
    )

    environmental_benefit = max(
        0,
        min(100, environmental_benefit)
    )

    processing_feasibility = max(
        0,
        min(100, processing_feasibility)
    )

    # --------------------------------------------------------
    # Circularity Score
    # --------------------------------------------------------

    circularity_score = (
        recyclability_score
        * MATERIAL_RECYCLABILITY_WEIGHT

        + material_condition
        * MATERIAL_CONDITION_WEIGHT

        + reuse_potential
        * REUSE_POTENTIAL_WEIGHT

        + environmental_benefit
        * ENVIRONMENTAL_BENEFIT_WEIGHT

        + processing_feasibility
        * PROCESSING_FEASIBILITY_WEIGHT
    )

    circularity_score = round(
        circularity_score,
        2
    )

    # --------------------------------------------------------
    # Classification
    # --------------------------------------------------------

    recovery_category = classify_circularity(
        circularity_score
    )

    # --------------------------------------------------------
    # Sustainability Score
    # --------------------------------------------------------

    sustainability_score = round(
        (
            recyclability_score
            + material_condition
            + reuse_potential
            + environmental_benefit
            + processing_feasibility
        ) / 5,
        2
    )

    # --------------------------------------------------------
    # Return Intelligence
    # --------------------------------------------------------

    return {
        "fabric": material,

        "sustainability_score": sustainability_score,

        "circularity_score": circularity_score,

        "recovery_category": recovery_category,

        "components": {
            "material_recyclability": round(
                recyclability_score,
                2
            ),

            "material_condition": round(
                material_condition,
                2
            ),

            "reuse_potential": round(
                reuse_potential,
                2
            ),

            "environmental_benefit": round(
                environmental_benefit,
                2
            ),

            "processing_feasibility": round(
                processing_feasibility,
                2
            ),
        },

        "weights": {
            "material_recyclability": 35,
            "material_condition": 20,
            "reuse_potential": 20,
            "environmental_benefit": 15,
            "processing_feasibility": 10,
        },
    }