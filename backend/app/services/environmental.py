"""
TextileAI - Environmental Impact Assessment Engine

Milestone 3.3

Provides estimated environmental impact indicators for
textile recovery:

- Carbon emission savings
- Water savings
- Landfill diversion
- Resource recovery
- Environmental benefit score

IMPORTANT:
These are model-based estimates for sustainability analysis,
not direct measurements of real-world environmental impact.
"""

# ==========================================================
# Default Textile Impact Profiles
# ==========================================================

MATERIAL_IMPACT_PROFILES = {

    "Cotton": {
        "co2_saving_per_kg": 5.0,
        "water_saving_per_kg": 2700.0,
        "landfill_diversion": 0.90,
        "resource_recovery": 0.85,
    },

    "Denim": {
        "co2_saving_per_kg": 5.5,
        "water_saving_per_kg": 2800.0,
        "landfill_diversion": 0.90,
        "resource_recovery": 0.85,
    },

    "Wool": {
        "co2_saving_per_kg": 6.0,
        "water_saving_per_kg": 2500.0,
        "landfill_diversion": 0.85,
        "resource_recovery": 0.80,
    },

    "Linen": {
        "co2_saving_per_kg": 4.5,
        "water_saving_per_kg": 2400.0,
        "landfill_diversion": 0.90,
        "resource_recovery": 0.85,
    },

    "Silk": {
        "co2_saving_per_kg": 4.0,
        "water_saving_per_kg": 1800.0,
        "landfill_diversion": 0.80,
        "resource_recovery": 0.75,
    },

    "Polyester": {
        "co2_saving_per_kg": 4.2,
        "water_saving_per_kg": 1600.0,
        "landfill_diversion": 0.85,
        "resource_recovery": 0.80,
    },

    "Nylon": {
        "co2_saving_per_kg": 4.0,
        "water_saving_per_kg": 1500.0,
        "landfill_diversion": 0.80,
        "resource_recovery": 0.75,
    },

    "Acrylic": {
        "co2_saving_per_kg": 3.0,
        "water_saving_per_kg": 1200.0,
        "landfill_diversion": 0.65,
        "resource_recovery": 0.60,
    },

    "Rayon": {
        "co2_saving_per_kg": 3.5,
        "water_saving_per_kg": 1900.0,
        "landfill_diversion": 0.75,
        "resource_recovery": 0.70,
    },

    "Leather": {
        "co2_saving_per_kg": 7.0,
        "water_saving_per_kg": 3000.0,
        "landfill_diversion": 0.85,
        "resource_recovery": 0.80,
    },

    "Fleece": {
        "co2_saving_per_kg": 4.0,
        "water_saving_per_kg": 1500.0,
        "landfill_diversion": 0.80,
        "resource_recovery": 0.75,
    },

    "Corduroy": {
        "co2_saving_per_kg": 4.8,
        "water_saving_per_kg": 2300.0,
        "landfill_diversion": 0.85,
        "resource_recovery": 0.80,
    },

    "Velvet": {
        "co2_saving_per_kg": 4.0,
        "water_saving_per_kg": 1700.0,
        "landfill_diversion": 0.75,
        "resource_recovery": 0.70,
    },
}


# ==========================================================
# Default Profile
# ==========================================================

DEFAULT_IMPACT_PROFILE = {
    "co2_saving_per_kg": 3.0,
    "water_saving_per_kg": 1200.0,
    "landfill_diversion": 0.60,
    "resource_recovery": 0.60,
}


# ==========================================================
# Normalize Fabric
# ==========================================================

def normalize_fabric(
    fabric: str | None,
) -> str:

    if not fabric:
        return "Unknown"

    fabric = fabric.strip()

    for known_fabric in MATERIAL_IMPACT_PROFILES:

        if fabric.lower() == known_fabric.lower():
            return known_fabric

    return fabric.title()


# ==========================================================
# Get Impact Profile
# ==========================================================

def get_impact_profile(
    fabric: str,
) -> dict:

    profile = MATERIAL_IMPACT_PROFILES.get(
        fabric
    )

    if profile:
        return profile.copy()

    return DEFAULT_IMPACT_PROFILE.copy()


# ==========================================================
# Environmental Benefit Classification
# ==========================================================

def classify_environmental_benefit(
    score: float,
) -> str:

    if score >= 85:
        return "Very High"

    if score >= 70:
        return "High"

    if score >= 55:
        return "Moderate"

    if score >= 40:
        return "Low"

    return "Very Low"


# ==========================================================
# Main Environmental Impact Function
# ==========================================================

def calculate_environmental_impact(
    fabric: str | None,
    textile_weight_kg: float = 1.0,
    circularity_score: float = 0,
) -> dict:
    """
    Estimate environmental benefits from textile recovery.

    Parameters
    ----------
    fabric:
        AI predicted textile.

    textile_weight_kg:
        Estimated textile weight in kilograms.

        Default = 1 kg when actual weight is unknown.

    circularity_score:
        Circularity score from the sustainability engine.

    Returns
    -------
    dict
        Estimated environmental impact indicators.
    """

    # ------------------------------------------------------
    # Validate Weight
    # ------------------------------------------------------

    try:

        textile_weight_kg = float(
            textile_weight_kg
        )

    except (
        TypeError,
        ValueError,
    ):

        textile_weight_kg = 1.0

    # Prevent invalid negative weight.
    textile_weight_kg = max(
        0.0,
        textile_weight_kg
    )

    # ------------------------------------------------------
    # Normalize Fabric
    # ------------------------------------------------------

    material = normalize_fabric(
        fabric
    )

    # ------------------------------------------------------
    # Get Profile
    # ------------------------------------------------------

    profile = get_impact_profile(
        material
    )

    # ------------------------------------------------------
    # Calculate Environmental Metrics
    # ------------------------------------------------------

    co2_saved = (
        profile["co2_saving_per_kg"]
        * textile_weight_kg
    )

    water_saved = (
        profile["water_saving_per_kg"]
        * textile_weight_kg
    )

    landfill_diverted = (
        textile_weight_kg
        * profile["landfill_diversion"]
    )

    resources_recovered = (
        textile_weight_kg
        * profile["resource_recovery"]
    )

    # ------------------------------------------------------
    # Environmental Benefit Score
    # ------------------------------------------------------

    profile_score = (
        (
            profile["landfill_diversion"]
            * 100
        )
        + (
            profile["resource_recovery"]
            * 100
        )
    ) / 2

    # Circularity contributes to the final
    # environmental benefit assessment.
    if circularity_score > 0:

        environmental_score = (
            profile_score * 0.60
            + circularity_score * 0.40
        )

    else:

        environmental_score = profile_score

    environmental_score = round(
        max(
            0,
            min(
                100,
                environmental_score
            )
        ),
        2,
    )

    # ------------------------------------------------------
    # Environmental Classification
    # ------------------------------------------------------

    environmental_benefit = (
        classify_environmental_benefit(
            environmental_score
        )
    )

    # ------------------------------------------------------
    # Return Result
    # ------------------------------------------------------

    return {

        "fabric": material,

        "assumed_weight_kg": round(
            textile_weight_kg,
            2,
        ),

        "estimated_co2_savings_kg": round(
            co2_saved,
            2,
        ),

        "estimated_water_savings_liters": round(
            water_saved,
            2,
        ),

        "estimated_landfill_diversion_kg": round(
            landfill_diverted,
            2,
        ),

        "estimated_resource_recovery_kg": round(
            resources_recovered,
            2,
        ),

        "environmental_benefit_score": (
            environmental_score
        ),

        "environmental_benefit": (
            environmental_benefit
        ),

        "methodology": {
            "co2_saving_per_kg": profile[
                "co2_saving_per_kg"
            ],

            "water_saving_per_kg": profile[
                "water_saving_per_kg"
            ],

            "landfill_diversion_rate": profile[
                "landfill_diversion"
            ],

            "resource_recovery_rate": profile[
                "resource_recovery"
            ],
        },

        "is_estimated": True,
    }