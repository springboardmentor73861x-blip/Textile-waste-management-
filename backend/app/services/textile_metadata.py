from typing import Dict, Any


# ============================================================
# TEXTILE METADATA DATABASE
# ============================================================
#
# Rule-based textile knowledge used by Milestone 3.
#
# This is NOT an ML model.
# It provides structured sustainability metadata based
# on the predicted fabric type.
# ============================================================


TEXTILE_METADATA: Dict[str, Dict[str, Any]] = {

    "cotton": {
        "material_type": "Natural Fiber",
        "composition": "Cellulose-based cotton fiber",
        "recyclability": "High",
        "biodegradability": "High",
        "recommended_processing": "Mechanical fiber recycling",
        "recommended_recycling_method": "Mechanical Textile Recycling",
        "potential_reuse": "Recover cotton fibers for yarn, insulation, wiping products or composite materials.",
    },

    "denim": {
        "material_type": "Natural Fiber / Cotton Blend",
        "composition": "Primarily cotton with possible elastane or synthetic blend",
        "recyclability": "Moderate",
        "biodegradability": "Moderate",
        "recommended_processing": "Mechanical fiber recovery",
        "recommended_recycling_method": "Mechanical Denim Fiber Recycling",
        "potential_reuse": "Reuse garments where possible or recover fibers for insulation and recycled textile products.",
    },

    "linen": {
        "material_type": "Natural Fiber",
        "composition": "Flax-based cellulose fiber",
        "recyclability": "High",
        "biodegradability": "High",
        "recommended_processing": "Mechanical fiber recycling",
        "recommended_recycling_method": "Mechanical Textile Recycling",
        "potential_reuse": "Reuse textile products or recover flax fibers for recycled materials.",
    },

    "wool": {
        "material_type": "Natural Protein Fiber",
        "composition": "Keratin-based animal fiber",
        "recyclability": "High",
        "biodegradability": "High",
        "recommended_processing": "Mechanical fiber recovery",
        "recommended_recycling_method": "Mechanical Wool Recycling",
        "potential_reuse": "Reuse garments or recover wool fibers for insulation and recycled yarn products.",
    },

    "silk": {
        "material_type": "Natural Protein Fiber",
        "composition": "Silk protein fiber",
        "recyclability": "Moderate",
        "biodegradability": "High",
        "recommended_processing": "Fiber recovery and reuse",
        "recommended_recycling_method": "Specialized Silk Textile Recovery",
        "potential_reuse": "Prioritize direct reuse and recover suitable silk fibers.",
    },

    "polyester": {
        "material_type": "Synthetic Fiber",
        "composition": "Polyethylene terephthalate (PET) polyester",
        "recyclability": "High",
        "biodegradability": "Very Low",
        "recommended_processing": "Mechanical or chemical polyester recycling",
        "recommended_recycling_method": "Polyester Mechanical / Chemical Recycling",
        "potential_reuse": "Reuse garments where possible or recover polyester for recycled fiber production.",
    },

    "nylon": {
        "material_type": "Synthetic Fiber",
        "composition": "Polyamide synthetic fiber",
        "recyclability": "Moderate",
        "biodegradability": "Very Low",
        "recommended_processing": "Mechanical or chemical polyamide recycling",
        "recommended_recycling_method": "Nylon Recycling",
        "potential_reuse": "Recover nylon fibers for recycled textile and industrial applications.",
    },

    "acrylic": {
        "material_type": "Synthetic Fiber",
        "composition": "Polyacrylonitrile-based synthetic fiber",
        "recyclability": "Low",
        "biodegradability": "Very Low",
        "recommended_processing": "Specialized synthetic textile recovery",
        "recommended_recycling_method": "Specialized Acrylic Textile Recycling",
        "potential_reuse": "Reuse suitable garments before specialized material recovery.",
    },

    "rayon": {
        "material_type": "Regenerated Cellulosic Fiber",
        "composition": "Regenerated cellulose fiber",
        "recyclability": "Moderate",
        "biodegradability": "Moderate",
        "recommended_processing": "Fiber recovery and specialized recycling",
        "recommended_recycling_method": "Regenerated Cellulose Textile Recycling",
        "potential_reuse": "Reuse suitable textile products or recover cellulose fibers.",
    },

    "mixed fabrics": {
        "material_type": "Blended Fiber",
        "composition": "Mixture of natural and/or synthetic textile fibers",
        "recyclability": "Low",
        "biodegradability": "Low",
        "recommended_processing": "Fiber separation and specialized recycling",
        "recommended_recycling_method": "Specialized Textile Sorting and Fiber Separation",
        "potential_reuse": "Prioritize direct reuse before specialized fiber separation.",
    },
}


# ============================================================
# NORMALIZATION
# ============================================================

def normalize_fabric_type(value: Any) -> str:

    if value is None:
        return ""

    return str(value).strip().lower()


# ============================================================
# GET METADATA
# ============================================================

def get_textile_metadata(
    fabric_type: Any,
) -> Dict[str, Any]:

    fabric = normalize_fabric_type(
        fabric_type
    )

    # Direct match
    if fabric in TEXTILE_METADATA:
        return TEXTILE_METADATA[fabric].copy()

    # Partial matching
    for name, metadata in TEXTILE_METADATA.items():

        if name in fabric or fabric in name:

            return metadata.copy()

    # Unknown fabric
    return {
        "material_type": "Unknown Textile Material",
        "composition": "Material composition requires assessment",
        "recyclability": "Assessment Required",
        "biodegradability": "Assessment Required",
        "recommended_processing": "Material-specific textile assessment",
        "recommended_recycling_method": "Specialized Textile Recycling Assessment",
        "potential_reuse": "Assess textile for suitable reuse before disposal.",
    }


# ============================================================
# MERGE USER DATA + FABRIC DATABASE
# ============================================================

def enrich_textile_prediction(
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

    metadata = get_textile_metadata(
        fabric_type
    )

    result = prediction.copy()

    # IMPORTANT:
    # Fabric database values become defaults.
    # User-provided non-empty values are preserved.

    fields = [
        "material_type",
        "composition",
        "recyclability",
        "biodegradability",
        "recommended_processing",
        "recommended_recycling_method",
        "potential_reuse",
    ]

    for field in fields:

        current_value = result.get(
            field
        )

        if (
            current_value is None
            or str(current_value).strip() == ""
        ):

            if field in metadata:

                result[field] = metadata[field]

    return result