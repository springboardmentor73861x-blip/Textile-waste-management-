import os
# pyrefly: ignore [missing-import]
import torch

MODEL = None


def load_model():

    global MODEL

    if MODEL is not None:
        return MODEL

    model_path = "app/ai_trainer/models/model.pth"

    if not os.path.exists(model_path):
        print("⚠️ Model file not found.")
        return None

    MODEL = torch.load(
        model_path,
        map_location="cpu",
    )

    MODEL.eval()

    print("✅ AI Model Loaded Successfully")

    return MODEL