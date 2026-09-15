import os
import cv2
import numpy as np


IMAGE_SIZE = (224, 224)


class ImageProcessor:

    @staticmethod
    def preprocess_image(image_path: str):

        # Check file exists
        if not os.path.exists(image_path):
            raise FileNotFoundError(f"Image not found: {image_path}")

        # Read image
        image = cv2.imread(image_path)

        if image is None:
            raise ValueError("Unable to read image.")

        # Convert BGR → RGB
        image = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)

        # Resize for EfficientNetB0
        image = cv2.resize(image, IMAGE_SIZE)

        # Normalize
        image = image.astype("float32") / 255.0

        # Batch Dimension
        image = np.expand_dims(image, axis=0)

        return image