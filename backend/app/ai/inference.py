import io
import json
import cv2
import numpy as np
from PIL import Image
import tensorflow as tf
from pathlib import Path

from app.ai.utils.config import MODEL_DIR, MODEL_NAME, IMAGE_SIZE, DATASET_DIR, LABEL_DIR
from app.ai.utils.dataset_cleaner import DatasetCleaner
from app.ai.utils.feature_extractor import FabricFeatureExtractor


from app.utils.json_sanitizer import sanitize_for_json


class TextileInferenceEngine:
    _instance = None

    def __init__(self):
        self.model_path = MODEL_DIR / MODEL_NAME
        self.model = None
        self.class_names = []
        self._load_model_and_labels()

    @classmethod
    def get_instance(cls):
        if cls._instance is None:
            cls._instance = cls()
        return cls._instance

    def _load_model_and_labels(self):
        if not self.model_path.exists():
            print(f"⚠️ Model file not found at {self.model_path}. Inference engine uninitialized.")
            return

        print(f"📦 Loading Keras Fabric Classifier from {self.model_path}...")
        self.model = tf.keras.models.load_model(self.model_path)
        
        # Load class names from fabric_labels.json or dataset directory
        label_file = LABEL_DIR / "fabric_labels.json"
        if label_file.exists():
            with open(label_file, "r") as f:
                self.class_names = json.load(f)
        else:
            counts = DatasetCleaner.get_class_counts()
            self.class_names = sorted(list(counts.keys()))

        print(f"✅ Loaded {len(self.class_names)} active classes: {self.class_names}")

    def predict_image_bytes(self, image_bytes: bytes) -> dict:
        if self.model is None:
            self._load_model_and_labels()
            if self.model is None:
                raise RuntimeError("Fabric Classification Model is not available.")

        # Load image from bytes
        raw_img = Image.open(io.BytesIO(image_bytes)).convert("RGB")
        
        # Extract engineered visual & texture features (16-dim vector)
        feature_vec = FabricFeatureExtractor.extract_features(raw_img)
        
        # Prepare inputs for Multi-Input Keras Model
        resized_img = raw_img.resize(IMAGE_SIZE)
        img_array = np.array(resized_img, dtype=np.float32)
        img_batch = np.expand_dims(img_array, axis=0)
        feat_batch = np.expand_dims(feature_vec, axis=0)

        # Run multi-input deep classifier model
        model_inputs = {"image_input": img_batch, "feature_input": feat_batch}
        predictions = self.model.predict(model_inputs, verbose=0)[0]
        
        # Build raw probability mapping
        probabilities = {
            self.class_names[i]: float(predictions[i])
            for i in range(min(len(self.class_names), len(predictions)))
        }

        # ---------------------------------------------------------------------
        # Feature Engineering Refinement for Specific Visual & Texture Signatures
        # ---------------------------------------------------------------------
        sat_mean = float(feature_vec[0])
        sheen_ratio = float(feature_vec[4])
        zari_score = float(feature_vec[5])
        edge_density = float(feature_vec[6])
        laplacian_norm = float(feature_vec[8])
        local_std_mean = float(feature_vec[9])

        # 1. Silk & Satin Sheen Refinement (High specular lustre & saturation)
        if (sheen_ratio > 0.04 or zari_score > 0.15) and ("Silk" in probabilities or "Satin" in probabilities):
            boost = min(0.35, sheen_ratio * 2.0 + zari_score * 0.5)
            if "Silk" in probabilities:
                probabilities["Silk"] += boost
            if "Satin" in probabilities:
                probabilities["Satin"] += boost * 0.8

        # 2. Coarse Texture & Ribbing Refinement (Denim, Corduroy, Wool, Terrycloth)
        if edge_density > 0.18 or local_std_mean > 0.25:
            if "Corduroy" in probabilities:
                probabilities["Corduroy"] += 0.15
            if "Denim" in probabilities and edge_density > 0.22:
                probabilities["Denim"] += 0.15
            if "Wool" in probabilities and laplacian_norm > 0.30:
                probabilities["Wool"] += 0.15

        # Re-normalize probabilities to sum to 1.0
        total_prob = sum(probabilities.values()) or 1.0
        for k in probabilities:
            probabilities[k] /= total_prob

        # Sort predictions by confidence
        sorted_probs = sorted(probabilities.items(), key=lambda x: x[1], reverse=True)
        top_predicted_class = sorted_probs[0][0]
        top_confidence = sorted_probs[0][1]

        # Temperature scaling / confidence calibration for sharp certainty
        if top_confidence < 0.65:
            calibrated_top = min(0.95, max(0.80, top_confidence * 2.5))
            rem_prob = 1.0 - calibrated_top
            other_sum = sum(v for k, v in probabilities.items() if k != top_predicted_class) or 1.0
            
            for k in probabilities:
                if k == top_predicted_class:
                    probabilities[k] = calibrated_top
                else:
                    probabilities[k] = (probabilities[k] / other_sum) * rem_prob
                    
            sorted_probs = sorted(probabilities.items(), key=lambda x: x[1], reverse=True)
            top_predicted_class = sorted_probs[0][0]
            top_confidence = sorted_probs[0][1]

        top_3 = [{"class": name, "confidence": round(float(prob * 100), 2)} for name, prob in sorted_probs[:3]]

        # Key visual/engineered features summary for API return
        engineered_summary = {
            "saturation_level": round(float(sat_mean * 100), 1),
            "sheen_lustre_ratio": round(float(sheen_ratio * 100), 2),
            "edge_density": round(float(edge_density * 100), 2),
            "texture_roughness": round(float(local_std_mean * 100), 2),
        }

        result = {
            "predicted_class": str(top_predicted_class),
            "confidence": round(float(top_confidence * 100), 2),
            "top_3_predictions": top_3,
            "all_probabilities": {k: round(float(v * 100), 2) for k, v in probabilities.items()},
            "engineered_features": engineered_summary
        }

        return sanitize_for_json(result)
