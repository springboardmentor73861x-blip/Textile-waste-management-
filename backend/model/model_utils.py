import os
import torch
import torch.nn as nn
from torchvision import models, transforms
from PIL import Image
import json
import torch.nn.functional as F

DEVICE = torch.device("cuda" if torch.cuda.is_available() else "cpu")

base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
MODEL_PATH = os.path.join(base_dir, "ml", "models", "product_classifier.pth")
CLASS_MAPPING_PATH = os.path.join(base_dir, "model", "class_mapping.json")

model = None
class_names = []

def is_model_loaded():
    return model is not None and len(class_names) > 0

if os.path.exists(MODEL_PATH) and os.path.exists(CLASS_MAPPING_PATH):
    # Load class mapping
    with open(CLASS_MAPPING_PATH, "r") as f:
        class_dict = json.load(f)
    
    # Ensure ordered list
    class_names = [class_dict[str(i)] for i in range(len(class_dict))]
    num_classes = len(class_names)
    
    # Initialize model
    model = models.efficientnet_b0(weights=None)
    in_features = model.classifier[1].in_features
    model.classifier[1] = nn.Linear(in_features, num_classes)
    
    # Load weights
    model.load_state_dict(torch.load(MODEL_PATH, map_location=DEVICE))
    model = model.to(DEVICE)
    model.eval()
else:
    print(f"WARNING: Model or mapping not found. Checked {MODEL_PATH} and {CLASS_MAPPING_PATH}.")

# Preprocessing
transform = transforms.Compose([
    transforms.Resize((224, 224)),
    transforms.ToTensor(),
    transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225])
])

def predict_image(image: Image.Image):
    if model is None or not class_names:
        return {
            "fabric_type": "Model not loaded",
            "confidence": 0.0,
            "confidence_percentage": 0.0
        }



    # Convert to RGB
    image = image.convert("RGB")

    # Apply preprocessing
    image_tensor = transform(image)

    # Add batch dimension
    image_tensor = image_tensor.unsqueeze(0)

    # Move to CPU/GPU
    image_tensor = image_tensor.to(DEVICE)

    # Prediction
    with torch.no_grad():
        outputs = model(image_tensor)
        probabilities = F.softmax(outputs, dim=1)[0]
        confidence, predicted_idx = torch.max(probabilities, dim=0)

    confidence_val = confidence.item()
    
    # Inverse transform
    predicted_class = class_names[predicted_idx.item()]

    return {
        "fabric_type": predicted_class,
        "confidence": confidence_val,
        "confidence_percentage": confidence_val * 100
    }
