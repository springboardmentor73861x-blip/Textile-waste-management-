from pathlib import Path
from io import BytesIO
import csv

import torch
import torch.nn as nn

from fastapi import (
    APIRouter,
    File,
    Form,
    UploadFile,
    HTTPException,
)

from torchvision import models, transforms

from PIL import Image

from app.database import SessionLocal
from app.models.prediction import PredictionHistory


# ============================================================
# ROUTER
# ============================================================

router = APIRouter(
    prefix="/prediction",
    tags=["AI Prediction"],
)


# ============================================================
# PATH CONFIGURATION
# ============================================================

BACKEND_DIR = Path(
    __file__
).resolve().parents[2]


# ============================================================
# MOBILE NET V3 MODEL
# ============================================================

MODEL_PATH = (
    BACKEND_DIR
    / "models"
    / "mobilenetv3"
    / "mobilenetv3_best.pth"
)


# ============================================================
# TEXTILE METADATA
# ============================================================

METADATA_PATH = (
    BACKEND_DIR
    / "preprocessing"
    / "dataset"
    / "textile_metadata.csv"
)


# ============================================================
# MODEL CONFIGURATION
# IMPORTANT:
# These MUST exactly match train_mobilenetv3.py
# and preprocessing/dataset_loader.py
# ============================================================

CLASS_NAMES = [
    "Acrylic",
    "Cotton",
    "Denim",
    "Linen",
    "Nylon",
    "Polyester",
    "Rayon",
    "Silk",
    "Wool",
]


NUM_CLASSES = len(CLASS_NAMES)

IMAGE_SIZE = 224


# ============================================================
# DEVICE
# ============================================================

DEVICE = torch.device(
    "cuda"
    if torch.cuda.is_available()
    else "cpu"
)


# ============================================================
# IMAGE TRANSFORM
#
# SAME NORMALIZATION USED DURING TRAINING
# ============================================================

transform = transforms.Compose([

    transforms.Resize(
        (IMAGE_SIZE, IMAGE_SIZE)
    ),

    transforms.ToTensor(),

    transforms.Normalize(
        mean=[
            0.485,
            0.456,
            0.406,
        ],

        std=[
            0.229,
            0.224,
            0.225,
        ],
    ),
])


# ============================================================
# GLOBAL MODEL
# ============================================================

model = None


# ============================================================
# GLOBAL METADATA
# ============================================================

metadata = {}


# ============================================================
# LOAD MOBILENETV3 MODEL
# ============================================================

def load_model():

    global model

    if model is not None:
        return model

    print()
    print("=" * 75)
    print("TEXTILE WASTE AI")
    print("LOADING MOBILENETV3-LARGE")
    print("=" * 75)

    print()
    print("Model path:")
    print(MODEL_PATH)

    print()
    print("Device:")
    print(DEVICE)

    print()
    print("Expected classes:")

    for index, class_name in enumerate(CLASS_NAMES):

        print(
            f"{index}: {class_name}"
        )

    print()

    # ========================================================
    # CHECK MODEL FILE
    # ========================================================

    if not MODEL_PATH.exists():

        raise FileNotFoundError(
            f"MobileNetV3 model file was not found:\n"
            f"{MODEL_PATH}"
        )

    # ========================================================
    # CREATE MOBILENETV3-LARGE
    #
    # Training code used:
    #
    # models.mobilenet_v3_large(...)
    #
    # with classifier changed to 9 classes.
    # ========================================================

    network = models.mobilenet_v3_large(
        weights=None
    )

    # ========================================================
    # REPLACE FINAL CLASSIFIER
    # ========================================================

    input_features = (
        network.classifier[-1].in_features
    )

    network.classifier[-1] = nn.Linear(
        input_features,
        NUM_CLASSES
    )

    # ========================================================
    # LOAD CHECKPOINT
    # ========================================================

    checkpoint = torch.load(
        MODEL_PATH,
        map_location=DEVICE
    )

    # ========================================================
    # CHECKPOINT FORMAT
    # ========================================================

    if (
        isinstance(checkpoint, dict)
        and "model_state_dict" in checkpoint
    ):

        state_dict = (
            checkpoint[
                "model_state_dict"
            ]
        )

        saved_classes = checkpoint.get(
            "class_names"
        )

        # ----------------------------------------------------
        # VERIFY CLASS MAPPING
        # ----------------------------------------------------

        if saved_classes is None:

            raise RuntimeError(
                "MobileNetV3 checkpoint does not contain "
                "'class_names'. Cannot safely verify "
                "the model class mapping."
            )

        saved_classes = list(
            saved_classes
        )

        if saved_classes != CLASS_NAMES:

            raise RuntimeError(
                "MOBILE NET V3 CLASS MAPPING MISMATCH.\n\n"
                f"Checkpoint classes:\n"
                f"{saved_classes}\n\n"
                f"API classes:\n"
                f"{CLASS_NAMES}\n\n"
                "The API and trained model must use "
                "the exact same class order."
            )

    else:

        # ----------------------------------------------------
        # Raw state_dict fallback
        # ----------------------------------------------------

        state_dict = checkpoint

    # ========================================================
    # LOAD MODEL WEIGHTS
    # ========================================================

    try:

        network.load_state_dict(
            state_dict
        )

    except Exception as error:

        raise RuntimeError(
            "Could not load MobileNetV3 model weights.\n"
            f"Error: {error}"
        )

    # ========================================================
    # MOVE TO DEVICE
    # ========================================================

    network = network.to(
        DEVICE
    )

    # ========================================================
    # EVALUATION MODE
    # ========================================================

    network.eval()

    model = network

    print()
    print(
        "MobileNetV3-Large loaded successfully."
    )

    print()
    print("Model class mapping:")

    for index, class_name in enumerate(
        CLASS_NAMES
    ):

        print(
            f"{index}: {class_name}"
        )

    print()
    print(
        f"Number of classes: {NUM_CLASSES}"
    )

    print("=" * 75)

    return model


# ============================================================
# LOAD TEXTILE METADATA
# ============================================================

def load_metadata():

    global metadata

    # Already loaded
    if metadata:
        return metadata

    print()
    print(
        "Loading textile metadata..."
    )

    print(
        f"Metadata path: {METADATA_PATH}"
    )

    # ========================================================
    # CHECK FILE
    # ========================================================

    if not METADATA_PATH.exists():

        print()
        print(
            "WARNING: Metadata file not found."
        )

        print(
            METADATA_PATH
        )

        return metadata

    # ========================================================
    # READ CSV
    # ========================================================

    try:

        with open(
            METADATA_PATH,
            "r",
            encoding="utf-8-sig",
            newline=""
        ) as file:

            reader = csv.DictReader(
                file
            )

            for row in reader:

                fabric_type = (
                    row.get(
                        "fabric_type",
                        ""
                    )
                    or ""
                ).strip()

                if not fabric_type:
                    continue

                key = (
                    fabric_type
                    .strip()
                    .lower()
                )

                # ------------------------------------------------
                # Keep first valid row for each fabric type.
                #
                # CSV contains many image records for the same
                # fabric type, but their textile metadata is shared.
                # ------------------------------------------------

                if key not in metadata:

                    metadata[key] = row

        print()
        print(
            f"Metadata records loaded: "
            f"{len(metadata)}"
        )

        print()
        print(
            "Metadata fabric types:"
        )

        for fabric_type in metadata:

            print(
                f" - {fabric_type}"
            )

    except Exception as error:

        print()
        print(
            "WARNING: Could not load metadata."
        )

        print(
            f"Error: {error}"
        )

    return metadata


# ============================================================
# GET METADATA FOR FABRIC
# ============================================================

def get_metadata(
    fabric_type: str
):

    loaded_metadata = (
        load_metadata()
    )

    row = loaded_metadata.get(
        fabric_type
        .strip()
        .lower()
    )

    # ========================================================
    # FALLBACK
    # ========================================================

    if not row:

        return {

            "material_type":
                "Information not available",

            "composition":
                "Information not available",

            "waste_category":
                "Textile Waste",

            "recyclability":
                "Requires assessment",

            "biodegradability":
                "Depends on material",

            "recommended_processing":
                "Material-specific textile recycling",

            "potential_reuse":
                "Recovered textile products",

        }

    # ========================================================
    # SAFE VALUE HELPER
    # ========================================================

    def get_value(
        key: str,
        default: str
    ):

        value = row.get(
            key,
            default
        )

        if value is None:
            return default

        value = str(
            value
        ).strip()

        if not value:
            return default

        return value

    # ========================================================
    # RETURN METADATA
    # ========================================================

    return {

        "material_type":
            get_value(
                "material_type",
                "Information not available"
            ),

        "composition":
            get_value(
                "composition",
                "Information not available"
            ),

        "waste_category":
            get_value(
                "waste_category",
                "Textile Waste"
            ),

        "recyclability":
            get_value(
                "recyclability",
                "Requires assessment"
            ),

        "biodegradability":
            get_value(
                "biodegradability",
                "Depends on material"
            ),

        "recommended_processing":
            get_value(
                "recommended_processing",
                "Material-specific textile recycling"
            ),

        "potential_reuse":
            get_value(
                "potential_reuse",
                "Recovered textile products"
            ),

    }


# ============================================================
# PREDICT IMAGE
# ============================================================

def predict_image(
    image: Image.Image
):

    loaded_model = load_model()

    # ========================================================
    # RGB
    # ========================================================

    image = image.convert(
        "RGB"
    )

    # ========================================================
    # TRANSFORM
    # ========================================================

    tensor = transform(
        image
    )

    # ========================================================
    # ADD BATCH DIMENSION
    # ========================================================

    tensor = tensor.unsqueeze(
        0
    )

    # ========================================================
    # DEVICE
    # ========================================================

    tensor = tensor.to(
        DEVICE
    )

    # ========================================================
    # MODEL PREDICTION
    # ========================================================

    with torch.no_grad():

        outputs = loaded_model(
            tensor
        )

        probabilities = torch.softmax(
            outputs,
            dim=1
        )[0]

    # ========================================================
    # SAFETY CHECK
    # ========================================================

    if len(probabilities) != NUM_CLASSES:

        raise RuntimeError(
            "MODEL OUTPUT CLASS COUNT MISMATCH.\n"
            f"Model output: {len(probabilities)}\n"
            f"Expected: {NUM_CLASSES}"
        )

    # ========================================================
    # SORT PROBABILITIES
    # ========================================================

    sorted_indices = torch.argsort(
        probabilities,
        descending=True
    )

    # ========================================================
    # TOP PREDICTION
    # ========================================================

    predicted_index = (
        sorted_indices[0]
        .item()
    )

    predicted_probability = (
        probabilities[
            predicted_index
        ]
        .item()
    )

    fabric_type = (
        CLASS_NAMES[
            predicted_index
        ]
    )

    confidence_percentage = (
        predicted_probability
        * 100
    )

    # ========================================================
    # TOP 5 PREDICTIONS
    # ========================================================

    top_predictions = []

    top_count = min(
        5,
        NUM_CLASSES
    )

    for rank, index_tensor in enumerate(
        sorted_indices[:top_count],
        start=1
    ):

        index = (
            index_tensor
            .item()
        )

        probability = (
            probabilities[index]
            .item()
        )

        top_predictions.append({

            "rank":
                rank,

            "index":
                index,

            "name":
                CLASS_NAMES[index],

            "probability":
                probability,

            "percentage":
                probability * 100,

        })

    # ========================================================
    # ALL CLASS PROBABILITIES
    #
    # IMPORTANT:
    # These are the SAME softmax probabilities.
    # They will sum approximately to 100%.
    # ========================================================

    all_class_probabilities = []

    for index in range(
        NUM_CLASSES
    ):

        probability = (
            probabilities[index]
            .item()
        )

        all_class_probabilities.append({

            "index":
                index,

            "name":
                CLASS_NAMES[index],

            "probability":
                probability,

            "percentage":
                probability * 100,

        })

    # ========================================================
    # METADATA
    # ========================================================

    textile_metadata = get_metadata(
        fabric_type
    )

    # ========================================================
    # RESULT
    # ========================================================

    return {

        # ----------------------------------------------------
        # Main prediction
        # ----------------------------------------------------

        "fabric_type":
            fabric_type,

        "class_name":
            fabric_type,

        "class_index":
            predicted_index,

        # ----------------------------------------------------
        # Confidence
        # ----------------------------------------------------

        "confidence":
            predicted_probability,

        "confidence_percentage":
            confidence_percentage,

        # ----------------------------------------------------
        # Material information
        # ----------------------------------------------------

        "material_type":
            textile_metadata[
                "material_type"
            ],

        "material":
            textile_metadata[
                "material_type"
            ],

        "composition":
            textile_metadata[
                "composition"
            ],

        # ----------------------------------------------------
        # Waste information
        # ----------------------------------------------------

        "waste_category":
            textile_metadata[
                "waste_category"
            ],

        "category":
            textile_metadata[
                "waste_category"
            ],

        # ----------------------------------------------------
        # Sustainability
        # ----------------------------------------------------

        "recyclability":
            textile_metadata[
                "recyclability"
            ],

        "biodegradability":
            textile_metadata[
                "biodegradability"
            ],

        # ----------------------------------------------------
        # Processing
        # ----------------------------------------------------

        "recommended_processing":
            textile_metadata[
                "recommended_processing"
            ],

        "recommendation":
            textile_metadata[
                "recommended_processing"
            ],

        # ----------------------------------------------------
        # Reuse
        # ----------------------------------------------------

        "potential_reuse":
            textile_metadata[
                "potential_reuse"
            ],

        # ----------------------------------------------------
        # Top 5
        # ----------------------------------------------------

        "top_predictions":
            top_predictions,

        # Keep this alias because your frontend
        # may already use "probabilities".
        "probabilities":
            top_predictions,

        # ----------------------------------------------------
        # ALL 9
        # ----------------------------------------------------

        "all_class_probabilities":
            all_class_probabilities,

    }


# ============================================================
# SAVE PREDICTION HISTORY
# ============================================================

def save_prediction_history(
    filename: str,
    prediction: dict,
    source: str,
    waste_category: str,
    color: str,
    condition: str,
    weight: str,
    quantity: str,
    notes: str,
):

    db = SessionLocal()

    try:

        # ====================================================
        # WEIGHT
        # ====================================================

        weight_value = None

        if weight:

            try:

                weight_value = float(
                    weight
                )

            except (
                ValueError,
                TypeError
            ):

                weight_value = None

        # ====================================================
        # QUANTITY
        # ====================================================

        quantity_value = None

        if quantity:

            try:

                quantity_value = int(
                    quantity
                )

            except (
                ValueError,
                TypeError
            ):

                quantity_value = None

        # ====================================================
        # CREATE DATABASE RECORD
        # ====================================================

        history = PredictionHistory(

            filename=filename,

            fabric_type=prediction[
                "fabric_type"
            ],

            class_index=prediction[
                "class_index"
            ],

            confidence=prediction[
                "confidence"
            ],

            confidence_percentage=prediction[
                "confidence_percentage"
            ],

            source=source,

            waste_category=waste_category,

            color=color,

            condition=condition,

            weight=weight_value,

            quantity=quantity_value,

            notes=notes,

            material_type=prediction[
                "material_type"
            ],

            composition=prediction[
                "composition"
            ],

            recyclability=prediction[
                "recyclability"
            ],

            biodegradability=prediction[
                "biodegradability"
            ],

            recommended_processing=prediction[
                "recommended_processing"
            ],

            potential_reuse=prediction[
                "potential_reuse"
            ],

        )

        # ====================================================
        # SAVE
        # ====================================================

        db.add(
            history
        )

        db.commit()

        db.refresh(
            history
        )

        return history

    except Exception:

        db.rollback()

        raise

    finally:

        db.close()


# ============================================================
# HISTORY SERIALIZER
# ============================================================

def history_to_dict(
    history: PredictionHistory
):

    return {

        "id":
            history.id,

        "filename":
            history.filename,

        "fabric_type":
            history.fabric_type,

        "class_name":
            history.fabric_type,

        "class_index":
            history.class_index,

        "confidence":
            history.confidence,

        "confidence_percentage":
            history.confidence_percentage,

        "source":
            history.source,

        "waste_category":
            history.waste_category,

        "color":
            history.color,

        "condition":
            history.condition,

        "weight":
            history.weight,

        "quantity":
            history.quantity,

        "notes":
            history.notes,

        "material_type":
            history.material_type,

        "material":
            history.material_type,

        "composition":
            history.composition,

        "recyclability":
            history.recyclability,

        "biodegradability":
            history.biodegradability,

        "recommended_processing":
            history.recommended_processing,

        "recommendation":
            history.recommended_processing,

        "potential_reuse":
            history.potential_reuse,

        "created_at":
            (
                history.created_at.isoformat()
                if history.created_at
                else None
            ),

    }


# ============================================================
# PREDICT API
# ============================================================

@router.post(
    "/predict"
)
async def predict_textile(

    file: UploadFile = File(...),

    source: str = Form(...),

    waste_category: str = Form(...),

    color: str = Form(""),

    condition: str = Form(...),

    weight: str = Form(""),

    quantity: str = Form(""),

    notes: str = Form(""),

):

    # ========================================================
    # FILE VALIDATION
    # ========================================================

    if not file:

        raise HTTPException(
            status_code=400,
            detail="Textile image is required."
        )

    if not file.filename:

        raise HTTPException(
            status_code=400,
            detail="Image filename is missing."
        )

    if not file.content_type:

        raise HTTPException(
            status_code=400,
            detail="Invalid image file."
        )

    if not file.content_type.startswith(
        "image/"
    ):

        raise HTTPException(
            status_code=400,
            detail="Please upload a valid textile image."
        )

    # ========================================================
    # READ IMAGE
    # ========================================================

    try:

        image_bytes = await file.read()

        if not image_bytes:

            raise HTTPException(
                status_code=400,
                detail="Uploaded image is empty."
            )

    except HTTPException:

        raise

    except Exception as error:

        raise HTTPException(
            status_code=400,
            detail=(
                "Could not read uploaded image: "
                f"{error}"
            )
        )

    # ========================================================
    # OPEN IMAGE
    # ========================================================

    try:

        image = Image.open(
            BytesIO(image_bytes)
        ).convert(
            "RGB"
        )

    except Exception:

        raise HTTPException(
            status_code=400,
            detail=(
                "Uploaded file is not a valid image."
            )
        )

    # ========================================================
    # AI PREDICTION
    # ========================================================

    try:

        prediction = predict_image(
            image
        )

    except FileNotFoundError as error:

        print(
            f"MODEL FILE ERROR: {repr(error)}"
        )

        raise HTTPException(
            status_code=500,
            detail=str(error)
        )

    except RuntimeError as error:

        print(
            f"MODEL RUNTIME ERROR: {repr(error)}"
        )

        raise HTTPException(
            status_code=500,
            detail=(
                "MobileNetV3 AI model could not be loaded "
                "or its class mapping is invalid."
            )
        )

    except Exception as error:

        print(
            f"MODEL PREDICTION ERROR: {repr(error)}"
        )

        raise HTTPException(
            status_code=500,
            detail=(
                "AI model prediction failed."
            )
        )

    # ========================================================
    # SAVE HISTORY
    # ========================================================

    try:

        history = save_prediction_history(

            filename=file.filename,

            prediction=prediction,

            source=source,

            waste_category=waste_category,

            color=color,

            condition=condition,

            weight=weight,

            quantity=quantity,

            notes=notes,

        )

    except Exception as error:

        print(
            f"DATABASE SAVE ERROR: {repr(error)}"
        )

        raise HTTPException(
            status_code=500,
            detail=(
                "Prediction succeeded, but prediction "
                "history could not be saved."
            )
        )

    # ========================================================
    # INPUT DATA
    # ========================================================

    input_data = {

        "filename":
            file.filename,

        "source":
            source,

        "waste_category":
            waste_category,

        "color":
            color,

        "condition":
            condition,

        "weight":
            weight,

        "quantity":
            quantity,

        "notes":
            notes,

    }

    # ========================================================
    # FINAL RESPONSE
    # ========================================================

    return {

        "success":
            True,

        "message":
            "AI prediction completed successfully.",

        "model":
            "MobileNetV3-Large",

        "number_of_classes":
            NUM_CLASSES,

        "prediction":
            prediction,

        "input_data":
            input_data,

        "history_id":
            history.id,

    }


# ============================================================
# GET ALL PREDICTION HISTORY
# ============================================================

@router.get(
    "/history"
)
def get_prediction_history():

    db = SessionLocal()

    try:

        records = (
            db.query(
                PredictionHistory
            )
            .order_by(
                PredictionHistory.created_at.desc()
            )
            .all()
        )

        return {

            "success":
                True,

            "count":
                len(records),

            "history":
                [
                    history_to_dict(
                        record
                    )
                    for record in records
                ],

        }

    except Exception as error:

        print(
            f"HISTORY FETCH ERROR: {repr(error)}"
        )

        raise HTTPException(
            status_code=500,
            detail=(
                "Could not fetch prediction history."
            )
        )

    finally:

        db.close()


# ============================================================
# GET SINGLE PREDICTION HISTORY
# ============================================================

@router.get(
    "/history/{history_id}"
)
def get_prediction_history_by_id(
    history_id: int
):

    db = SessionLocal()

    try:

        record = (
            db.query(
                PredictionHistory
            )
            .filter(
                PredictionHistory.id
                == history_id
            )
            .first()
        )

        if not record:

            raise HTTPException(
                status_code=404,
                detail=(
                    "Prediction history record not found."
                )
            )

        return {

            "success":
                True,

            "history":
                history_to_dict(
                    record
                ),

        }

    finally:

        db.close()


# ============================================================
# DELETE PREDICTION HISTORY
# ============================================================

@router.delete(
    "/history/{history_id}"
)
def delete_prediction_history(
    history_id: int
):

    db = SessionLocal()

    try:

        record = (
            db.query(
                PredictionHistory
            )
            .filter(
                PredictionHistory.id
                == history_id
            )
            .first()
        )

        if not record:

            raise HTTPException(
                status_code=404,
                detail=(
                    "Prediction history record not found."
                )
            )

        db.delete(
            record
        )

        db.commit()

        return {

            "success":
                True,

            "message":
                "Prediction history deleted successfully.",

        }

    except HTTPException:

        raise

    except Exception as error:

        db.rollback()

        print(
            f"HISTORY DELETE ERROR: {repr(error)}"
        )

        raise HTTPException(
            status_code=500,
            detail=(
                "Could not delete prediction history."
            )
        )

    finally:

        db.close()