from pathlib import Path
from io import BytesIO

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

BACKEND_DIR = Path(__file__).resolve().parents[2]

MODEL_PATH = (
    BACKEND_DIR
    / "models"
    / "mobilenetv3"
    / "mobilenetv3_small_best.pth"
)


# ============================================================
# MODEL CLASSES
# MUST EXACTLY MATCH TRAINING
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
# SAME AS VALIDATION / TEST
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
# MODEL
# ============================================================

model = None


# ============================================================
# TEXTILE METADATA
# ============================================================

TEXTILE_METADATA = {

    "Cotton": {
        "material_type": "Natural Fiber",
        "composition": "Cellulose-based natural fiber",
        "waste_category": "Natural Fiber Waste",
        "recyclability": "High",
        "biodegradability": "Biodegradable",
        "recommended_processing":
            "Mechanical fiber recycling; reuse for rags, wiping cloths and recycled cotton products",
        "potential_reuse":
            "Clothing, cleaning cloths, bags, insulation and recycled cotton products",
    },

    "Denim": {
        "material_type": "Cotton-Based Textile",
        "composition": "Primarily cotton",
        "waste_category": "Cotton-Based Textile Waste",
        "recyclability": "High",
        "biodegradability": "Biodegradable depending on blend and finishes",
        "recommended_processing":
            "Upcycling or mechanical fiber recycling",
        "potential_reuse":
            "Bags, accessories, insulation and recycled cotton products",
    },

    "Mixed Fabrics": {
        "material_type": "Blended Textile",
        "composition": "Combination of multiple textile fibers",
        "waste_category": "Blended Textile Waste",
        "recyclability": "Requires fiber-composition assessment",
        "biodegradability": "Depends on fiber composition",
        "recommended_processing":
            "Sort by fiber composition where possible; use specialized blended-textile recycling or upcycling",
        "potential_reuse":
            "Upcycled products and specialized recycled textile products",
    },

    "Polyester": {
        "material_type": "Synthetic Fiber",
        "composition": "Polyester / PET-based synthetic fiber",
        "waste_category": "Synthetic Fiber Waste",
        "recyclability": "High through suitable polyester recycling systems",
        "biodegradability": "Non-biodegradable",
        "recommended_processing":
            "Polyester recycling into recycled polyester fibers and products",
        "potential_reuse":
            "Recycled polyester textiles, bags, filling and industrial products",
    },

    "Rayon": {
        "material_type": "Regenerated Cellulosic Fiber",
        "composition": "Regenerated cellulose",
        "waste_category": "Regenerated Cellulosic Fiber Waste",
        "recyclability": "Depends on recycling process",
        "biodegradability": "Generally biodegradable depending on treatment and blend",
        "recommended_processing":
            "Reuse, upcycling and suitable fiber recovery through textile recycling",
        "potential_reuse":
            "Upcycled textile products and recovered fiber products",
    },

    "Silk": {
        "material_type": "Natural Protein Fiber",
        "composition": "Silk protein fiber",
        "waste_category": "Natural Protein Fiber Waste",
        "recyclability": "Reusable and suitable for selected fiber recovery",
        "biodegradability": "Biodegradable",
        "recommended_processing":
            "Reuse, upcycling and suitable textile/fiber recovery",
        "potential_reuse":
            "Accessories, crafts, premium upcycled products and textile reuse",
    },

    "Wool": {
        "material_type": "Natural Protein Fiber",
        "composition": "Keratin-based natural fiber",
        "waste_category": "Natural Protein Fiber Waste",
        "recyclability": "High through reuse and mechanical recycling",
        "biodegradability": "Biodegradable",
        "recommended_processing":
            "Reuse, repair, felting or mechanical fiber recycling",
        "potential_reuse":
            "Felt products, insulation, clothing, accessories and recycled wool products",
    },
}


# ============================================================
# LOAD MODEL
# ============================================================

def load_model():

    global model

    if model is not None:
        return model

    print()
    print("=" * 75)
    print("TEXTILE WASTE AI")
    print("LOADING MOBILENETV3-SMALL")
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
        print(f"{index}: {class_name}")

    # ========================================================
    # CHECK MODEL
    # ========================================================

    if not MODEL_PATH.exists():

        raise FileNotFoundError(
            "MobileNetV3 model file was not found:\n"
            f"{MODEL_PATH}"
        )

    # ========================================================
    # CREATE MOBILENETV3-SMALL
    # ========================================================

    network = models.mobilenet_v3_small(
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
    # EXTRACT STATE DICT
    # ========================================================

    if (
        isinstance(checkpoint, dict)
        and "model_state_dict" in checkpoint
    ):

        state_dict = checkpoint[
            "model_state_dict"
        ]

        saved_classes = checkpoint.get(
            "class_names"
        )

        if saved_classes is not None:

            saved_classes = list(
                saved_classes
            )

            if saved_classes != CLASS_NAMES:

                raise RuntimeError(
                    "MODEL CLASS MAPPING MISMATCH.\n\n"
                    f"Checkpoint classes:\n"
                    f"{saved_classes}\n\n"
                    f"API classes:\n"
                    f"{CLASS_NAMES}"
                )

    else:

        state_dict = checkpoint

    # ========================================================
    # REMOVE DataParallel PREFIX
    # ========================================================

    if isinstance(state_dict, dict):

        state_dict = {
            key.replace(
                "module.",
                "",
                1
            ): value
            for key, value in state_dict.items()
        }

    # ========================================================
    # LOAD WEIGHTS
    # ========================================================

    try:

        network.load_state_dict(
            state_dict
        )

    except Exception as error:

        raise RuntimeError(
            "Could not load MobileNetV3-Small "
            "model weights.\n"
            f"Error: {error}"
        )

    # ========================================================
    # DEVICE
    # ========================================================

    network = network.to(
        DEVICE
    )

    network.eval()

    model = network

    print()
    print(
        "MobileNetV3-Small loaded successfully."
    )

    print(
        f"Number of classes: {NUM_CLASSES}"
    )

    print()
    print("Class mapping:")

    for index, class_name in enumerate(
        CLASS_NAMES
    ):
        print(
            f"{index}: {class_name}"
        )

    print("=" * 75)

    return model


# ============================================================
# GET TEXTILE METADATA
# ============================================================

def get_metadata(
    fabric_type: str
):

    data = TEXTILE_METADATA.get(
        fabric_type
    )

    if data is None:

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

    return data


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

    tensor = tensor.unsqueeze(
        0
    )

    tensor = tensor.to(
        DEVICE
    )

    # ========================================================
    # PREDICTION
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
    # SORT
    # ========================================================

    sorted_indices = torch.argsort(
        probabilities,
        descending=True
    )

    # ========================================================
    # TOP PREDICTION
    # ========================================================

    predicted_index = (
        sorted_indices[0].item()
    )

    predicted_probability = (
        probabilities[
            predicted_index
        ].item()
    )

    fabric_type = CLASS_NAMES[
        predicted_index
    ]

    confidence_percentage = (
        predicted_probability * 100
    )

    # ========================================================
    # TOP 5
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

        index = index_tensor.item()

        probability = (
            probabilities[index].item()
        )

        top_predictions.append({

            "rank": rank,

            "index": index,

            "name": CLASS_NAMES[index],

            "fabric_type":
                CLASS_NAMES[index],

            "probability":
                probability,

            "percentage":
                probability * 100,
        })

    # ========================================================
    # ALL 7 CLASS PROBABILITIES
    # ========================================================

    all_class_probabilities = []

    for index in range(
        NUM_CLASSES
    ):

        probability = (
            probabilities[index].item()
        )

        all_class_probabilities.append({

            "index": index,

            "name": CLASS_NAMES[index],

            "fabric_type":
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
    # RETURN RESULT
    # ========================================================

    return {

        "fabric_type":
            fabric_type,

        "class_name":
            fabric_type,

        "class_index":
            predicted_index,

        "confidence":
            predicted_probability,

        "confidence_percentage":
            confidence_percentage,

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

        "waste_category":
            textile_metadata[
                "waste_category"
            ],

        "category":
            textile_metadata[
                "waste_category"
            ],

        "recyclability":
            textile_metadata[
                "recyclability"
            ],

        "biodegradability":
            textile_metadata[
                "biodegradability"
            ],

        "recommended_processing":
            textile_metadata[
                "recommended_processing"
            ],

        "recommendation":
            textile_metadata[
                "recommended_processing"
            ],

        "potential_reuse":
            textile_metadata[
                "potential_reuse"
            ],

        "top_predictions":
            top_predictions,

        "probabilities":
            top_predictions,

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
                weight_value = float(weight)

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
                quantity_value = int(quantity)

            except (
                ValueError,
                TypeError
            ):
                quantity_value = None

        # ====================================================
        # CREATE RECORD
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

@router.post("/predict")
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
    # VALIDATE FILE
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
            detail="Uploaded file is not a valid image."
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
            detail=str(error)
        )

    except Exception as error:

        print(
            f"MODEL PREDICTION ERROR: {repr(error)}"
        )

        raise HTTPException(
            status_code=500,
            detail="AI model prediction failed."
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
    # RESPONSE
    # ========================================================

    return {

        "success":
            True,

        "message":
            "AI prediction completed successfully.",

        "model":
            "MobileNetV3-Small",

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
# GET HISTORY
# ============================================================

@router.get("/history")
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
                    history_to_dict(record)
                    for record in records
                ],
        }

    except Exception as error:

        print(
            f"HISTORY FETCH ERROR: {repr(error)}"
        )

        raise HTTPException(
            status_code=500,
            detail="Could not fetch prediction history."
        )

    finally:

        db.close()


# ============================================================
# GET SINGLE HISTORY
# ============================================================

@router.get("/history/{history_id}")
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
                detail="Prediction history record not found."
            )

        return {

            "success":
                True,

            "history":
                history_to_dict(record),
        }

    finally:

        db.close()


# ============================================================
# DELETE HISTORY
# ============================================================

@router.delete("/history/{history_id}")
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
                detail="Prediction history record not found."
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
            detail="Could not delete prediction history."
        )

    finally:

        db.close()