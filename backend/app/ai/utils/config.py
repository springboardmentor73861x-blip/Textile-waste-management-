from pathlib import Path
import tensorflow as tf

# ==========================
# Paths
# ==========================

BASE_DIR = Path(__file__).resolve().parent.parent

DATASET_DIR = BASE_DIR / "datasets" / "fabric_dataset"

MODEL_DIR = BASE_DIR / "trained_models"

OUTPUT_DIR = BASE_DIR / "outputs"

LABEL_DIR = BASE_DIR / "labels"

# ==========================
# Image Configuration
# ==========================

IMAGE_SIZE = (224, 224)

BATCH_SIZE = 32

VALIDATION_SPLIT = 0.2

SEED = 42

AUTOTUNE = tf.data.AUTOTUNE

# ==========================
# Training Configuration
# ==========================

EPOCHS = 20

LEARNING_RATE = 0.001

MODEL_NAME = "fabric_classifier.keras"