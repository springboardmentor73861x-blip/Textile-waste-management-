from fastapi import APIRouter, Depends, File, UploadFile, HTTPException, status
from app.core.dependencies import get_current_user
from app.utils.file_handler import FileHandler
from app.ai.inference import TextileInferenceEngine
from app.services.waste_analyzer import WasteAnalyzerService

router = APIRouter(
    prefix="/api/v1/analysis",
    tags=["Textile Image Analysis & Waste Classification"],
)


from app.utils.json_sanitizer import sanitize_for_json


@router.post("/classify")
async def classify_textile_waste(
    file: UploadFile = File(...),
    current_user=Depends(get_current_user),
):
    """
    Textile Image Analysis Engine & Material Classification Workflow Endpoint.
    Accepts an uploaded image file, predicts fabric category, assesses recyclability grade,
    and returns a comprehensive waste classification report.
    """
    if not file.content_type.startswith("image/"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="File must be an image (JPEG, PNG, WEBP).",
        )

    # Read image content
    image_bytes = await file.read()
    await file.seek(0)

    # Save image to storage
    saved_file_info = await FileHandler.save_image(file)

    # 1. Run AI Material Classification
    try:
        engine = TextileInferenceEngine.get_instance()
        ai_result = engine.predict_image_bytes(image_bytes)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Textile Image Analysis Engine error: {str(e)}",
        )

    # 2. Run Waste Categorization & Recyclability Assessment
    predicted_class = ai_result["predicted_class"]
    confidence = ai_result["confidence"]
    recyclability_assessment = WasteAnalyzerService.analyze_recyclability(predicted_class, confidence)

    response = {
        "status": "success",
        "message": "Textile image analysis & waste classification completed successfully.",
        "filename": saved_file_info["filename"],
        "image_url": f"/storage/uploads/{saved_file_info['filename']}",
        "material_classification": ai_result,
        "recyclability_assessment": recyclability_assessment,
    }
    return sanitize_for_json(response)


@router.get("/categories")
async def get_active_categories(
    current_user=Depends(get_current_user),
):
    """
    Returns active fabric macro-categories and their baseline recyclability parameters.
    """
    return {
        "status": "success",
        "active_categories": list(WasteAnalyzerService.WASTE_STREAM_KNOWLEDGE.keys()),
        "knowledge_base": WasteAnalyzerService.WASTE_STREAM_KNOWLEDGE,
    }
