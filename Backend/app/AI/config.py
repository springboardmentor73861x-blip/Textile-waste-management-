import os

# ============================================================
# PROJECT ROOT
# ============================================================

PROJECT_ROOT = os.path.abspath(
    os.path.join(
        os.path.dirname(__file__),
        "..",
        "..",
        ".."
    )
)

# ============================================================
# DATASET
# ============================================================

DATASET_ROOT = os.path.join(
    PROJECT_ROOT,
    "Datasets"
)

# ============================================================
# IMAGE SETTINGS
# ============================================================

# EfficientNetB1 training configuration
IMAGE_SIZE = (300, 300)

CHANNELS = 3

BATCH_SIZE = 32

# ============================================================
# MODEL
# ============================================================

MODEL_NAME = "efficientnetb1"
MODEL_DIR = os.path.join(
    os.path.dirname(__file__),
    "models"
)



MODEL_PATH = os.path.join(
    MODEL_DIR,
    "textile_efficientnetb1_clean_best.keras"
)

CLASS_NAMES_PATH = os.path.join(
    MODEL_DIR,
    "efficientnetb1_clean_class_names.json"
)

# ============================================================
# CLASS NAMES
# ============================================================

CLASS_NAMES = [
    "Cotton_Flat",
    "Denim_Flat",
    "Linen_Flat",
    "Nylon_Flat",
    "Polyester_Flat",
    "Silk_Flat",
    "Wool_Flat",
]

# ============================================================
# TRAINING SETTINGS
# ============================================================

EPOCHS = 20

LEARNING_RATE = 1e-5

VALIDATION_SPLIT = 0.2

TEST_SPLIT = 0.1

RANDOM_SEED = 42

# ============================================================
# DIRECTORIES
# ============================================================

CHECKPOINT_DIR = os.path.join(
    os.path.dirname(__file__),
    "checkpoints"
)


LOG_DIR = os.path.join(
    os.path.dirname(__file__),
    "logs"
)

# ============================================================
# CREATE DIRECTORIES
# ============================================================

os.makedirs(
    MODEL_DIR,
    exist_ok=True
)

os.makedirs(
    CHECKPOINT_DIR,
    exist_ok=True
)

os.makedirs(
    LOG_DIR,
    exist_ok=True
)