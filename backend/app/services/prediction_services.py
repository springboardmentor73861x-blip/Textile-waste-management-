from pathlib import Path
import sys

# ============================================================
# BACKEND ROOT
# ============================================================

BACKEND_DIR = Path(__file__).resolve().parents[2]

if str(BACKEND_DIR) not in sys.path:
    sys.path.insert(0, str(BACKEND_DIR))


# ============================================================
# IMPORT REAL MODEL FUNCTIONS
# ============================================================

from inference.predict import (
    load_model,
    load_metadata,
    predict_image,
)


# ============================================================
# LOAD MODEL ONCE
# ============================================================

print("=" * 75)
print("LOADING TEXTILE AI MODEL")
print("=" * 75)

MODEL = load_model()

METADATA = load_metadata()

print("=" * 75)
print("TEXTILE AI MODEL READY")
print("=" * 75)


# ============================================================
# PREDICTION FUNCTION
# ============================================================

def predict_textile_image(image_path):

    return predict_image(
        image_path,
        MODEL,
        METADATA,
    )