# ============================================================
# AI TEXTILE WASTE INTELLIGENCE PLATFORM
# MobileNetV3 Small - Textile Fabric Predictor
# ============================================================

from pathlib import Path

import torch
import torch.nn as nn
from torchvision import models, transforms
from PIL import Image


# ============================================================
# PATH CONFIGURATION
# ============================================================

# backend/
# ├── inference/
# │   └── predict.py
# └── models/
#     └── mobilenetv3/
#         └── mobilenetv3_small_best.pth

BASE_DIR = Path(__file__).resolve().parent.parent

MODEL_PATH = (
    BASE_DIR
    / "models"
    / "mobilenetv3"
    / "mobilenetv3_small_best.pth"
)


# ============================================================
# DEVICE
# ============================================================

DEVICE = torch.device(
    "cuda" if torch.cuda.is_available() else "cpu"
)


# ============================================================
# CLASS NAMES
# IMPORTANT:
# This order MUST match training
# ============================================================

CLASS_NAMES = [
    "Cotton",
    "Denim",
    "Mixed Fabrics",
    "Polyester",
    "Rayon",
    "Silk",
    "Wool",
]


NUM_CLASSES = len(CLASS_NAMES)


# ============================================================
# WASTE INFORMATION
# ============================================================

FABRIC_METADATA = {

    "Cotton": {
        "waste_category": "Natural Fiber Waste",
        "recycling_recommendation": (
            "Mechanical fiber recycling; reuse for rags, "
            "wiping cloths, or recycled cotton products."
        ),
    },

    "Denim": {
        "waste_category": "Cotton-Based Textile Waste",
        "recycling_recommendation": (
            "Upcycling or mechanical fiber recycling; "
            "suitable for bags, accessories, insulation, "
            "or recycled cotton products."
        ),
    },

    "Mixed Fabrics": {
        "waste_category": "Blended Textile Waste",
        "recycling_recommendation": (
            "Sort by fiber composition where possible; "
            "otherwise use specialized blended-textile "
            "recycling or upcycling."
        ),
    },

    "Polyester": {
        "waste_category": "Synthetic Fiber Waste",
        "recycling_recommendation": (
            "Polyester recycling into recycled polyester "
            "fibers/products; reuse where practical."
        ),
    },

    "Rayon": {
        "waste_category": "Regenerated Cellulosic Fiber Waste",
        "recycling_recommendation": (
            "Reuse/upcycling and suitable fiber recovery; "
            "specialized textile recycling."
        ),
    },

    "Silk": {
        "waste_category": "Natural Protein Fiber Waste",
        "recycling_recommendation": (
            "Reuse/upcycling; suitable textile or fiber recovery."
        ),
    },

    "Wool": {
        "waste_category": "Natural Protein Fiber Waste",
        "recycling_recommendation": (
            "Reuse, repair, felting, or mechanical fiber recycling."
        ),
    },
}


# ============================================================
# IMAGE TRANSFORM
# SAME AS VALIDATION / TEST
# ============================================================

IMAGE_TRANSFORM = transforms.Compose([
    transforms.Resize((224, 224)),
    transforms.ToTensor(),

    transforms.Normalize(
        mean=[0.485, 0.456, 0.406],
        std=[0.229, 0.224, 0.225],
    ),
])


# ============================================================
# MODEL CREATION
# ============================================================

def create_model():
    """
    Creates the exact MobileNetV3 Small architecture
    used for the textile classification model.
    """

    model = models.mobilenet_v3_small(
        weights=None
    )

    # Replace final classifier
    model.classifier[3] = nn.Linear(
        model.classifier[3].in_features,
        NUM_CLASSES
    )

    return model


# ============================================================
# LOAD MODEL
# ============================================================

def load_model():
    """
    Loads the trained best MobileNetV3 model.
    """

    if not MODEL_PATH.exists():
        raise FileNotFoundError(
            f"Model file not found:\n{MODEL_PATH}"
        )

    model = create_model()

    checkpoint = torch.load(
        MODEL_PATH,
        map_location=DEVICE
    )

    # --------------------------------------------------------
    # Handle different checkpoint formats
    # --------------------------------------------------------

    if isinstance(checkpoint, dict):

        if "model_state_dict" in checkpoint:
            state_dict = checkpoint["model_state_dict"]

        elif "state_dict" in checkpoint:
            state_dict = checkpoint["state_dict"]

        else:
            state_dict = checkpoint

    else:
        state_dict = checkpoint

    # --------------------------------------------------------
    # Remove possible "module." prefix
    # --------------------------------------------------------

    cleaned_state_dict = {}

    for key, value in state_dict.items():

        if key.startswith("module."):
            key = key[7:]

        cleaned_state_dict[key] = value

    model.load_state_dict(
        cleaned_state_dict,
        strict=True
    )

    model.to(DEVICE)

    model.eval()

    return model


# ============================================================
# GLOBAL MODEL
# Load only once when backend starts
# ============================================================

MODEL = load_model()


# ============================================================
# PREDICT FUNCTION
# ============================================================

def predict_image(image):
    """
    Predict fabric type from a PIL image.

    Returns:
        dict containing:
        - fabric_type
        - confidence
        - waste_category
        - recycling_recommendation
        - top_predictions
    """

    # --------------------------------------------------------
    # Make sure image is RGB
    # --------------------------------------------------------

    if image.mode != "RGB":
        image = image.convert("RGB")

    # --------------------------------------------------------
    # Transform image
    # --------------------------------------------------------

    input_tensor = IMAGE_TRANSFORM(image)

    # Add batch dimension
    input_tensor = input_tensor.unsqueeze(0)

    input_tensor = input_tensor.to(DEVICE)

    # --------------------------------------------------------
    # Prediction
    # --------------------------------------------------------

    with torch.no_grad():

        outputs = MODEL(input_tensor)

        probabilities = torch.softmax(
            outputs,
            dim=1
        )[0]

    # --------------------------------------------------------
    # Top prediction
    # --------------------------------------------------------

    confidence, predicted_index = torch.max(
        probabilities,
        dim=0
    )

    predicted_index = predicted_index.item()

    fabric_type = CLASS_NAMES[predicted_index]

    confidence_value = float(
        confidence.item()
    )

    # --------------------------------------------------------
    # Metadata
    # --------------------------------------------------------

    metadata = FABRIC_METADATA[fabric_type]

    # --------------------------------------------------------
    # Top 3 predictions
    # Useful for debugging wrong predictions
    # --------------------------------------------------------

    top_k = min(3, NUM_CLASSES)

    top_probabilities, top_indices = torch.topk(
        probabilities,
        top_k
    )

    top_predictions = []

    for probability, index in zip(
        top_probabilities,
        top_indices
    ):

        index = index.item()

        top_predictions.append({
            "fabric_type": CLASS_NAMES[index],
            "confidence": round(
                float(probability.item()) * 100,
                2
            ),
        })

    # --------------------------------------------------------
    # Final response
    # --------------------------------------------------------

    result = {
        "fabric_type": fabric_type,

        "confidence": round(
            confidence_value * 100,
            2
        ),

        "waste_category": metadata[
            "waste_category"
        ],

        "recycling_recommendation": metadata[
            "recycling_recommendation"
        ],

        "top_predictions": top_predictions,
    }

    return result


# ============================================================
# TEST FUNCTION
# ============================================================

if __name__ == "__main__":

    print("=" * 60)
    print("AI TEXTILE WASTE PREDICTOR")
    print("=" * 60)

    print(f"Device      : {DEVICE}")
    print(f"Model       : {MODEL_PATH}")
    print(f"Classes     : {CLASS_NAMES}")
    print()

    # --------------------------------------------------------
    # Ask user for image
    # --------------------------------------------------------

    image_path = input(
        "Enter image path for testing: "
    ).strip()

    if not image_path:

        print("No image path provided.")
        exit()

    image_path = Path(image_path)

    if not image_path.exists():

        print(
            f"Image not found:\n{image_path}"
        )
        exit()

    try:

        image = Image.open(
            image_path
        )

        result = predict_image(image)

        print()
        print("=" * 60)
        print("PREDICTION RESULT")
        print("=" * 60)

        print(
            f"Fabric Type       : "
            f"{result['fabric_type']}"
        )

        print(
            f"Confidence        : "
            f"{result['confidence']}%"
        )

        print(
            f"Waste Category    : "
            f"{result['waste_category']}"
        )

        print(
            f"Recommendation    : "
            f"{result['recycling_recommendation']}"
        )

        print()
        print("Top Predictions:")

        for prediction in result[
            "top_predictions"
        ]:

            print(
                f"  {prediction['fabric_type']}"
                f" → "
                f"{prediction['confidence']}%"
            )

        print("=" * 60)

    except Exception as e:

        print()
        print("Prediction failed:")
        print(e)