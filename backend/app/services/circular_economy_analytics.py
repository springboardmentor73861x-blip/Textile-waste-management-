from typing import Dict, Any


# ============================================================
# CIRCULAR ECONOMY ANALYTICS ENGINE
# ============================================================


def safe_float(
    value: Any,
    default: float = 0.0,
) -> float:

    try:

        if value is None:
            return default

        return float(value)

    except (
        ValueError,
        TypeError,
    ):

        return default


def percentage(
    part: float,
    total: float,
) -> float:

    if total <= 0:
        return 0.0

    return round(
        (part / total) * 100,
        2,
    )


# ============================================================
# MAIN ENGINE
# ============================================================

def calculate_circular_economy_analytics(
    total_waste: float,
    recyclable_quantity: float = 0,
    reused_quantity: float = 0,
    recycled_quantity: float = 0,
    recovered_quantity: float = 0,
    disposed_quantity: float = 0,
    recyclability_score: float = 0,
    recovery_score: float = 0,
) -> Dict[str, Any]:

    total_waste = max(
        safe_float(total_waste),
        0,
    )

    recyclable_quantity = max(
        safe_float(recyclable_quantity),
        0,
    )

    reused_quantity = max(
        safe_float(reused_quantity),
        0,
    )

    recycled_quantity = max(
        safe_float(recycled_quantity),
        0,
    )

    recovered_quantity = max(
        safe_float(recovered_quantity),
        0,
    )

    disposed_quantity = max(
        safe_float(disposed_quantity),
        0,
    )

    recyclability_score = max(
        0,
        min(
            100,
            safe_float(recyclability_score),
        ),
    )

    recovery_score = max(
        0,
        min(
            100,
            safe_float(recovery_score),
        ),
    )

    # --------------------------------------------------------
    # Prevent impossible quantities
    # --------------------------------------------------------

    if total_waste > 0:

        recyclable_quantity = min(
            recyclable_quantity,
            total_waste,
        )

        reused_quantity = min(
            reused_quantity,
            total_waste,
        )

        recycled_quantity = min(
            recycled_quantity,
            total_waste,
        )

        recovered_quantity = min(
            recovered_quantity,
            total_waste,
        )

        disposed_quantity = min(
            disposed_quantity,
            total_waste,
        )

    # --------------------------------------------------------
    # Actual rates
    # --------------------------------------------------------

    recycling_rate = percentage(
        recyclable_quantity,
        total_waste,
    )

    actual_recycling_rate = percentage(
        recycled_quantity,
        total_waste,
    )

    reuse_rate = percentage(
        reused_quantity,
        total_waste,
    )

    recovery_rate = percentage(
        recovered_quantity,
        total_waste,
    )

    disposal_rate = percentage(
        disposed_quantity,
        total_waste,
    )

    # --------------------------------------------------------
    # Actual diverted quantity
    # --------------------------------------------------------

    diverted_quantity = min(
        reused_quantity
        + recycled_quantity
        + recovered_quantity,
        total_waste,
    )

    waste_diversion_rate = percentage(
        diverted_quantity,
        total_waste,
    )

    circular_quantity = diverted_quantity

    circularity_rate = percentage(
        circular_quantity,
        total_waste,
    )

    # --------------------------------------------------------
    # Potential resource recovery
    #
    # This is different from actual recovery.
    # --------------------------------------------------------

    potential_recovery_quantity = min(
        total_waste
        * (
            recyclability_score / 100
        ),
        total_waste,
    )

    potential_recovery_quantity = round(
        potential_recovery_quantity,
        2,
    )

    potential_recovery_rate = percentage(
        potential_recovery_quantity,
        total_waste,
    )

    # --------------------------------------------------------
    # Potential reuse
    #
    # Conservative rule-based estimate.
    # --------------------------------------------------------

    if recyclability_score >= 80:
        reuse_potential_rate = 20

    elif recyclability_score >= 60:
        reuse_potential_rate = 15

    elif recyclability_score >= 40:
        reuse_potential_rate = 10

    else:
        reuse_potential_rate = 5

    potential_reuse_quantity = round(
        total_waste
        * (
            reuse_potential_rate / 100
        ),
        2,
    )

    # --------------------------------------------------------
    # Resource recovery quantity
    # --------------------------------------------------------

    resource_recovery_quantity = round(
        potential_recovery_quantity,
        2,
    )

    resource_recovery_rate = percentage(
        resource_recovery_quantity,
        total_waste,
    )

    # --------------------------------------------------------
    # Circular economy score
    #
    # This measures ACTUAL circular flow.
    #
    # It should remain 0 when no actual quantities
    # have been recorded.
    # --------------------------------------------------------

    circular_economy_score = round(
        (
            min(reuse_rate, 100) * 0.30
            + min(actual_recycling_rate, 100) * 0.30
            + min(recovery_rate, 100) * 0.20
            + min(waste_diversion_rate, 100) * 0.20
        ),
        2,
    )

    # --------------------------------------------------------
    # Circular level
    # --------------------------------------------------------

    if circular_economy_score >= 80:
        circular_economy_level = "Excellent"

    elif circular_economy_score >= 60:
        circular_economy_level = "Good"

    elif circular_economy_score >= 40:
        circular_economy_level = "Moderate"

    elif circular_economy_score >= 20:
        circular_economy_level = "Low"

    else:
        circular_economy_level = "Very Low"

    # --------------------------------------------------------
    # Circular status
    # --------------------------------------------------------

    if waste_diversion_rate >= 80:
        circular_status = "Highly Circular"

    elif waste_diversion_rate >= 60:
        circular_status = "Circular"

    elif waste_diversion_rate >= 40:
        circular_status = "Partially Circular"

    elif waste_diversion_rate > 0:
        circular_status = "Low Circularity"

    else:
        circular_status = "Linear Waste Flow"

    # --------------------------------------------------------
    # Resource conservation
    # --------------------------------------------------------

    if resource_recovery_rate >= 70:

        resource_conservation = (
            "High potential for textile resource "
            "conservation."
        )

    elif resource_recovery_rate >= 40:

        resource_conservation = (
            "Moderate potential for textile resource "
            "conservation."
        )

    else:

        resource_conservation = (
            "Limited current resource recovery. "
            "Increase reuse and recycling."
        )

    # --------------------------------------------------------
    # Diversion assessment
    # --------------------------------------------------------

    if waste_diversion_rate >= 80:

        waste_diversion_assessment = (
            "Excellent waste diversion from disposal."
        )

    elif waste_diversion_rate >= 60:

        waste_diversion_assessment = (
            "Good waste diversion performance."
        )

    elif waste_diversion_rate >= 40:

        waste_diversion_assessment = (
            "Moderate waste diversion. More material "
            "should be recovered."
        )

    else:

        waste_diversion_assessment = (
            "Low current waste diversion. Prioritize "
            "reuse, recovery and recycling."
        )

    # --------------------------------------------------------
    # Recommendations
    # --------------------------------------------------------

    recommendations = []

    if recyclable_quantity > recycled_quantity:

        recommendations.append(
            "Increase recycling of recyclable textile waste."
        )

    if reused_quantity == 0:

        recommendations.append(
            "Prioritize suitable textile waste for reuse."
        )

    if recovered_quantity == 0:

        recommendations.append(
            "Introduce material recovery pathways "
            "for suitable textile waste."
        )

    if disposed_quantity > 0:

        recommendations.append(
            "Reduce disposal and divert suitable textile "
            "waste toward circular pathways."
        )

    if not recommendations:

        recommendations.append(
            "Maintain current reuse, recovery and "
            "recycling practices."
        )

    # --------------------------------------------------------
    # Primary action
    # --------------------------------------------------------

    if reuse_rate > 0:

        primary_circular_action = (
            "Prioritize reuse followed by material "
            "recovery and recycling."
        )

    elif actual_recycling_rate > 0:

        primary_circular_action = (
            "Prioritize textile recycling and "
            "material recovery."
        )

    elif recovery_rate > 0:

        primary_circular_action = (
            "Increase reuse and recycling while "
            "maintaining material recovery."
        )

    else:

        primary_circular_action = (
            "Establish reuse, recovery and recycling "
            "pathways."
        )

    # --------------------------------------------------------
    # Summary
    # --------------------------------------------------------

    analytics_summary = (
        f"{waste_diversion_rate:.2f}% of textile waste "
        f"is currently diverted from disposal through "
        f"recorded reuse, recycling and recovery. "
        f"The actual circular economy score is "
        f"{circular_economy_score:.2f}/100."
    )

    potential_summary = (
        f"Based on the material recyclability score, "
        f"approximately {potential_recovery_quantity:.2f} kg "
        f"of the submitted waste may have recovery potential "
        f"out of {total_waste:.2f} kg."
    )

    return {

        # ====================================================
        # INPUT
        # ====================================================

        "total_waste":
            total_waste,

        "recyclable_quantity":
            recyclable_quantity,

        "reused_quantity":
            reused_quantity,

        "recycled_quantity":
            recycled_quantity,

        "recovered_quantity":
            recovered_quantity,

        "disposed_quantity":
            disposed_quantity,

        # ====================================================
        # ACTUAL RATES
        # ====================================================

        "recycling_rate":
            recycling_rate,

        "actual_recycling_rate":
            actual_recycling_rate,

        "reuse_rate":
            reuse_rate,

        "recovery_rate":
            recovery_rate,

        "disposal_rate":
            disposal_rate,

        "waste_diversion_rate":
            waste_diversion_rate,

        "circularity_rate":
            circularity_rate,

        # ====================================================
        # POTENTIAL
        # ====================================================

        "potential_recovery_quantity":
            potential_recovery_quantity,

        "potential_recovery_rate":
            potential_recovery_rate,

        "potential_reuse_quantity":
            potential_reuse_quantity,

        "resource_recovery_quantity":
            resource_recovery_quantity,

        "resource_recovery_rate":
            resource_recovery_rate,

        # ====================================================
        # QUANTITIES
        # ====================================================

        "diverted_quantity":
            diverted_quantity,

        "circular_quantity":
            circular_quantity,

        # ====================================================
        # SCORES
        # ====================================================

        "recyclability_score":
            recyclability_score,

        "recovery_score":
            recovery_score,

        "circular_economy_score":
            circular_economy_score,

        "circular_economy_level":
            circular_economy_level,

        # ====================================================
        # STATUS
        # ====================================================

        "circular_status":
            circular_status,

        # ====================================================
        # ASSESSMENTS
        # ====================================================

        "resource_conservation":
            resource_conservation,

        "waste_diversion_assessment":
            waste_diversion_assessment,

        "circular_economy_benefit":
            (
                "Supports keeping textile materials in "
                "circulation, reducing disposal and "
                "improving recovery of textile resources."
            ),

        "analytics_summary":
            analytics_summary,

        "potential_summary":
            potential_summary,

        # ====================================================
        # ACTIONS
        # ====================================================

        "primary_circular_action":
            primary_circular_action,

        "recommendations":
            recommendations,
    }


# ============================================================
# TEST
# ============================================================

if __name__ == "__main__":

    result = calculate_circular_economy_analytics(

        total_waste=100,

        recyclable_quantity=85,

        reused_quantity=20,

        recycled_quantity=45,

        recovered_quantity=10,

        disposed_quantity=25,

        recyclability_score=85,

        recovery_score=30,
    )

    for key, value in result.items():
        print(f"{key}: {value}")