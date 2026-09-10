from pathlib import Path


# ==========================================================
# AI DIRECTORY
# ==========================================================

AI_DIR = Path(__file__).resolve().parent


# ==========================================================
# BACKEND DIRECTORY
# ==========================================================

BACKEND_DIR = AI_DIR.parent


# ==========================================================
# PROJECT PATHS
# ==========================================================

MODELS_DIR = AI_DIR / "models"

GRAPHS_DIR = AI_DIR / "graphs"

LOGS_DIR = AI_DIR / "logs"

LABELS_PATH = AI_DIR / "labels.json"

FABRIC_INFO_PATH = AI_DIR / "fabric_info.json"


# Dataset path
DATASET_PATH = BACKEND_DIR.parent / "datasets"


# ==========================================================
# TRAINING PARAMETERS
# ==========================================================

IMAGE_SIZE = (224, 224)

BATCH_SIZE = 32

EPOCHS = 20

LEARNING_RATE = 0.0001

VALIDATION_SPLIT = 0.20

SEED = 42


# ==========================================================
# SELECTED CLASSES
# ==========================================================

CLASSES = [

    "Corduroy",

    "Cotton",

    "Denim",

    "Fleece",

    "Leather",

    "Linen",

    "Nylon",

    "Polyester",

    "Silk",

    "Velvet",

]