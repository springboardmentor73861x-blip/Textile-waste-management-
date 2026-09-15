import json
import time
from pathlib import Path

import numpy as np
import tensorflow as tf

from app.services.image_preprocessing import ImageProcessor


# ============================================================
# FINAL ML MODEL CONFIGURATION
# ============================================================

BASE_DIR = Path(__file__).resolve().parents[1]

MODEL_PATH = (
    BASE_DIR
    / "saved_models"
    / "textile_efficientnetb1_clean_best.keras"
)

CLASS_NAMES_PATH = (
    BASE_DIR
    / "saved_models"
    / "class_names.json"
)


# ============================================================
# LOAD CLASS NAMES
# ============================================================

if not CLASS_NAMES_PATH.exists():
    raise FileNotFoundError(
        f"class_names.json not found at: {CLASS_NAMES_PATH}"
    )

with open(CLASS_NAMES_PATH, "r", encoding="utf-8") as file:
    CLASS_NAMES = json.load(file)

if not isinstance(CLASS_NAMES, list) or not CLASS_NAMES:
    raise ValueError(
        "class_names.json must contain a non-empty list."
    )


# ============================================================
# LOAD FINAL EFFICIENTNETB1 MODEL
# ============================================================

if not MODEL_PATH.exists():
    raise FileNotFoundError(
        f"Trained EfficientNetB1 model not found at: {MODEL_PATH}"
    )

try:
    model = tf.keras.models.load_model(
        MODEL_PATH,
        compile=False
    )
except Exception as exc:
    raise RuntimeError(
        f"Failed to load EfficientNetB1 model from "
        f"{MODEL_PATH}. Original error: {exc}"
    ) from exc


# ============================================================
# VERIFY MODEL OUTPUTS
# ============================================================

output_units = model.output_shape[-1]

if output_units != len(CLASS_NAMES):
    raise ValueError(
        f"Model output classes ({output_units}) do not match "
        f"class_names.json ({len(CLASS_NAMES)})."
    )


# ============================================================
# PREDICTION
# ============================================================

def predict_image(image_path: str):

    # FINAL preprocessing:
    # RGB → 300x300 → float32 → RAW 0-255
    # No manual /255 normalization.
    image = ImageProcessor.preprocess_image(image_path)

    start_time = time.perf_counter()

    prediction = model.predict(
        image,
        verbose=0
    )

    inference_time_ms = (
        time.perf_counter() - start_time
    ) * 1000

    probabilities = prediction[0]

    # Best prediction
    class_index = int(
        np.argmax(probabilities)
    )

    confidence = float(
        probabilities[class_index]
    )

    material = CLASS_NAMES[class_index]

    # Top 3 predictions
    ranked_indices = np.argsort(
        probabilities
    )[::-1][:3]

    top_k = []

    for index in ranked_indices:
        top_k.append({
            "material": CLASS_NAMES[int(index)],
            "confidence": round(
                float(probabilities[index]) * 100,
                2
            )
        })

    return {
        "material": material,
        "confidence": round(
            confidence * 100,
            2
        ),
        "top_k": top_k,
        "inference_time_ms": round(
            inference_time_ms,
            2
        )
    }