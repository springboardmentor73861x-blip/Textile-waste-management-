"""
TextileAI - Circular Economy Analytics

Milestone 3.4

Aggregates the user's textile analyses and produces:
- Total analyses
- Fabric distribution
- Recyclability distribution
- Recovery potential distribution
- Average AI confidence
- Average sustainability score
- Average circularity score
- Environmental impact totals
- Recommended recovery methods

Also supports older records that were created before
environmental impact values and recommendation intelligence
were stored in the database.
"""

from collections import Counter

from app.services.environmental import (
    calculate_environmental_impact,
)


# ==========================================================
# Helper: Safe Float
# ==========================================================

def safe_float(value, default=0.0):

    try:

        if value is None:
            return default

        return float(value)

    except (TypeError, ValueError):

        return default


# ==========================================================
# Helper: Normalize Text
# ==========================================================

def normalize_text(value):

    if not value:
        return "Unknown"

    return str(value).strip()


# ==========================================================
# Helper: Get Recovery Action
# ==========================================================

def get_recovery_action(textile):

    """
    Return the best available recovery action.

    Newer records already contain primary_action.

    Older records may not have primary_action, so we derive
    the recovery method from the existing recommendation
    and fabric prediction.
    """

    # ------------------------------------------------------
    # 1. Use stored primary action if available
    # ------------------------------------------------------

    primary_action = getattr(
        textile,
        "primary_action",
        None,
    )

    if primary_action:

        action = str(primary_action).strip()

        if action and action.lower() != "unknown":
            return action

    # ------------------------------------------------------
    # 2. Check old recommendation text
    # ------------------------------------------------------

    recommendation = str(
        getattr(
            textile,
            "recommendation",
            "",
        )
        or ""
    ).lower()

    if "chemical recycl" in recommendation:
        return "Chemical Recycling"

    if "mechanical recycl" in recommendation:
        return "Mechanical Recycling"

    if "industrial recycl" in recommendation:
        return "Chemical Recycling"

    if "reuse" in recommendation:
        return "Reuse"

    if "donat" in recommendation:
        return "Reuse"

    # ------------------------------------------------------
    # 3. Fallback based on fabric prediction
    # ------------------------------------------------------

    prediction = str(
        getattr(
            textile,
            "prediction",
            "",
        )
        or ""
    ).strip().lower()

    # Synthetic materials commonly suitable for
    # chemical recycling
    chemical_recycling = {
        "polyester",
        "nylon",
        "acrylic",
        "spandex",
        "elastane",
    }

    # Natural textile materials commonly suitable for
    # mechanical recycling
    mechanical_recycling = {
        "cotton",
        "denim",
        "linen",
        "corduroy",
        "fleece",
        "wool",
        "jute",
        "hemp",
    }

    # Materials where reuse/upcycling is generally
    # a useful recovery option
    reuse_materials = {
        "silk",
        "leather",
        "velvet",
    }

    if prediction in chemical_recycling:
        return "Chemical Recycling"

    if prediction in mechanical_recycling:
        return "Mechanical Recycling"

    if prediction in reuse_materials:
        return "Reuse"

    # ------------------------------------------------------
    # 4. No information available
    # ------------------------------------------------------

    return "Unknown"


# ==========================================================
# Helper: Calculate Environmental Fallback
# ==========================================================

def get_environmental_values(textile):

    """
    Return environmental impact values for a textile.

    New records already contain environmental values in the
    database.

    Older records may have NULL/0 values because they were
    created before Milestone 3 environmental intelligence
    was integrated.

    In that case, calculate the environmental impact using
    the existing fabric prediction and circularity score.
    """

    fabric = normalize_text(
        getattr(
            textile,
            "prediction",
            None,
        )
    )

    circularity_score = safe_float(
        getattr(
            textile,
            "circularity_score",
            None,
        )
    )

    # ------------------------------------------------------
    # Read stored environmental values
    # ------------------------------------------------------

    stored_co2 = safe_float(
        getattr(
            textile,
            "estimated_co2_savings_kg",
            None,
        )
    )

    stored_water = safe_float(
        getattr(
            textile,
            "estimated_water_savings_liters",
            None,
        )
    )

    stored_landfill = safe_float(
        getattr(
            textile,
            "estimated_landfill_diversion_kg",
            None,
        )
    )

    stored_resource_recovery = safe_float(
        getattr(
            textile,
            "estimated_resource_recovery_kg",
            None,
        )
    )

    # ------------------------------------------------------
    # If environmental data already exists, use it
    # ------------------------------------------------------

    if (
        stored_co2 > 0
        or stored_water > 0
        or stored_landfill > 0
        or stored_resource_recovery > 0
    ):

        return {
            "estimated_co2_savings_kg": stored_co2,
            "estimated_water_savings_liters": stored_water,
            "estimated_landfill_diversion_kg": stored_landfill,
            "estimated_resource_recovery_kg": (
                stored_resource_recovery
            ),
        }

    # ------------------------------------------------------
    # Fallback for older records
    # ------------------------------------------------------

    try:

        environmental_result = (
            calculate_environmental_impact(
                fabric,
                1.0,
                circularity_score=circularity_score,
            )
        )

        return {
            "estimated_co2_savings_kg": safe_float(
                environmental_result.get(
                    "estimated_co2_savings_kg"
                )
            ),

            "estimated_water_savings_liters": safe_float(
                environmental_result.get(
                    "estimated_water_savings_liters"
                )
            ),

            "estimated_landfill_diversion_kg": safe_float(
                environmental_result.get(
                    "estimated_landfill_diversion_kg"
                )
            ),

            "estimated_resource_recovery_kg": safe_float(
                environmental_result.get(
                    "estimated_resource_recovery_kg"
                )
            ),
        }

    except Exception as error:

        print(
            "Environmental fallback error:",
            error,
        )

        return {
            "estimated_co2_savings_kg": 0,
            "estimated_water_savings_liters": 0,
            "estimated_landfill_diversion_kg": 0,
            "estimated_resource_recovery_kg": 0,
        }


# ==========================================================
# Main Analytics Function
# ==========================================================

def calculate_circular_economy_analytics(
    textiles,
):

    """
    Calculate circular economy analytics from
    the user's textile analysis history.

    Parameters
    ----------
    textiles:
        SQLAlchemy Textile objects.

    Returns
    -------
    dict
    """

    total_analyses = len(textiles)

    # ======================================================
    # Empty Dataset
    # ======================================================

    if total_analyses == 0:

        return {

            "total_analyses": 0,

            "average_confidence": 0,

            "average_sustainability_score": 0,

            "average_circularity_score": 0,

            "fabric_distribution": {},

            "recyclability_distribution": {},

            "recovery_distribution": {},

            "recommendation_distribution": {},

            "environmental_impact": {

                "estimated_co2_savings_kg": 0,

                "estimated_water_savings_liters": 0,

                "estimated_landfill_diversion_kg": 0,

                "estimated_resource_recovery_kg": 0,
            },

            "high_recovery_count": 0,

            "high_recyclability_count": 0,

            "most_detected_fabric": "None",

            "most_recommended_action": "None",
        }

    # ======================================================
    # Counters
    # ======================================================

    fabric_counter = Counter()

    recyclability_counter = Counter()

    recovery_counter = Counter()

    recommendation_counter = Counter()

    # ======================================================
    # Numeric Totals
    # ======================================================

    confidence_total = 0.0

    sustainability_total = 0.0

    circularity_total = 0.0

    sustainability_count = 0

    circularity_count = 0

    # ======================================================
    # Environmental Totals
    # ======================================================

    total_co2 = 0.0

    total_water = 0.0

    total_landfill = 0.0

    total_resource_recovery = 0.0

    # ======================================================
    # Recovery Counts
    # ======================================================

    high_recovery_count = 0

    high_recyclability_count = 0

    # ======================================================
    # Process Each Textile
    # ======================================================

    for textile in textiles:

        # --------------------------------------------------
        # Fabric
        # --------------------------------------------------

        fabric = normalize_text(
            getattr(
                textile,
                "prediction",
                None,
            )
        )

        fabric_counter[fabric] += 1

        # --------------------------------------------------
        # Recyclability
        # --------------------------------------------------

        recyclability = normalize_text(
            getattr(
                textile,
                "recyclable",
                None,
            )
        )

        recyclability_counter[
            recyclability
        ] += 1

        if recyclability.lower() == "high":

            high_recyclability_count += 1

        # --------------------------------------------------
        # Confidence
        # --------------------------------------------------

        confidence = safe_float(
            getattr(
                textile,
                "confidence",
                None,
            )
        )

        confidence_total += confidence

        # --------------------------------------------------
        # Sustainability Score
        # --------------------------------------------------

        sustainability_score = safe_float(
            getattr(
                textile,
                "sustainability_score",
                None,
            )
        )

        if sustainability_score > 0:

            sustainability_total += (
                sustainability_score
            )

            sustainability_count += 1

        # --------------------------------------------------
        # Circularity Score
        # --------------------------------------------------

        circularity_score = safe_float(
            getattr(
                textile,
                "circularity_score",
                None,
            )
        )

        if circularity_score > 0:

            circularity_total += (
                circularity_score
            )

            circularity_count += 1

        # --------------------------------------------------
        # Recovery Category
        # --------------------------------------------------

        recovery_category = normalize_text(
            getattr(
                textile,
                "recovery_category",
                None,
            )
        )

        recovery_counter[
            recovery_category
        ] += 1

        if recovery_category in {
            "Excellent Recovery Potential",
            "High Recovery Potential",
        }:

            high_recovery_count += 1

        # --------------------------------------------------
        # Recommendation
        # --------------------------------------------------

        # NEW:
        # Supports both new and old database records
        recommendation = get_recovery_action(
            textile
        )

        recommendation_counter[
            recommendation
        ] += 1

        # --------------------------------------------------
        # Environmental Metrics
        # --------------------------------------------------

        environmental = get_environmental_values(
            textile
        )

        total_co2 += safe_float(
            environmental.get(
                "estimated_co2_savings_kg"
            )
        )

        total_water += safe_float(
            environmental.get(
                "estimated_water_savings_liters"
            )
        )

        total_landfill += safe_float(
            environmental.get(
                "estimated_landfill_diversion_kg"
            )
        )

        total_resource_recovery += safe_float(
            environmental.get(
                "estimated_resource_recovery_kg"
            )
        )

    # ======================================================
    # Averages
    # ======================================================

    average_confidence = round(
        confidence_total / total_analyses,
        2,
    )

    average_sustainability = (
        round(
            sustainability_total
            / sustainability_count,
            2,
        )
        if sustainability_count
        else 0
    )

    average_circularity = (
        round(
            circularity_total
            / circularity_count,
            2,
        )
        if circularity_count
        else 0
    )

    # ======================================================
    # Most Common Values
    # ======================================================

    most_detected_fabric = (

        fabric_counter.most_common(1)[0][0]

        if fabric_counter

        else "None"
    )

    most_recommended_action = (

        recommendation_counter
        .most_common(1)[0][0]

        if recommendation_counter

        else "None"
    )

    # ======================================================
    # Final Result
    # ======================================================

    return {

        "total_analyses": total_analyses,

        "average_confidence": (
            average_confidence
        ),

        "average_sustainability_score": (
            average_sustainability
        ),

        "average_circularity_score": (
            average_circularity
        ),

        "most_detected_fabric": (
            most_detected_fabric
        ),

        "most_recommended_action": (
            most_recommended_action
        ),

        "high_recovery_count": (
            high_recovery_count
        ),

        "high_recyclability_count": (
            high_recyclability_count
        ),

        "fabric_distribution": dict(
            fabric_counter
        ),

        "recyclability_distribution": dict(
            recyclability_counter
        ),

        "recovery_distribution": dict(
            recovery_counter
        ),

        "recommendation_distribution": dict(
            recommendation_counter
        ),

        "environmental_impact": {

            "estimated_co2_savings_kg": round(
                total_co2,
                2,
            ),

            "estimated_water_savings_liters": round(
                total_water,
                2,
            ),

            "estimated_landfill_diversion_kg": round(
                total_landfill,
                2,
            ),

            "estimated_resource_recovery_kg": round(
                total_resource_recovery,
                2,
            ),
        },
    }