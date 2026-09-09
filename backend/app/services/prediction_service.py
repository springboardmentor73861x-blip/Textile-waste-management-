import os
from PIL import Image

from app.services.waste_classification import get_waste_info
from app.services.sustainability import calculate_score

# Import the real model implementation
from model.model_utils import predict_image, is_model_loaded

class PredictionService:
    def __init__(self):
        # Model is loaded automatically by model_utils, no need for init logic here.
        pass

    def load_model(self):
        # No longer needed, model is loaded in model.model_utils
        pass

    def predict(self, image_path: str):
        if not os.path.exists(image_path):
            return {
                "product_type": "Error",
                "confidence": 0.0,
                "waste_category": "Unknown",
                "recyclability": "Unknown",
                "recommendation": "File not found",
                "sustainability_score": 0
            }

        try:
            # Open image
            image = Image.open(image_path).convert('RGB')
            
            # Predict using PyTorch model loaded via model_utils
            result = predict_image(image)
            
            # Extract relevant fields
            predicted_product_type = result["fabric_type"].title()
            predicted_confidence = round(result["confidence_percentage"], 2)
            
        except Exception as e:
            print(f"Prediction error: {e}")
            predicted_product_type = "Error"
            predicted_confidence = 0.0

        waste_info = get_waste_info(predicted_product_type)
        sustainability_score = calculate_score(predicted_product_type)
        
        return {
            "product_type": predicted_product_type,
            "confidence": predicted_confidence,
            "waste_category": waste_info.get("waste_category", "Unknown"),
            "recyclability": waste_info.get("recyclability", "Unknown"),
            "recommendation": waste_info.get("recommendation", "None"),
            "sustainability_score": sustainability_score
        }

prediction_service = PredictionService()
