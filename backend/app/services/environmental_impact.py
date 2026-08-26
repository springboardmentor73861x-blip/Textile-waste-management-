from typing import Dict, Any


# ============================================================
# ENVIRONMENTAL IMPACT ASSESSMENT ENGINE
# ============================================================

"""
Milestone 3 - Environmental Impact Engine

Purpose:
    Assess the environmental performance of a textile based on
    sustainability metadata and recycling recommendations.

Important:
    These values are RULE-BASED ESTIMATED INDICATORS.

    They are NOT measured Life Cycle Assessment (LCA) values.

Output includes:

    - environmental_score
    - environmental_impact_score
    - impact_level
    - water_impact
    - energy_impact
    - carbon_impact
    - co2_saved
    - water_saved
    - energy_saved
    - waste_reduction_benefit
    - resource_conservation
    - circular_economy_contribution
    - environmental_assessment
    - environmental_action
    - assessment_note
"""


# ============================================================
# TEXT NORMALIZATION
# ============================================================

def normalize_text(
    value: Any,
) -> str:

    if value is None:
        return ""

    return str(
        value
    ).strip().lower()


# ============================================================
# SAFE NUMBER
# ============================================================

def safe_float(
    value,
    default=0.0,
):

    try:

        number = float(
            value
        )

        if number < 0:
            return default

        return number

    except (
        TypeError,
        ValueError,
    ):

        return default


# ============================================================
# RECYCLABILITY SCORES
# ============================================================

RECYCLABILITY_SCORES = {

    "very high": 95,

    "high": 85,

    "moderate": 65,

    "medium": 65,

    "low": 40,

    "very low": 20,

    "not recyclable": 0,
}


# ============================================================
# BIODEGRADABILITY SCORES
# ============================================================

BIODEGRADABILITY_SCORES = {

    "very high": 95,

    "high": 85,

    "moderate": 65,

    "medium": 65,

    "low": 35,

    "very low": 15,

    "non-biodegradable": 0,
}


# ============================================================
# GET RECYCLABILITY SCORE
# ============================================================

def get_recyclability_score(
    recyclability: Any,
) -> float:

    value = normalize_text(
        recyclability
    )

    ordered_scores = sorted(
        RECYCLABILITY_SCORES.items(),
        key=lambda item: len(item[0]),
        reverse=True,
    )

    for keyword, score in ordered_scores:

        if keyword in value:

            return float(
                score
            )

    return 50.0


# ============================================================
# GET BIODEGRADABILITY SCORE
# ============================================================

def get_biodegradability_score(
    biodegradability: Any,
) -> float:

    value = normalize_text(
        biodegradability
    )

    ordered_scores = sorted(
        BIODEGRADABILITY_SCORES.items(),
        key=lambda item: len(item[0]),
        reverse=True,
    )

    for keyword, score in ordered_scores:

        if keyword in value:

            return float(
                score
            )

    return 50.0


# ============================================================
# GET IMPACT LEVEL
# ============================================================

def get_impact_level(
    score: float,
) -> str:

    if score >= 80:

        return "Low Impact"

    if score >= 60:

        return "Moderate Impact"

    if score >= 40:

        return "Medium-High Impact"

    return "High Impact"


# ============================================================
# WATER IMPACT
# ============================================================

def get_water_impact(
    fabric_type: str,
    material_type: str,
) -> str:

    fabric = normalize_text(
        fabric_type
    )

    material = normalize_text(
        material_type
    )

    if (
        "cotton" in fabric
        or "natural fiber" in material
        or "natural fibre" in material
    ):

        return (
            "Moderate to high water-resource impact "
            "associated with cultivation and processing."
        )

    if (
        "polyester" in fabric
        or "nylon" in fabric
        or "acrylic" in fabric
    ):

        return (
            "Lower direct agricultural water demand, "
            "but synthetic-fiber processing can still "
            "require significant resources."
        )

    if "denim" in fabric:

        return (
            "Moderate water-resource impact, "
            "especially during textile processing."
        )

    return (
        "Material-specific water-resource impact."
    )


# ============================================================
# ENERGY IMPACT
# ============================================================

def get_energy_impact(
    fabric_type: str,
    recommended_recycling_method: str,
) -> str:

    fabric = normalize_text(
        fabric_type
    )

    method = normalize_text(
        recommended_recycling_method
    )

    if (
        "mechanical" in method
        or "fiber recovery" in method
        or "fibre recovery" in method
    ):

        return (
            "Mechanical recovery can require less processing "
            "energy than some chemical or thermal pathways."
        )

    if (
        "chemical" in method
        or "thermal" in method
    ):

        return (
            "Higher processing energy requirement "
            "may be involved."
        )

    if (
        "cotton" in fabric
        or "linen" in fabric
        or "wool" in fabric
    ):

        return (
            "Potential for moderate energy savings "
            "through material recovery."
        )

    return (
        "Energy requirement depends on the "
        "selected processing method."
    )


# ============================================================
# CARBON IMPACT
# ============================================================

def get_carbon_impact(
    fabric_type: str,
    material_type: str,
    recommended_recycling_method: str,
) -> str:

    fabric = normalize_text(
        fabric_type
    )

    material = normalize_text(
        material_type
    )

    method = normalize_text(
        recommended_recycling_method
    )

    if (
        "mechanical" in method
        or "fiber recovery" in method
        or "fibre recovery" in method
    ):

        return (
            "Material recovery can reduce the need for virgin "
            "fiber production and associated emissions."
        )

    if (
        "synthetic" in material
        or "polyester" in fabric
        or "nylon" in fabric
        or "acrylic" in fabric
    ):

        return (
            "Synthetic-fiber production can have "
            "higher carbon-impact potential."
        )

    return (
        "Carbon impact depends on material source, "
        "processing and end-of-life pathway."
    )


# ============================================================
# WASTE REDUCTION BENEFIT
# ============================================================

def get_waste_reduction_benefit(
    recycling_priority: str,
    reuse_recommendation: str,
) -> str:

    priority = normalize_text(
        recycling_priority
    )

    reuse = normalize_text(
        reuse_recommendation
    )

    if (
        priority == "high"
        or reuse
    ):

        return (
            "High potential to divert textile waste "
            "from disposal through reuse and recycling."
        )

    if priority == "medium":

        return (
            "Moderate potential to reduce textile "
            "waste through appropriate recovery."
        )

    return (
        "Potential waste reduction depends on "
        "available recovery pathways."
    )


# ============================================================
# RESOURCE CONSERVATION
# ============================================================

def get_resource_conservation(
    recyclability_score: float,
) -> str:

    if recyclability_score >= 80:

        return (
            "High potential to conserve textile "
            "resources through material recovery."
        )

    if recyclability_score >= 60:

        return (
            "Moderate potential to conserve textile "
            "resources through recovery and reuse."
        )

    if recyclability_score >= 40:

        return (
            "Limited resource conservation potential; "
            "specialized recovery may be required."
        )

    return (
        "Low resource conservation potential under "
        "current recovery options."
    )


# ============================================================
# CIRCULAR ECONOMY CONTRIBUTION
# ============================================================

def get_circular_economy_contribution(
    recycling_priority: str,
    reuse_recommendation: str,
    recommended_recycling_method: str,
) -> str:

    priority = normalize_text(
        recycling_priority
    )

    reuse = normalize_text(
        reuse_recommendation
    )

    method = normalize_text(
        recommended_recycling_method
    )

    if (
        priority == "high"
        and reuse
        and method
    ):

        return (
            "Strong contribution to circular textile "
            "flows through reuse, recovery and recycling."
        )

    if priority in [
        "high",
        "medium",
    ]:

        return (
            "Moderate contribution to circular textile "
            "flows through material recovery."
        )

    return (
        "Potential contribution to circular economy "
        "through appropriate recovery pathways."
    )


# ============================================================
# ENVIRONMENTAL ASSESSMENT
# ============================================================

def get_environmental_assessment(
    fabric_type: str,
    environmental_score: float,
) -> str:

    fabric = fabric_type

    if environmental_score >= 80:

        return (
            f"{fabric} has strong environmental performance. "
            "Reuse and appropriate recycling can further "
            "reduce resource consumption and textile waste."
        )

    if environmental_score >= 60:

        return (
            f"{fabric} has moderate environmental performance. "
            "Appropriate recycling and reuse can improve "
            "its overall environmental outcome."
        )

    if environmental_score >= 40:

        return (
            f"{fabric} has relatively high environmental "
            "impact potential. Material recovery and "
            "appropriate processing should be prioritized."
        )

    return (
        f"{fabric} requires careful environmental management. "
        "Recovery, reuse and specialized processing should "
        "be considered before disposal."
    )


# ============================================================
# ENVIRONMENTAL ACTION
# ============================================================

def get_environmental_action(
    recycling_priority: str,
    reuse_recommendation: str,
) -> str:

    priority = normalize_text(
        recycling_priority
    )

    reuse = normalize_text(
        reuse_recommendation
    )

    if priority == "high":

        return (
            "Prioritize reuse and recycling to reduce "
            "resource consumption and textile waste."
        )

    if priority == "medium":

        return (
            "Evaluate reuse and material recovery "
            "before disposal."
        )

    if reuse:

        return (
            "Prioritize suitable reuse and recovery "
            "pathways before disposal."
        )

    return (
        "Assess available recovery and disposal "
        "options carefully."
    )


# ============================================================
# ESTIMATED CO2 SAVED
# ============================================================

def calculate_co2_saved(
    quantity: float,
    recyclability_score: float,
    recycling_priority: str,
) -> float:

    quantity = safe_float(
        quantity
    )

    priority = normalize_text(
        recycling_priority
    )

    # Estimated indicator factor.
    #
    # This is NOT an LCA value.
    # It represents an illustrative avoided-impact
    # indicator based on textile recovery potential.

    base_factor = 1.5

    if priority == "high":

        base_factor = 1.87

    elif priority == "medium":

        base_factor = 1.25

    elif priority == "low":

        base_factor = 0.75

    score_factor = (
        max(
            0,
            min(
                100,
                recyclability_score,
            ),
        )
        / 100
    )

    value = (
        quantity
        * base_factor
        * score_factor
    )

    return round(
        value,
        2,
    )


# ============================================================
# ESTIMATED WATER SAVED
# ============================================================

def calculate_water_saved(
    quantity: float,
    recyclability_score: float,
) -> float:

    quantity = safe_float(
        quantity
    )

    score_factor = (
        max(
            0,
            min(
                100,
                recyclability_score,
            ),
        )
        / 100
    )

    # Estimated indicator in litres per kg.

    value = (
        quantity
        * 88
        * score_factor
    )

    return round(
        value,
        2,
    )


# ============================================================
# ESTIMATED ENERGY SAVED
# ============================================================

def calculate_energy_saved(
    quantity: float,
    recyclability_score: float,
) -> float:

    quantity = safe_float(
        quantity
    )

    score_factor = (
        max(
            0,
            min(
                100,
                recyclability_score,
            ),
        )
        / 100
    )

    # Estimated indicator in MJ per kg.

    value = (
        quantity
        * 7.04
        * score_factor
    )

    return round(
        value,
        2,
    )


# ============================================================
# MAIN ENVIRONMENTAL IMPACT ENGINE
# ============================================================

def assess_environmental_impact(
    prediction: Dict[str, Any],
) -> Dict[str, Any]:

    if not isinstance(
        prediction,
        dict,
    ):

        raise TypeError(
            "Prediction input must be a dictionary."
        )

    # --------------------------------------------------------
    # BASIC DATA
    # --------------------------------------------------------

    fabric_type = prediction.get(
        "fabric_type",
        "Unknown",
    )

    material_type = prediction.get(
        "material_type",
        "Information not available",
    )

    composition = prediction.get(
        "composition",
        "Information not available",
    )

    recyclability = prediction.get(
        "recyclability",
        "Requires assessment",
    )

    biodegradability = prediction.get(
        "biodegradability",
        "Requires assessment",
    )

    quantity = safe_float(
        prediction.get(
            "quantity",
            0,
        )
    )

    # --------------------------------------------------------
    # IMPORTANT:
    # USE THE REAL SUSTAINABILITY SCORE FROM THE
    # SUSTAINABILITY ENGINE.
    # --------------------------------------------------------

    sustainability_score = prediction.get(
        "sustainability_score",
        prediction.get(
            "sustainabilityScore",
            50.0,
        ),
    )

    try:

        sustainability_score = float(
            sustainability_score
        )

    except (
        TypeError,
        ValueError,
    ):

        sustainability_score = 50.0

    sustainability_score = max(
        0.0,
        min(
            100.0,
            sustainability_score,
        ),
    )

    # --------------------------------------------------------
    # RECOMMENDATION DATA
    # --------------------------------------------------------

    recycling_priority = prediction.get(
        "recycling_priority",
        prediction.get(
            "recyclingPriority",
            "Assessment Required",
        ),
    )

    recommended_recycling_method = prediction.get(
        "recommended_recycling_method",
        prediction.get(
            "recommendedRecyclingMethod",
            prediction.get(
                "recommended_processing",
                "Material-specific processing",
            ),
        ),
    )

    reuse_recommendation = prediction.get(
        "reuse_recommendation",
        prediction.get(
            "reuseRecommendation",
            prediction.get(
                "potential_reuse",
                "",
            ),
        ),
    )

    # --------------------------------------------------------
    # COMPONENT SCORES
    # --------------------------------------------------------

    recyclability_score = (
        get_recyclability_score(
            recyclability
        )
    )

    biodegradability_score = (
        get_biodegradability_score(
            biodegradability
        )
    )

    # --------------------------------------------------------
    # ENVIRONMENTAL SCORE
    #
    # Recyclability     = 35%
    # Biodegradability  = 35%
    # Sustainability    = 30%
    # --------------------------------------------------------

    environmental_score = (

        recyclability_score * 0.35

        + biodegradability_score * 0.35

        + sustainability_score * 0.30

    )

    environmental_score = round(
        max(
            0.0,
            min(
                100.0,
                environmental_score,
            ),
        ),
        2,
    )

    # --------------------------------------------------------
    # IMPACT LEVEL
    # --------------------------------------------------------

    impact_level = get_impact_level(
        environmental_score
    )

    # --------------------------------------------------------
    # QUALITATIVE INDICATORS
    # --------------------------------------------------------

    water_impact = get_water_impact(
        fabric_type,
        material_type,
    )

    energy_impact = get_energy_impact(
        fabric_type,
        recommended_recycling_method,
    )

    carbon_impact = get_carbon_impact(
        fabric_type,
        material_type,
        recommended_recycling_method,
    )

    # --------------------------------------------------------
    # WASTE REDUCTION
    # --------------------------------------------------------

    waste_reduction_benefit = (
        get_waste_reduction_benefit(
            recycling_priority,
            reuse_recommendation,
        )
    )

    # --------------------------------------------------------
    # RESOURCE CONSERVATION
    # --------------------------------------------------------

    resource_conservation = (
        get_resource_conservation(
            recyclability_score
        )
    )

    # --------------------------------------------------------
    # CIRCULAR ECONOMY
    # --------------------------------------------------------

    circular_economy_contribution = (
        get_circular_economy_contribution(
            recycling_priority,
            reuse_recommendation,
            recommended_recycling_method,
        )
    )

    # --------------------------------------------------------
    # ENVIRONMENTAL ASSESSMENT
    # --------------------------------------------------------

    environmental_assessment = (
        get_environmental_assessment(
            fabric_type,
            environmental_score,
        )
    )

    # --------------------------------------------------------
    # ENVIRONMENTAL ACTION
    # --------------------------------------------------------

    environmental_action = (
        get_environmental_action(
            recycling_priority,
            reuse_recommendation,
        )
    )

    # --------------------------------------------------------
    # ESTIMATED ENVIRONMENTAL BENEFITS
    # --------------------------------------------------------

    co2_saved = calculate_co2_saved(
        quantity,
        recyclability_score,
        recycling_priority,
    )

    water_saved = calculate_water_saved(
        quantity,
        recyclability_score,
    )

    energy_saved = calculate_energy_saved(
        quantity,
        recyclability_score,
    )

    # --------------------------------------------------------
    # ASSESSMENT NOTE
    # --------------------------------------------------------

    assessment_note = (
        "Environmental scores and avoided-impact values are "
        "rule-based estimated indicators. They should not be "
        "interpreted as measured lifecycle assessment results "
        "or exact carbon, water or energy footprints."
    )

    # --------------------------------------------------------
    # FINAL RESULT
    # --------------------------------------------------------

    return {

        "fabric_type":
            fabric_type,

        "material_type":
            material_type,

        "composition":
            composition,

        "quantity":
            quantity,

        "recyclability":
            recyclability,

        "recyclability_score":
            recyclability_score,

        "biodegradability":
            biodegradability,

        "biodegradability_score":
            biodegradability_score,

        "sustainability_score":
            sustainability_score,

        "recycling_priority":
            recycling_priority,

        "recommended_recycling_method":
            recommended_recycling_method,

        "reuse_recommendation":
            reuse_recommendation,

        # ----------------------------------------------------
        # Scores
        # ----------------------------------------------------

        "environmental_score":
            environmental_score,

        "environmental_impact_score":
            environmental_score,

        "impact_level":
            impact_level,

        # ----------------------------------------------------
        # Estimated quantitative indicators
        # ----------------------------------------------------

        "co2_saved":
            co2_saved,

        "co2_saved_unit":
            "kg CO2e",

        "water_saved":
            water_saved,

        "water_saved_unit":
            "litres",

        "energy_saved":
            energy_saved,

        "energy_saved_unit":
            "MJ",

        # ----------------------------------------------------
        # Qualitative indicators
        # ----------------------------------------------------

        "water_impact":
            water_impact,

        "energy_impact":
            energy_impact,

        "carbon_impact":
            carbon_impact,

        "waste_reduction_benefit":
            waste_reduction_benefit,

        "resource_conservation":
            resource_conservation,

        "circular_economy_contribution":
            circular_economy_contribution,

        "environmental_assessment":
            environmental_assessment,

        "environmental_action":
            environmental_action,

        "assessment_note":
            assessment_note,
    }


# ============================================================
# COMPATIBILITY ALIAS
# ============================================================

def calculate_environmental_impact(
    prediction: Dict[str, Any],
) -> Dict[str, Any]:

    return assess_environmental_impact(
        prediction
    )


# ============================================================
# SIMPLE TEST
# ============================================================

if __name__ == "__main__":

    test_prediction = {

        "fabric_type":
            "Cotton",

        "material_type":
            "Natural Fiber",

        "composition":
            "Cotton fiber",

        "quantity":
            1,

        "recyclability":
            "High",

        "biodegradability":
            "High",

        "sustainability_score":
            95,

        "recycling_priority":
            "High",

        "recommended_recycling_method":
            "Mechanical Textile Recycling",

        "reuse_recommendation":
            "Recover cotton fibers for yarn, insulation, wiping products or composite materials.",
    }

    result = assess_environmental_impact(
        test_prediction
    )

    print()
    print("=" * 75)
    print(
        "ENVIRONMENTAL IMPACT ASSESSMENT TEST"
    )
    print("=" * 75)

    for key, value in result.items():

        print(
            f"{key}: {value}"
        )

    print("=" * 75)