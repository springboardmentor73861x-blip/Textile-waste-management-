import os
from pathlib import Path
import tensorflow as tf


# ============================================================
# FINAL ML MODEL CONFIGURATION
# ============================================================

IMAGE_SIZE = (300, 300)
NUM_CHANNELS = 3

BASE_DIR = Path(__file__).resolve().parents[1]

MODEL_PATH = (
    BASE_DIR
    / "saved_models"
    / "textile_efficientnetb1_clean_best.keras"
)


# ============================================================
# LOAD TRAINED MODEL
# ============================================================

_model = None


def load_model():
    """
    Load the already-trained EfficientNetB1 model.

    The FINAL model contains its own preprocessing layers,
    so input must remain raw 0-255 RGB float32 data.
    """

    global _model

    if _model is None:

        if not MODEL_PATH.exists():
            raise FileNotFoundError(
                f"Trained model not found at: {MODEL_PATH}"
            )

        try:
            _model = tf.keras.models.load_model(
                MODEL_PATH,
                compile=False
            )

        except Exception as exc:
            raise RuntimeError(
                f"Failed to load EfficientNetB1 model from "
                f"{MODEL_PATH}. Original error: {exc}"
            ) from exc

    return _model


def get_model():
    """
    Return the cached trained EfficientNetB1 model.
    """
    return load_model()


# ============================================================
# LEGACY TRAINING COMPATIBILITY
# ============================================================

def build_model(num_classes):
    """
    Kept only so existing training-related imports do not break.

    Runtime prediction does NOT use this function.
    The application uses the already-trained EfficientNetB1
    model through load_model().
    """

    base_model = tf.keras.applications.EfficientNetB1(
        include_top=False,
        weights="imagenet",
        input_shape=(300, 300, 3)
    )

    base_model.trainable = False

    inputs = tf.keras.Input(
        shape=(300, 300, 3)
    )

    x = base_model(
        inputs,
        training=False
    )

    x = tf.keras.layers.GlobalAveragePooling2D()(x)

    x = tf.keras.layers.Dropout(0.3)(x)

    outputs = tf.keras.layers.Dense(
        num_classes,
        activation="softmax"
    )(x)

    model = tf.keras.Model(
        inputs,
        outputs
    )

    model.compile(
        optimizer=tf.keras.optimizers.Adam(
            learning_rate=0.0001
        ),
        loss="sparse_categorical_crossentropy",
        metrics=["accuracy"]
    )

    return model