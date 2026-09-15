import json
import time
from pathlib import Path

import numpy as np
import tensorflow as tf


BASE_DIR = Path(__file__).resolve().parents[1]

MODEL_PATH = (
    BASE_DIR
    / "saved_models"
    / "textile_efficientnetb1_clean_best.keras"
)

CLASS_NAMES_PATH = BASE_DIR / "saved_models" / "efficientnetb1_clean_class_names.json"


def load_class_names():
    if not CLASS_NAMES_PATH.exists():
        raise FileNotFoundError(
            f"class_names.json not found at: {CLASS_NAMES_PATH}"
        )

    with open(CLASS_NAMES_PATH, "r", encoding="utf-8") as file:
        class_names = json.load(file)

    if not isinstance(class_names, list) or not class_names:
        raise ValueError("class_names.json must contain a non-empty list.")

    return class_names


def load_prediction_model():
    if not MODEL_PATH.exists():
        raise FileNotFoundError(
            f"EfficientNet-B1 model not found at: {MODEL_PATH}"
        )

    try:
        return tf.keras.models.load_model(
            MODEL_PATH,
            compile=False
        )
    except Exception as exc:
        raise RuntimeError(
            f"Failed to load EfficientNet-B1 model from {MODEL_PATH}. "
            f"Check TensorFlow/Keras versions and model integrity. "
            f"Original error: {exc}"
        ) from exc


CLASS_NAMES = load_class_names()
model = load_prediction_model()


# Verify model output classes match class_names.json
MODEL_OUTPUT_UNITS = model.output_shape[-1]

if MODEL_OUTPUT_UNITS != len(CLASS_NAMES):
    raise ValueError(
        f"Model output has {MODEL_OUTPUT_UNITS} classes, but "
        f"class_names.json contains {len(CLASS_NAMES)} classes."
    )


class PredictionService:

    @staticmethod
    def predict(image):

        start_time = time.perf_counter()

        prediction = model.predict(
            image,
            verbose=0
        )

        inference_time_ms = (
            time.perf_counter() - start_time
        ) * 1000

        probabilities = prediction[0]

        class_index = int(np.argmax(probabilities))

        confidence = float(
            probabilities[class_index] * 100
        )

        texture = CLASS_NAMES[class_index]

        # Convert FINAL model labels such as Cotton_Flat
        # into the existing application's material naming.
        material = texture.replace("_Flat", "")

        # ---------------------------------------------------------
        # Existing application business logic is preserved
        # so dashboards / DB / reports do not break.
        # ---------------------------------------------------------

        if material in [
            "Cotton",
            "Denim",
            "Linen",
            "Silk",
            "Wool"
        ]:
            waste_type = "Reusable"
            recycle = True
            reuse = True
            repair = True
            score = 95

        elif material in [
            "Polyester",
            "Nylon"
        ]:
            waste_type = "Recyclable"
            recycle = True
            reuse = True
            repair = False
            score = 90

        else:
            waste_type = "General Textile Waste"
            recycle = True
            reuse = False
            repair = False
            score = 80

        return {
            "material": material,
            "waste_type": waste_type,
            "confidence": round(confidence, 2),
            "recycle": recycle,
            "reuse": reuse,
            "repair": repair,
            "score": score,
            "inference_time_ms": round(
                inference_time_ms,
                2
            )
        }