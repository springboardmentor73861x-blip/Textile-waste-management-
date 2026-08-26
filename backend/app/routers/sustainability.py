from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field


# ============================================================
# SERVICES
# ============================================================

from app.services.sustainability_engine import (
    assess_sustainability,
)

from app.services.recycling_recommendation import (
    generate_recycling_recommendation,
)

from app.services.environmental_impact import (
    assess_environmental_impact,
)

from app.services.circular_economy_analytics import (
    calculate_circular_economy_analytics,
)


# ============================================================
# ROUTER
# ============================================================

router = APIRouter(
    prefix="/sustainability",
    tags=["Sustainability Intelligence"],
)


# ============================================================
# REQUEST MODEL
# ============================================================

class SustainabilityRequest(BaseModel):

    fabric_type: str = Field(
        ...,
        min_length=1,
    )

    quantity: float = Field(
        default=0,
        ge=0,
    )

    source: str = ""

    condition: str = ""

    material_type: str = ""

    composition: str = ""

    recyclability: str = ""

    biodegradability: str = ""

    recommended_processing: str = ""

    potential_reuse: str = ""

    total_waste: float = Field(
        default=0,
        ge=0,
    )

    recyclable_quantity: float = Field(
        default=0,
        ge=0,
    )

    reused_quantity: float = Field(
        default=0,
        ge=0,
    )

    recycled_quantity: float = Field(
        default=0,
        ge=0,
    )

    recovered_quantity: float = Field(
        default=0,
        ge=0,
    )

    disposed_quantity: float = Field(
        default=0,
        ge=0,
    )


# ============================================================
# HELPERS
# ============================================================

def safe_float(value, default=0.0):

    try:

        number = float(value)

        if number < 0:
            return default

        return number

    except (TypeError, ValueError):

        return default


def get_numeric_score(
    data,
    keys,
    default=0.0,
):

    if not isinstance(data, dict):
        return default

    for key in keys:

        value = data.get(key)

        try:

            number = float(value)

            if 0 <= number <= 100:
                return number

        except (TypeError, ValueError):

            continue

    return default


def normalize_text(value):

    if value is None:
        return ""

    return str(value).strip().lower()


# ============================================================
# COMMON DATA BUILDER
# ============================================================

def build_common_data(
    data: SustainabilityRequest,
):

    fabric = normalize_text(
        data.fabric_type
    )

    # --------------------------------------------------------
    # TEXTILE PROFILES
    # --------------------------------------------------------

    textile_profiles = {

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
            "material_type":
                "Natural / Blended Fiber",
            "composition":
                "Cotton-based denim",
            "recyclability":
                "High",
            "biodegradability":
                "High",
            "recommended_processing":
                "Mechanical Textile Recycling",
            "potential_reuse":
                "Recover denim fibers for yarn, insulation, "
                "wiping products and composite materials.",
        },

        "linen": {
            "material_type":
                "Natural Fiber",
            "composition":
                "Linen fiber",
            "recyclability":
                "High",
            "biodegradability":
                "Very High",
            "recommended_processing":
                "Mechanical Textile Recycling",
            "potential_reuse":
                "Reuse or recover linen fibers for yarn, "
                "insulation and composite materials.",
        },

        "wool": {
            "material_type":
                "Natural Animal Fiber",
            "composition":
                "Wool fiber",
            "recyclability":
                "High",
            "biodegradability":
                "High",
            "recommended_processing":
                "Mechanical Textile Recycling",
            "potential_reuse":
                "Recover wool fibers for yarn, insulation "
                "and textile products.",
        },

        "silk": {
            "material_type":
                "Natural Protein Fiber",
            "composition":
                "Silk fiber",
            "recyclability":
                "Moderate",
            "biodegradability":
                "High",
            "recommended_processing":
                "Fiber Recovery and Reuse",
            "potential_reuse":
                "Reuse silk textiles or recover fibers for "
                "specialized textile applications.",
        },

        "rayon": {
            "material_type":
                "Regenerated Cellulosic Fiber",
            "composition":
                "Regenerated cellulose",
            "recyclability":
                "Moderate",
            "biodegradability":
                "Moderate",
            "recommended_processing":
                "Fiber Recovery and Recycling",
            "potential_reuse":
                "Recover cellulose-based fibers for textile "
                "and composite applications.",
        },

        "nylon": {
            "material_type":
                "Synthetic Fiber",
            "composition":
                "Polyamide",
            "recyclability":
                "High",
            "biodegradability":
                "Very Low",
            "recommended_processing":
                "Mechanical or Chemical Textile Recycling",
            "potential_reuse":
                "Recover nylon fibers for yarn and recycled "
                "polyamide products.",
        },

        "polyester": {
            "material_type":
                "Synthetic Fiber",
            "composition":
                "Polyester",
            "recyclability":
                "High",
            "biodegradability":
                "Very Low",
            "recommended_processing":
                "Mechanical or Chemical Textile Recycling",
            "potential_reuse":
                "Recover polyester fibers for yarn, insulation "
                "and recycled polyester products.",
        },

        "acrylic": {
            "material_type":
                "Synthetic Fiber",
            "composition":
                "Acrylic polymer",
            "recyclability":
                "Low",
            "biodegradability":
                "Very Low",
            "recommended_processing":
                "Specialized Textile Recovery",
            "potential_reuse":
                "Recover material where specialized recycling "
                "facilities are available.",
        },

        "mixed fabrics": {
            "material_type":
                "Blended Fiber",
            "composition":
                "Mixed textile fibers",
            "recyclability":
                "Low",
            "biodegradability":
                "Low",
            "recommended_processing":
                "Specialized Textile Separation and Recycling",
            "potential_reuse":
                "Recover usable fibers through specialized "
                "separation and recycling processes.",
        },

        "mixed_fabrics": {
            "material_type":
                "Blended Fiber",
            "composition":
                "Mixed textile fibers",
            "recyclability":
                "Low",
            "biodegradability":
                "Low",
            "recommended_processing":
                "Specialized Textile Separation and Recycling",
            "potential_reuse":
                "Recover usable fibers through specialized "
                "separation and recycling processes.",
        },
    }

    # --------------------------------------------------------
    # DEFAULT PROFILE
    # --------------------------------------------------------

    profile = textile_profiles.get(
        fabric,
        {
            "material_type":
                "Textile Material",

            "composition":
                data.fabric_type,

            "recyclability":
                "Moderate",

            "biodegradability":
                "Moderate",

            "recommended_processing":
                "Material-specific Textile Recovery",

            "potential_reuse":
                "Assess the textile for reuse and material "
                "recovery before disposal.",
        },
    )

    # --------------------------------------------------------
    # ALLOW EXPLICIT VALUES TO OVERRIDE PROFILE
    # --------------------------------------------------------

    material_type = (
        data.material_type
        if data.material_type
        else profile["material_type"]
    )

    composition = (
        data.composition
        if data.composition
        else profile["composition"]
    )

    recyclability = (
        data.recyclability
        if data.recyclability
        else profile["recyclability"]
    )

    biodegradability = (
        data.biodegradability
        if data.biodegradability
        else profile["biodegradability"]
    )

    recommended_processing = (
        data.recommended_processing
        if data.recommended_processing
        else profile["recommended_processing"]
    )

    potential_reuse = (
        data.potential_reuse
        if data.potential_reuse
        else profile["potential_reuse"]
    )

    return {

        "fabric_type":
            data.fabric_type,

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

        "source":
            data.source,

        "condition":
            data.condition,

        "quantity":
            data.quantity,
    }


# ============================================================
# CIRCULAR ECONOMY INPUT
# ============================================================

def build_circular_data(
    data: SustainabilityRequest,
    sustainability_result: dict,
    recommendation_result: dict,
):

    quantity = safe_float(
        data.quantity
    )

    total_waste = safe_float(
        data.total_waste
    )

    if total_waste <= 0:
        total_waste = quantity

    recyclability_score = get_numeric_score(
        sustainability_result,
        [
            "recyclability_score",
            "recyclabilityScore",
        ],
        0,
    )

    priority = ""

    if isinstance(
        recommendation_result,
        dict,
    ):

        priority = recommendation_result.get(
            "recycling_priority",
            recommendation_result.get(
                "priority",
                "",
            ),
        )

    priority = normalize_text(
        priority
    )

    # --------------------------------------------------------
    # RECYCLABLE
    # --------------------------------------------------------

    recyclable_quantity = safe_float(
        data.recyclable_quantity
    )

    if (
        recyclable_quantity <= 0
        and total_waste > 0
    ):

        recyclable_quantity = (
            total_waste
            * recyclability_score
            / 100
        )

    recyclable_quantity = min(
        recyclable_quantity,
        total_waste,
    )

    # --------------------------------------------------------
    # REUSED
    # --------------------------------------------------------

    reused_quantity = safe_float(
        data.reused_quantity
    )

    if (
        reused_quantity <= 0
        and recyclable_quantity > 0
    ):

        if priority == "high":

            reused_quantity = (
                recyclable_quantity * 0.20
            )

        elif priority == "medium":

            reused_quantity = (
                recyclable_quantity * 0.10
            )

        else:

            reused_quantity = (
                recyclable_quantity * 0.05
            )

    reused_quantity = min(
        reused_quantity,
        recyclable_quantity,
    )

    # --------------------------------------------------------
    # RECYCLED
    # --------------------------------------------------------

    recycled_quantity = safe_float(
        data.recycled_quantity
    )

    if (
        recycled_quantity <= 0
        and recyclable_quantity > 0
    ):

        recycled_quantity = (
            recyclable_quantity
            - reused_quantity
        )

    recycled_quantity = max(
        0,
        min(
            recycled_quantity,
            total_waste,
        ),
    )

    # --------------------------------------------------------
    # RECOVERED
    # --------------------------------------------------------

    recovered_quantity = safe_float(
        data.recovered_quantity
    )

    if (
        recovered_quantity <= 0
        and recycled_quantity > 0
    ):

        recovered_quantity = (
            recycled_quantity * 0.10
        )

    recovered_quantity = max(
        0,
        min(
            recovered_quantity,
            total_waste,
        ),
    )

    # --------------------------------------------------------
    # DISPOSED
    # --------------------------------------------------------

    disposed_quantity = safe_float(
        data.disposed_quantity
    )

    if data.disposed_quantity <= 0:

        circular_diversion = (
            reused_quantity
            + recycled_quantity
            + recovered_quantity
        )

        disposed_quantity = max(
            0,
            total_waste
            - circular_diversion,
        )

    disposed_quantity = max(
        0,
        min(
            disposed_quantity,
            total_waste,
        ),
    )

    return {

        "total_waste":
            round(total_waste, 2),

        "recyclable_quantity":
            round(
                recyclable_quantity,
                2,
            ),

        "reused_quantity":
            round(
                reused_quantity,
                2,
            ),

        "recycled_quantity":
            round(
                recycled_quantity,
                2,
            ),

        "recovered_quantity":
            round(
                recovered_quantity,
                2,
            ),

        "disposed_quantity":
            round(
                disposed_quantity,
                2,
            ),
    }


# ============================================================
# ENVIRONMENTAL INPUT
# ============================================================

def build_environmental_data(
    common: dict,
    sustainability_result: dict,
    recommendation_result: dict,
):

    environmental_data = dict(
        common
    )

    if isinstance(
        sustainability_result,
        dict,
    ):

        environmental_data.update(
            sustainability_result
        )

    if isinstance(
        recommendation_result,
        dict,
    ):

        environmental_data.update(
            recommendation_result
        )

    if not environmental_data.get(
        "recommended_recycling_method"
    ):

        environmental_data[
            "recommended_recycling_method"
        ] = environmental_data.get(
            "recommended_processing",
            "Material-specific processing",
        )

    if not environmental_data.get(
        "reuse_recommendation"
    ):

        environmental_data[
            "reuse_recommendation"
        ] = environmental_data.get(
            "potential_reuse",
            "",
        )

    return environmental_data


# ============================================================
# 1. SUSTAINABILITY ASSESSMENT
# ============================================================

@router.post("/assessment")
def sustainability_assessment(
    data: SustainabilityRequest,
):

    try:

        common = build_common_data(
            data
        )

        result = assess_sustainability(
            common
        )

        return {

            "success":
                True,

            "message":
                "Sustainability assessment completed successfully.",

            "assessment":
                result,
        }

    except Exception as error:

        print(
            "SUSTAINABILITY API ERROR:",
            repr(error),
        )

        raise HTTPException(
            status_code=500,
            detail=(
                "Sustainability assessment failed: "
                f"{str(error)}"
            ),
        )


# ============================================================
# 2. RECYCLING RECOMMENDATION
# ============================================================

@router.post("/recommendation")
def recycling_recommendation(
    data: SustainabilityRequest,
):

    try:

        common = build_common_data(
            data
        )

        result = generate_recycling_recommendation(
            common
        )

        return {

            "success":
                True,

            "message":
                "Recycling recommendation generated successfully.",

            "recommendation":
                result,
        }

    except Exception as error:

        print(
            "RECYCLING RECOMMENDATION API ERROR:",
            repr(error),
        )

        raise HTTPException(
            status_code=500,
            detail=(
                "Recycling recommendation failed: "
                f"{str(error)}"
            ),
        )


# ============================================================
# 3. ENVIRONMENTAL IMPACT
# ============================================================

@router.post("/environmental-impact")
def environmental_impact(
    data: SustainabilityRequest,
):

    try:

        common = build_common_data(
            data
        )

        sustainability_result = (
            assess_sustainability(
                common
            )
        )

        recommendation_result = (
            generate_recycling_recommendation(
                common
            )
        )

        environmental_data = (
            build_environmental_data(
                common,
                sustainability_result,
                recommendation_result,
            )
        )

        result = assess_environmental_impact(
            environmental_data
        )

        return {

            "success":
                True,

            "message":
                "Environmental impact assessment completed successfully.",

            "environmental_impact":
                result,
        }

    except Exception as error:

        print(
            "ENVIRONMENTAL IMPACT API ERROR:",
            repr(error),
        )

        raise HTTPException(
            status_code=500,
            detail=(
                "Environmental impact assessment failed: "
                f"{str(error)}"
            ),
        )


# ============================================================
# 4. CIRCULAR ECONOMY ANALYTICS
# ============================================================

@router.post("/circular-analytics")
def circular_analytics(
    data: SustainabilityRequest,
):

    try:

        common = build_common_data(
            data
        )

        sustainability_result = (
            assess_sustainability(
                common
            )
        )

        recommendation_result = (
            generate_recycling_recommendation(
                common
            )
        )

        circular_data = build_circular_data(
            data,
            sustainability_result,
            recommendation_result,
        )

        result = (
            calculate_circular_economy_analytics(

                total_waste=
                    circular_data[
                        "total_waste"
                    ],

                recyclable_quantity=
                    circular_data[
                        "recyclable_quantity"
                    ],

                reused_quantity=
                    circular_data[
                        "reused_quantity"
                    ],

                recycled_quantity=
                    circular_data[
                        "recycled_quantity"
                    ],

                recovered_quantity=
                    circular_data[
                        "recovered_quantity"
                    ],

                disposed_quantity=
                    circular_data[
                        "disposed_quantity"
                    ],
            )
        )

        return {

            "success":
                True,

            "message":
                "Circular economy analytics calculated successfully.",

            "circular_analytics":
                result,

            "material_flow":
                circular_data,
        }

    except Exception as error:

        print(
            "CIRCULAR ANALYTICS API ERROR:",
            repr(error),
        )

        raise HTTPException(
            status_code=500,
            detail=(
                "Circular economy analytics failed: "
                f"{str(error)}"
            ),
        )


# ============================================================
# 5. COMPLETE SUSTAINABILITY INTELLIGENCE
# ============================================================

@router.post("/complete")
def complete_sustainability_analysis(
    data: SustainabilityRequest,
):

    try:

        common = build_common_data(
            data
        )

        # ----------------------------------------------------
        # SUSTAINABILITY
        # ----------------------------------------------------

        sustainability_result = (
            assess_sustainability(
                common
            )
        )

        # ----------------------------------------------------
        # RECYCLING
        # ----------------------------------------------------

        recycling_result = (
            generate_recycling_recommendation(
                common
            )
        )

        # ----------------------------------------------------
        # ENVIRONMENTAL
        # ----------------------------------------------------

        environmental_data = (
            build_environmental_data(
                common,
                sustainability_result,
                recycling_result,
            )
        )

        environmental_result = (
            assess_environmental_impact(
                environmental_data
            )
        )

        # ----------------------------------------------------
        # CIRCULAR ECONOMY
        # ----------------------------------------------------

        circular_data = build_circular_data(
            data,
            sustainability_result,
            recycling_result,
        )

        circular_result = (
            calculate_circular_economy_analytics(

                total_waste=
                    circular_data[
                        "total_waste"
                    ],

                recyclable_quantity=
                    circular_data[
                        "recyclable_quantity"
                    ],

                reused_quantity=
                    circular_data[
                        "reused_quantity"
                    ],

                recycled_quantity=
                    circular_data[
                        "recycled_quantity"
                    ],

                recovered_quantity=
                    circular_data[
                        "recovered_quantity"
                    ],

                disposed_quantity=
                    circular_data[
                        "disposed_quantity"
                    ],
            )
        )

        # ----------------------------------------------------
        # FINAL RESPONSE
        # ----------------------------------------------------

        return {

            "success":
                True,

            "message":
                "Complete sustainability intelligence generated successfully.",

            "fabric_type":
                data.fabric_type,

            "quantity":
                data.quantity,

            "source":
                data.source,

            "condition":
                data.condition,

            "sustainability":
                sustainability_result,

            "recycling_recommendation":
                recycling_result,

            "environmental_impact":
                environmental_result,

            "circular_economy":
                circular_result,

            "material_flow":
                circular_data,
        }

    except Exception as error:

        print(
            "COMPLETE SUSTAINABILITY API ERROR:",
            repr(error),
        )

        raise HTTPException(
            status_code=500,
            detail=(
                "Complete sustainability analysis failed: "
                f"{str(error)}"
            ),
        )


# ============================================================
# 6. HEALTH CHECK
# ============================================================

@router.get("/health")
def sustainability_health():

    return {

        "success":
            True,

        "service":
            "Sustainability Intelligence",

        "status":
            "operational",

        "engines": {

            "sustainability_intelligence":
                "operational",

            "recycling_recommendation":
                "operational",

            "environmental_impact":
                "operational",

            "circular_economy_analytics":
                "operational",
        },
    }