from typing import Dict, Any


# ============================================================
# TEXTILE RECYCLING RECOMMENDATION ENGINE
# ============================================================

FABRIC_RECOMMENDATIONS = {

    "cotton": {
        "material_type": "Natural Fiber",
        "composition": "Cotton fiber",
        "recyclability": "High",
        "biodegradability": "High",
        "recommended_processing":
            "Mechanical Textile Recycling",
        "potential_reuse":
            "Recover cotton fibers for yarn, insulation, "
            "wiping products or composite materials.",
    },

    "denim": {
        "material_type": "Natural / Cotton-Based Fiber",
        "composition": "Primarily cotton fiber",
        "recyclability": "High",
        "biodegradability": "High",
        "recommended_processing":
            "Mechanical Textile Recycling",
        "potential_reuse":
            "Recover denim fibers for insulation, wiping "
            "products, recycled yarn and composite materials.",
    },

    "linen": {
        "material_type": "Natural Fiber",
        "composition": "Flax fiber",
        "recyclability": "High",
        "biodegradability": "High",
        "recommended_processing":
            "Mechanical Textile Recycling",
        "potential_reuse":
            "Recover linen fibers for recycled textile "
            "products and composite applications.",
    },

    "wool": {
        "material_type": "Natural Animal Fiber",
        "composition": "Wool fiber",
        "recyclability": "High",
        "biodegradability": "High",
        "recommended_processing":
            "Mechanical Textile Recycling",
        "potential_reuse":
            "Recover wool fibers for yarn, insulation and "
            "other textile products.",
    },

    "polyester": {
        "material_type": "Synthetic Fiber",
        "composition": "Polyester polymer",
        "recyclability": "High",
        "biodegradability": "Very Low",
        "recommended_processing":
            "Mechanical or Chemical Polyester Recycling",
        "potential_reuse":
            "Recover polyester fibers for recycled yarn, "
            "filling and other textile products.",
    },

    "nylon": {
        "material_type": "Synthetic Fiber",
        "composition": "Polyamide fiber",
        "recyclability": "High",
        "biodegradability": "Very Low",
        "recommended_processing":
            "Mechanical or Chemical Nylon Recycling",
        "potential_reuse":
            "Recover nylon for recycled yarn and polymer "
            "applications.",
    },

    "acrylic": {
        "material_type": "Synthetic Fiber",
        "composition": "Acrylic polymer",
        "recyclability": "Low",
        "biodegradability": "Very Low",
        "recommended_processing":
            "Specialized Synthetic Textile Recycling",
        "potential_reuse":
            "Assess for fiber recovery and suitable composite "
            "applications.",
    },

    "rayon": {
        "material_type": "Regenerated Cellulosic Fiber",
        "composition": "Regenerated cellulose",
        "recyclability": "Moderate",
        "biodegradability": "Moderate",
        "recommended_processing":
            "Specialized Cellulosic Textile Recycling",
        "potential_reuse":
            "Recover suitable cellulose fibers for textile "
            "or composite applications.",
    },

    "silk": {
        "material_type": "Natural Protein Fiber",
        "composition": "Silk protein fiber",
        "recyclability": "Moderate",
        "biodegradability": "High",
        "recommended_processing":
            "Mechanical Textile Recovery",
        "potential_reuse":
            "Reuse or recover silk fibers for suitable textile "
            "applications.",
    },

    "mixed fabrics": {
        "material_type": "Blended Textile",
        "composition": "Mixed fiber composition",
        "recyclability": "Low",
        "biodegradability": "Low",
        "recommended_processing":
            "Specialized Textile Recycling Assessment",
        "potential_reuse":
            "Separate suitable components for reuse or "
            "material recovery.",
    },
}


# ============================================================
# NORMALIZATION
# ============================================================

def normalize_text(value: Any) -> str:

    if value is None:
        return ""

    return str(value).strip().lower()


# ============================================================
# MAIN RECOMMENDATION
# ============================================================

def generate_recycling_recommendation(
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

    fabric_key = normalize_text(
        fabric_type
    )

    recommendation = FABRIC_RECOMMENDATIONS.get(
        fabric_key
    )

    if recommendation is None:

        recommendation = {
            "material_type":
                prediction.get(
                    "material_type",
                    "Unknown",
                ),

            "composition":
                prediction.get(
                    "composition",
                    "Unknown",
                ),

            "recyclability":
                prediction.get(
                    "recyclability",
                    "Assessment Required",
                ),

            "biodegradability":
                prediction.get(
                    "biodegradability",
                    "Assessment Required",
                ),

            "recommended_processing":
                prediction.get(
                    "recommended_processing",
                    "Specialized Textile Recycling Assessment",
                ),

            "potential_reuse":
                prediction.get(
                    "potential_reuse",
                    "Assess textile for suitable reuse before disposal.",
                ),
        }

    material_type = recommendation[
        "material_type"
    ]

    composition = recommendation[
        "composition"
    ]

    recyclability = recommendation[
        "recyclability"
    ]

    biodegradability = recommendation[
        "biodegradability"
    ]

    recommended_processing = recommendation[
        "recommended_processing"
    ]

    potential_reuse = recommendation[
        "potential_reuse"
    ]

    # --------------------------------------------------------
    # Category
    # --------------------------------------------------------

    recyclability_lower = normalize_text(
        recyclability
    )

    if "very high" in recyclability_lower:
        category = "Very High"

    elif "high" in recyclability_lower:
        category = "High"

    elif (
        "moderate" in recyclability_lower
        or "medium" in recyclability_lower
    ):
        category = "Moderate"

    elif "low" in recyclability_lower:
        category = "Low"

    else:
        category = "Assessment Required"

    # --------------------------------------------------------
    # Priority
    # --------------------------------------------------------

    if category in ["Very High", "High"]:
        priority = "High"

    elif category == "Moderate":
        priority = "Medium"

    elif category == "Low":
        priority = "Low"

    else:
        priority = "Assessment Required"

    # --------------------------------------------------------
    # Sustainability score
    # --------------------------------------------------------

    if category == "Very High":
        sustainability_score = 95

    elif category == "High":
        sustainability_score = (
            95 if "high" in normalize_text(
                biodegradability
            ) else 65
        )

    elif category == "Moderate":
        sustainability_score = 60

    elif category == "Low":
        sustainability_score = 30

    else:
        sustainability_score = None

    if sustainability_score is None:
        sustainability_level = "Assessment Required"

    elif sustainability_score >= 85:
        sustainability_level = "Excellent"

    elif sustainability_score >= 70:
        sustainability_level = "Highly Sustainable"

    elif sustainability_score >= 50:
        sustainability_level = "Moderately Sustainable"

    elif sustainability_score >= 30:
        sustainability_level = "Low Sustainability"

    else:
        sustainability_level = "Requires Improvement"

    # --------------------------------------------------------
    # Recommendation summary
    # --------------------------------------------------------

    recommendation_summary = (
        f"{fabric_type} is categorized as "
        f"{category} recyclability. "
        f"The recommended pathway is "
        f"{recommended_processing}."
    )

    # --------------------------------------------------------
    # Recovery action
    # --------------------------------------------------------

    if priority == "High":

        recovery_action = (
            f"Prioritize {recommended_processing} "
            "and recover suitable textile material."
        )

    elif priority == "Medium":

        recovery_action = (
            f"Evaluate {recommended_processing} "
            "before disposal."
        )

    else:

        recovery_action = (
            "Use Specialized Textile Recycling Assessment "
            "after completing material-specific assessment."
        )

    # --------------------------------------------------------
    # Circular action
    # --------------------------------------------------------

    circular_economy_action = (
        "Prioritize reuse where practical, followed by "
        "material recovery and recycling."
    )

    # --------------------------------------------------------
    # Action plan
    # --------------------------------------------------------

    action_plan = [
        "Separate and record the textile waste batch.",
        "Assess textile for suitable reuse before disposal.",
        f"Use {recommended_processing} for suitable material.",
        "Track recovered and recycled quantities.",
    ]

    return {

        "fabric_type":
            fabric_type,

        "material_type":
            material_type,

        "composition":
            composition,

        "recyclability":
            recyclability,

        "recyclability_category":
            category,

        "biodegradability":
            biodegradability,

        "sustainability_score":
            sustainability_score,

        "sustainability_level":
            sustainability_level,

        "recycling_priority":
            priority,

        "recommended_processing":
            recommended_processing,

        "recommended_recycling_method":
            recommended_processing,

        "potential_reuse":
            potential_reuse,

        "reuse_recommendation":
            potential_reuse,

        "recovery_action":
            recovery_action,

        "disposal_guidance":
            "Follow appropriate textile waste management "
            "procedures after maximizing reuse and recovery.",

        "circular_economy_action":
            circular_economy_action,

        "recommendation_summary":
            recommendation_summary,

        "action_plan":
            action_plan,
    }


# ============================================================
# TEST
# ============================================================

if __name__ == "__main__":

    result = generate_recycling_recommendation({
        "fabric_type": "Cotton"
    })

    for key, value in result.items():
        print(f"{key}: {value}")