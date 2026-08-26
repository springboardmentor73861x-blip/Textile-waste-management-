from typing import Dict, Any


# ============================================================
# TEXTILE SUSTAINABILITY INTELLIGENCE ENGINE
# ============================================================

RECYCLABILITY_SCORES = {
    "very high": 40,
    "high": 35,
    "moderate": 25,
    "medium": 25,
    "low": 15,
    "very low": 5,
    "not recyclable": 0,
}

BIODEGRADABILITY_SCORES = {
    "very high": 30,
    "high": 30,
    "moderate": 20,
    "medium": 20,
    "low": 10,
    "very low": 5,
    "non-biodegradable": 0,
}


# ============================================================
# TEXT NORMALIZATION
# ============================================================

def normalize_text(value: Any) -> str:
    if value is None:
        return ""

    return str(value).strip().lower()


# ============================================================
# SCORE HELPERS
# ============================================================

def get_recyclability_score(recyclability: Any) -> int:
    value = normalize_text(recyclability)

    if not value:
        return 0

    ordered_scores = sorted(
        RECYCLABILITY_SCORES.items(),
        key=lambda item: len(item[0]),
        reverse=True,
    )

    for keyword, score in ordered_scores:
        if keyword in value:
            return score

    return 0


def get_biodegradability_score(biodegradability: Any) -> int:
    value = normalize_text(biodegradability)

    if not value:
        return 0

    ordered_scores = sorted(
        BIODEGRADABILITY_SCORES.items(),
        key=lambda item: len(item[0]),
        reverse=True,
    )

    for keyword, score in ordered_scores:
        if keyword in value:
            return score

    return 0


# ============================================================
# SUSTAINABILITY LEVEL
# ============================================================

def get_sustainability_level(score: int) -> str:

    if score >= 85:
        return "Excellent"

    if score >= 70:
        return "Highly Sustainable"

    if score >= 50:
        return "Moderately Sustainable"

    if score >= 30:
        return "Low Sustainability"

    return "Requires Improvement"


# ============================================================
# ASSESSMENT
# ============================================================

def get_sustainability_assessment(
    score: int,
    recyclability: str,
    biodegradability: str,
) -> str:

    recycling = normalize_text(recyclability)
    biodegradation = normalize_text(biodegradability)

    high_recycling = (
        "very high" in recycling
        or "high" in recycling
    )

    high_biodegradability = (
        "very high" in biodegradation
        or "high" in biodegradation
    )

    if (
        score >= 85
        and high_recycling
        and high_biodegradability
    ):
        return (
            "The textile has excellent sustainability "
            "potential because of its recyclability and "
            "biodegradability."
        )

    if score >= 70:
        return (
            "The textile has good sustainability potential "
            "and should be prioritized for reuse, recovery "
            "or appropriate recycling."
        )

    if score >= 50:
        return (
            "The textile has moderate sustainability "
            "potential. Material-specific recycling or "
            "reuse should be considered before disposal."
        )

    if score >= 30:
        return (
            "The textile has limited sustainability potential. "
            "Recovery and specialized processing should be "
            "considered to reduce waste."
        )

    return (
        "The textile requires careful waste management. "
        "Recovery or specialized processing should be "
        "considered before disposal."
    )


# ============================================================
# PRIMARY ACTION
# ============================================================

def get_primary_action(
    recyclability: str,
    biodegradability: str,
    recommended_processing: str,
    potential_reuse: str,
) -> str:

    recycling = normalize_text(recyclability)
    biodegradation = normalize_text(biodegradability)
    processing = normalize_text(recommended_processing)
    reuse = normalize_text(potential_reuse)

    if "very high" in recycling or "high" in recycling:

        if reuse:
            return (
                "Prioritize textile reuse followed by "
                "recycling and material recovery."
            )

        return (
            "Prioritize recycling and material recovery."
        )

    if "very high" in biodegradation or "high" in biodegradation:

        if reuse:
            return (
                "Prioritize reuse and appropriate material "
                "recovery before disposal."
            )

    if (
        "recycl" in processing
        or "mechanical" in processing
        or "fiber recovery" in processing
        or "fibre recovery" in processing
    ):
        return (
            "Use the recommended recycling or "
            "fiber-recovery process."
        )

    if reuse:
        return (
            "Prioritize reuse or recovery before disposal."
        )

    return (
        "Assess the textile for material-specific "
        "recovery before disposal."
    )


# ============================================================
# RECYCLING PRIORITY
# ============================================================

def get_recycling_priority(
    recyclability: str,
) -> str:

    value = normalize_text(recyclability)

    if "very high" in value or "high" in value:
        return "High"

    if "moderate" in value or "medium" in value:
        return "Medium"

    if "not recyclable" in value:
        return "Not Recommended"

    if "very low" in value or "low" in value:
        return "Low"

    return "Assessment Required"


# ============================================================
# CIRCULAR ECONOMY BENEFIT
# ============================================================

def get_circular_economy_benefit(
    potential_reuse: str,
    recommended_processing: str,
) -> str:

    reuse = normalize_text(potential_reuse)
    processing = normalize_text(recommended_processing)

    if "fiber" in reuse or "fibre" in reuse:
        return (
            "Supports recovery of textile fibers and "
            "reduces demand for virgin textile materials."
        )

    if "reuse" in reuse or "reusable" in reuse:
        return (
            "Extends material life through reuse and "
            "reduces textile waste generation."
        )

    if (
        "recycl" in processing
        or "mechanical" in processing
    ):
        return (
            "Supports material recovery and keeps textile "
            "resources in the circular economy."
        )

    return (
        "Potentially supports resource recovery when "
        "appropriate processing is available."
    )


# ============================================================
# MAIN ENGINE
# ============================================================

def assess_sustainability(
    prediction: Dict[str, Any],
) -> Dict[str, Any]:

    if not isinstance(prediction, dict):
        raise TypeError(
            "Prediction input must be a dictionary."
        )

    fabric_type = prediction.get(
        "fabric_type",
        "Unknown",
    )

    material_type = prediction.get(
        "material_type",
        "",
    )

    composition = prediction.get(
        "composition",
        "",
    )

    recyclability = prediction.get(
        "recyclability",
        "",
    )

    biodegradability = prediction.get(
        "biodegradability",
        "",
    )

    recommended_processing = prediction.get(
        "recommended_processing",
        "",
    )

    potential_reuse = prediction.get(
        "potential_reuse",
        "",
    )

    # --------------------------------------------------------
    # CALCULATE COMPONENT SCORES
    # --------------------------------------------------------

    recyclability_score = get_recyclability_score(
        recyclability
    )

    biodegradability_score = get_biodegradability_score(
        biodegradability
    )

    # --------------------------------------------------------
    # RECOVERY COMPONENT
    # --------------------------------------------------------

    processing_text = normalize_text(
        recommended_processing
    )

    reuse_text = normalize_text(
        potential_reuse
    )

    if (
        "recycl" in processing_text
        or "recover" in processing_text
        or "fiber" in reuse_text
        or "fibre" in reuse_text
        or "reuse" in reuse_text
    ):
        recovery_score = 30

    elif processing_text or reuse_text:
        recovery_score = 20

    else:
        recovery_score = 0

    # --------------------------------------------------------
    # FINAL SCORE
    # --------------------------------------------------------

    sustainability_score = (
        recyclability_score
        + biodegradability_score
        + recovery_score
    )

    sustainability_score = max(
        0,
        min(
            100,
            sustainability_score,
        ),
    )

    sustainability_level = get_sustainability_level(
        sustainability_score
    )

    sustainability_assessment = (
        get_sustainability_assessment(
            sustainability_score,
            recyclability,
            biodegradability,
        )
    )

    primary_action = get_primary_action(
        recyclability,
        biodegradability,
        recommended_processing,
        potential_reuse,
    )

    recycling_priority = get_recycling_priority(
        recyclability
    )

    circular_economy_benefit = (
        get_circular_economy_benefit(
            potential_reuse,
            recommended_processing,
        )
    )

    return {

        "fabric_type":
            fabric_type,

        "material_type":
            material_type,

        "composition":
            composition,

        "recyclability":
            recyclability,

        "biodegradability":
            biodegradability,

        "recommended_processing":
            recommended_processing,

        "potential_reuse":
            potential_reuse,

        "recyclability_score":
            recyclability_score,

        "biodegradability_score":
            biodegradability_score,

        "recovery_score":
            recovery_score,

        "sustainability_score":
            sustainability_score,

        "sustainability_level":
            sustainability_level,

        "sustainability_assessment":
            sustainability_assessment,

        "primary_sustainable_action":
            primary_action,

        "recycling_priority":
            recycling_priority,

        "circular_economy_benefit":
            circular_economy_benefit,
    }


def calculate_sustainability(
    prediction: Dict[str, Any],
) -> Dict[str, Any]:

    return assess_sustainability(prediction)


# ============================================================
# TEST
# ============================================================

if __name__ == "__main__":

    test_prediction = {

        "fabric_type": "Cotton",

        "material_type": "Natural Fiber",

        "composition": "Cotton fiber",

        "recyclability": "High",

        "biodegradability": "High",

        "recommended_processing":
            "Mechanical Textile Recycling",

        "potential_reuse":
            "Recover cotton fibers for yarn, insulation, "
            "wiping products or composite materials.",
    }

    result = assess_sustainability(
        test_prediction
    )

    print("\nSUSTAINABILITY ENGINE TEST")
    print("=" * 60)

    for key, value in result.items():
        print(f"{key}: {value}")