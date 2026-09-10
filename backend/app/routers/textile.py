from fastapi import (
    APIRouter,
    UploadFile,
    File,
    Form,
    Depends,
    HTTPException,
)

from sqlalchemy.orm import Session

import os
import shutil

from uuid import uuid4

from app.database import get_db
from app.core.auth import get_current_user
from app.models.user import User

from app.crud.textile import (
    create_textile,
    get_user_textiles,
    get_textile_by_id,
    update_textile,
    delete_textile,
)

from app.crud.notification import (
    create_notification
)
from app.schemas.textile import TextileUpdate

from app.services.sustainability import (
    calculate_sustainability
)

from app.services.recommendation import (
    generate_recommendation
)

from app.services.environmental import (
    calculate_environmental_impact
)

from app.services.analytics import (
    calculate_circular_economy_analytics
)

from ai.predict import predict_image


# ==========================================================
# ROUTER
# ==========================================================

router = APIRouter(
    prefix="/textiles",
    tags=["Textiles"],
)


# ==========================================================
# UPLOAD DIRECTORY
# ==========================================================

UPLOAD_DIR = "uploads"

os.makedirs(
    UPLOAD_DIR,
    exist_ok=True,
)


# ==========================================================
# UPLOAD TEXTILE
# ==========================================================

@router.post("/upload")
async def upload_textile(

    file: UploadFile = File(...),

    textile_name: str = Form(None),

    description: str = Form(None),

    db: Session = Depends(get_db),

    current_user: User = Depends(
        get_current_user
    ),
):

    # ======================================================
    # VALIDATE FILE
    # ======================================================

    if not file.filename:

        raise HTTPException(
            status_code=400,
            detail="No file selected.",
        )

    allowed_extensions = {
        ".jpg",
        ".jpeg",
        ".png",
        ".webp",
    }

    extension = os.path.splitext(
        file.filename
    )[1].lower()

    if extension not in allowed_extensions:

        raise HTTPException(
            status_code=400,
            detail=(
                "Unsupported image format. "
                "Use JPG, JPEG, PNG or WEBP."
            ),
        )

    # ======================================================
    # GENERATE FILE NAME
    # ======================================================

    filename = (
        f"{uuid4()}{extension}"
    )

    filepath = os.path.join(
        UPLOAD_DIR,
        filename,
    )

    # ======================================================
    # SAVE IMAGE
    # ======================================================

    try:

        with open(
            filepath,
            "wb",
        ) as buffer:

            shutil.copyfileobj(
                file.file,
                buffer,
            )

    except Exception as error:

        raise HTTPException(
            status_code=500,
            detail=(
                f"Could not save image: {error}"
            ),
        )

    # ======================================================
    # AI PREDICTION
    # ======================================================

    try:

        ai_result = predict_image(
            filepath
        )

        print(
            "\nAI Prediction:"
        )

        print(
            ai_result
        )

    except Exception as error:

        if os.path.exists(filepath):

            os.remove(filepath)

        print(
            "AI Prediction Error:",
            error
        )

        raise HTTPException(
            status_code=500,
            detail=(
                f"AI prediction failed: {error}"
            ),
        )

    # ======================================================
    # EXTRACT AI INFORMATION
    # ======================================================

    prediction = ai_result.get(
        "fabric"
    )

    confidence = ai_result.get(
        "confidence"
    )

    category = ai_result.get(
        "category",
        "Unknown"
    )

    recyclability = ai_result.get(
        "recyclability",
        "Unknown"
    )

    recommendation = ai_result.get(
        "recommendation",
        "No recommendation available."
    )

    top_predictions = ai_result.get(
        "top_predictions",
        []
    )
        # ======================================================
    # CONFIDENCE THRESHOLD GUARDRAIL
    # Rejects results where the model isn't confident enough
    # to be a textile at all (e.g. non-fabric photos).
    # ======================================================

    CONFIDENCE_THRESHOLD = 50.0  # percent

    try:
        confidence_value = float(confidence) if confidence is not None else 0.0
    except (TypeError, ValueError):
        confidence_value = 0.0

    if confidence_value < CONFIDENCE_THRESHOLD:

        if os.path.exists(filepath):
            os.remove(filepath)

        return {
            "success": False,
            "low_confidence": True,
            "message": (
                "Unable to confidently classify this image as a textile. "
                "Please upload a clear, well-lit photo of the fabric, "
                "filling most of the frame."
            ),
            "ai_analysis": {
                "fabric": prediction,
                "confidence": confidence_value,
                "top_predictions": top_predictions,
            },
        }
    print(
        "\nExtracted AI Information:"
    )

    print(
        "--------------------------------"
    )

    print(
        "Fabric         :",
        prediction
    )

    print(
        "Confidence     :",
        confidence
    )

    print(
        "Category       :",
        category
    )

    print(
        "Recyclability  :",
        recyclability
    )

    print(
        "Recommendation :",
        recommendation
    )

    print(
        "Top Predictions:",
        top_predictions
    )

    print(
        "--------------------------------"
    )

    # ======================================================
    # SUSTAINABILITY INTELLIGENCE
    # ======================================================

    try:

        sustainability_result = (
            calculate_sustainability(
                fabric=prediction,
                recyclability=recyclability,
            )
        )

        print(
            "\nSustainability Intelligence:"
        )

        print(
            "--------------------------------"
        )

        print(
            "Sustainability Score :",
            sustainability_result[
                "sustainability_score"
            ]
        )

        print(
            "Circularity Score    :",
            sustainability_result[
                "circularity_score"
            ]
        )

        print(
            "Recovery Category    :",
            sustainability_result[
                "recovery_category"
            ]
        )

        print(
            "--------------------------------"
        )

    except Exception as error:

        print(
            "Sustainability Intelligence Error:",
            error
        )

        sustainability_result = {

            "fabric": prediction,

            "sustainability_score": 0,

            "circularity_score": 0,

            "recovery_category": "Unknown",

            "components": {},

            "weights": {},
        }

    # ======================================================
    # RECOMMENDATION INTELLIGENCE
    # ======================================================

    try:

        recommendation_result = (
            generate_recommendation(

                fabric=prediction,

                recyclability=recyclability,

                circularity_score=(
                    sustainability_result[
                        "circularity_score"
                    ]
                ),

                recovery_category=(
                    sustainability_result[
                        "recovery_category"
                    ]
                ),
            )
        )

        print(
            "\nRecommendation Intelligence:"
        )

        print(
            "--------------------------------"
        )

        print(
            "Primary Action     :",
            recommendation_result[
                "primary_action"
            ]
        )

        print(
            "Alternative Action :",
            recommendation_result[
                "alternative_action"
            ]
        )

        print(
            "Priority           :",
            recommendation_result[
                "priority"
            ]
        )

        print(
            "--------------------------------"
        )

    except Exception as error:

        print(
            "Recommendation Intelligence Error:",
            error
        )

        recommendation_result = {

            "primary_action":
                "No recommendation available.",

            "alternative_action":
                "Manual inspection required.",

            "reason":
                "Recommendation calculation failed.",

            "priority":
                "Low",

            "workflow": [],
        }

    # ======================================================
    # ENVIRONMENTAL IMPACT
    # ======================================================

    try:

        environmental_result = (
            calculate_environmental_impact(

                fabric=prediction,

                textile_weight_kg=1.0,

                circularity_score=(
                    sustainability_result[
                        "circularity_score"
                    ]
                ),
            )
        )

        print(
            "\nEnvironmental Impact:"
        )

        print(
            "--------------------------------"
        )

        print(
            "CO2 Savings        :",
            environmental_result[
                "estimated_co2_savings_kg"
            ]
        )

        print(
            "Water Savings      :",
            environmental_result[
                "estimated_water_savings_liters"
            ]
        )

        print(
            "Landfill Diversion :",
            environmental_result[
                "estimated_landfill_diversion_kg"
            ]
        )

        print(
            "Resource Recovery  :",
            environmental_result[
                "estimated_resource_recovery_kg"
            ]
        )

        print(
            "Environmental Score:",
            environmental_result[
                "environmental_benefit_score"
            ]
        )

        print(
            "--------------------------------"
        )

    except Exception as error:

        print(
            "Environmental Impact Error:",
            error
        )

        environmental_result = {

            "estimated_co2_savings_kg": 0,

            "estimated_water_savings_liters": 0,

            "estimated_landfill_diversion_kg": 0,

            "estimated_resource_recovery_kg": 0,

            "environmental_benefit_score": 0,

            "environmental_benefit": "Unknown",
        }

    # ======================================================
    # SAVE EVERYTHING TO DATABASE
    # ======================================================

    try:

        textile = create_textile(

            db=db,

            user_id=current_user.id,

            image_path=filepath,

            textile_name=textile_name,

            description=description,

            # ----------------------------------------------
            # AI
            # ----------------------------------------------

            prediction=prediction,

            confidence=confidence,

            category=category,

            recyclable=recyclability,

            recommendation=recommendation,

            top_predictions=top_predictions,

            # ----------------------------------------------
            # SUSTAINABILITY
            # ----------------------------------------------

            sustainability_score=(
                sustainability_result[
                    "sustainability_score"
                ]
            ),

            circularity_score=(
                sustainability_result[
                    "circularity_score"
                ]
            ),

            recovery_category=(
                sustainability_result[
                    "recovery_category"
                ]
            ),

            # ----------------------------------------------
            # RECOMMENDATION
            # ----------------------------------------------

            primary_action=(
                recommendation_result[
                    "primary_action"
                ]
            ),

            alternative_action=(
                recommendation_result[
                    "alternative_action"
                ]
            ),

            # ----------------------------------------------
            # ENVIRONMENTAL IMPACT
            # ----------------------------------------------

            estimated_co2_savings_kg=(
                environmental_result[
                    "estimated_co2_savings_kg"
                ]
            ),

            estimated_water_savings_liters=(
                environmental_result[
                    "estimated_water_savings_liters"
                ]
            ),

            estimated_landfill_diversion_kg=(
                environmental_result[
                    "estimated_landfill_diversion_kg"
                ]
            ),

            estimated_resource_recovery_kg=(
                environmental_result[
                    "estimated_resource_recovery_kg"
                ]
            ),

            environmental_benefit_score=(
                environmental_result[
                    "environmental_benefit_score"
                ]
            ),

            environmental_benefit=(
                environmental_result[
                    "environmental_benefit"
                ]
            ),
        )

    except Exception as error:

        if os.path.exists(filepath):

            os.remove(filepath)

        print(
            "Database Error:",
            error
        )

        raise HTTPException(
            status_code=500,
            detail=(
                f"Could not save textile: {error}"
            ),
        )
        
    # ======================================================
    # CREATE NOTIFICATIONS
    # ======================================================

    try:

        # --------------------------------------------------
        # AI ANALYSIS NOTIFICATION
        # --------------------------------------------------

        create_notification(

            db=db,

            user_id=current_user.id,

            title="AI Analysis Complete",

            message=(
                f"Your textile was identified as "
                f"{prediction} with "
                f"{confidence}% confidence."
            ),

            notification_type="info",
        )


        # --------------------------------------------------
        # RECYCLING RECOMMENDATION NOTIFICATION
        # --------------------------------------------------

        create_notification(

            db=db,

            user_id=current_user.id,

            title="Recycling Recommendation",

            message=(
                f"{recyclability} recyclability detected. "
                f"Recommended action: "
                f"{recommendation_result['primary_action']}."
            ),

            notification_type="recycling",
        )


        # --------------------------------------------------
        # SUSTAINABILITY NOTIFICATION
        # --------------------------------------------------

        sustainability_score = (
            sustainability_result[
                "sustainability_score"
            ]
        )

        if sustainability_score >= 70:

            create_notification(

                db=db,

                user_id=current_user.id,

                title="Strong Sustainability Potential",

                message=(
                    f"This textile achieved a sustainability "
                    f"score of {sustainability_score:.1f}/100 "
                    f"with {sustainability_result['recovery_category']}."
                ),

                notification_type="sustainability",
            )


        print(
            "\nNotifications created successfully."
        )


    except Exception as error:

        # Notification failure should NOT stop
        # the successful textile upload

        print(
            "Notification creation error:",
            error
        )    

    # ======================================================
    # RETURN COMPLETE RESULT
    # ======================================================

    return {

        "success": True,

        "message":
            "Upload and complete AI analysis successful",

    # ======================================================
    # COMPLETE TEXTILE DATA
    # ======================================================

        "textile": {

            "id": textile.id,

            "textile_name": textile.textile_name,

            "description": textile.description,

            "image_path": textile.image_path,

        # AI
            "prediction": textile.prediction,

            "confidence": textile.confidence,

            "category": textile.category,

            "recyclable": textile.recyclable,

            "recommendation": textile.recommendation,

            "top_predictions": top_predictions,

        # Sustainability
            "sustainability_score":
                textile.sustainability_score,

            "circularity_score":
                textile.circularity_score,

            "recovery_category":
                textile.recovery_category,

        # Recommendation Intelligence
            "primary_action":
                textile.primary_action,

            "alternative_action":
                textile.alternative_action,

        # Environmental Impact
            "estimated_co2_savings_kg":
                textile.estimated_co2_savings_kg,

            "estimated_water_savings_liters":
                textile.estimated_water_savings_liters,

            "estimated_landfill_diversion_kg":
                textile.estimated_landfill_diversion_kg,
            "estimated_resource_recovery_kg":
                textile.estimated_resource_recovery_kg,

            "environmental_benefit_score":
                textile.environmental_benefit_score,

            "environmental_benefit":
                textile.environmental_benefit,

            "uploaded_at":
                textile.uploaded_at,
        },

    # ======================================================
    # COMPLETE AI ANALYSIS FOR FRONTEND
    # ======================================================

        "ai_analysis": {

        # Basic AI Prediction
            "fabric": prediction,

            "confidence": confidence,

            "category": category,

            "recyclability": recyclability,

            "recommendation": recommendation,

            "top_predictions": top_predictions,

        # Sustainability Intelligence
            "sustainability_score":
                sustainability_result.get(
                    "sustainability_score"
                ),

            "circularity_score":
                sustainability_result.get(
                    "circularity_score"
                ),

            "recovery_category":
                sustainability_result.get(
                    "recovery_category"
                ),

        # Recommendation Intelligence
            "primary_action":
                recommendation_result.get(
                    "primary_action"
                ),

            "alternative_action":
                recommendation_result.get(
                    "alternative_action"
                ),

            "priority":
                recommendation_result.get(
                    "priority"
                ),

        # Environmental Impact
            "estimated_co2_savings_kg":
                environmental_result.get(
                    "estimated_co2_savings_kg"
                ),

            "estimated_water_savings_liters":
                environmental_result.get(
                    "estimated_water_savings_liters"
                ),

            "estimated_landfill_diversion_kg":
                environmental_result.get(
                    "estimated_landfill_diversion_kg"
                ),

            "estimated_resource_recovery_kg":
                environmental_result.get(
                    "estimated_resource_recovery_kg"
                ),

            "environmental_benefit_score":
                environmental_result.get(
                    "environmental_benefit_score"
                ),

            "environmental_benefit":
                environmental_result.get(
                    "environmental_benefit",
                    "Not available"
                ),
        },
}


# ==========================================================
# HISTORY
# ==========================================================

@router.get("/history")
def get_history(

    db: Session = Depends(get_db),

    current_user: User = Depends(
        get_current_user
    ),
):

    textiles = get_user_textiles(
        db=db,
        user_id=current_user.id,
    )

    return {

        "success": True,

        "count":
            len(textiles),

        "data":
            textiles,
    }


# ==========================================================
# CIRCULAR ECONOMY ANALYTICS
# ==========================================================

@router.get("/analytics")
def get_circular_economy_analytics(

    db: Session = Depends(get_db),

    current_user: User = Depends(
        get_current_user
    ),
):

    textiles = get_user_textiles(
        db=db,
        user_id=current_user.id,
    )

    analytics = (
        calculate_circular_economy_analytics(
            textiles
        )
    )

    return {

        "success": True,

        "data":
            analytics,
    }


# ==========================================================
# GET SINGLE TEXTILE
# ==========================================================

@router.get("/{textile_id}")
def get_textile(

    textile_id: int,

    db: Session = Depends(get_db),

    current_user: User = Depends(
        get_current_user
    ),
):

    textile = get_textile_by_id(

        db=db,

        textile_id=textile_id,

        user_id=current_user.id,
    )

    if textile is None:

        raise HTTPException(
            status_code=404,
            detail="Textile not found",
        )

    return {

        "success": True,

        "data":
            textile,
    }


# ==========================================================
# UPDATE TEXTILE
# ==========================================================

@router.put("/{textile_id}")
def update_textile_details(

    textile_id: int,

    data: TextileUpdate,

    db: Session = Depends(get_db),

    current_user: User = Depends(
        get_current_user
    ),
):

    textile = get_textile_by_id(

        db=db,

        textile_id=textile_id,

        user_id=current_user.id,
    )

    if textile is None:

        raise HTTPException(
            status_code=404,
            detail="Textile not found",
        )

    updated = update_textile(

        db=db,

        textile=textile,

        textile_name=data.textile_name,

        description=data.description,
    )

    return {

        "success": True,

        "message":
            "Textile updated successfully",

        "data":
            updated,
    }


# ==========================================================
# DELETE TEXTILE
# ==========================================================

@router.delete("/{textile_id}")
def delete_textile_route(

    textile_id: int,

    db: Session = Depends(get_db),

    current_user: User = Depends(
        get_current_user
    ),
):

    textile = get_textile_by_id(

        db=db,

        textile_id=textile_id,

        user_id=current_user.id,
    )

    if textile is None:

        raise HTTPException(
            status_code=404,
            detail="Textile not found",
        )

    # ======================================================
    # DELETE IMAGE
    # ======================================================

    if os.path.exists(
        textile.image_path
    ):

        os.remove(
            textile.image_path
        )

    # ======================================================
    # DELETE DATABASE RECORD
    # ======================================================

    delete_textile(
        db,
        textile,
    )

    return {

        "success": True,

        "message":
            "Textile deleted successfully",
    }