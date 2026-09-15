import os
from io import BytesIO
from pathlib import Path

import cv2
import numpy as np
from PIL import Image


# ============================================================
# FINAL MODEL IMAGE CONFIGURATION
# ============================================================

IMAGE_SIZE = (300, 300)

VALID_EXTENSIONS = (
    ".jpg",
    ".jpeg",
    ".png",
)


class ImageProcessor:

    @staticmethod
    def preprocess_image(image_path: str):
        """
        FINAL ML preprocessing:

        Image
          ↓
        RGB
          ↓
        Resize 300 x 300
          ↓
        float32
          ↓
        RAW 0-255 values
          ↓
        Model

        IMPORTANT:
        No /255 normalization is performed here because
        the trained EfficientNetB1 model already contains
        its own preprocessing layers.
        """

        if not os.path.exists(image_path):
            raise FileNotFoundError(
                f"Image not found: {image_path}"
            )

        extension = Path(image_path).suffix.lower()

        if extension not in VALID_EXTENSIONS:
            raise ValueError(
                f"Unsupported image format: {extension}"
            )

        # ----------------------------------------------------
        # Read image
        # ----------------------------------------------------

        try:
            with Image.open(image_path) as image:
                image.verify()

            with Image.open(image_path) as image:
                image = image.convert("RGB")

                # FINAL pipeline uses 300x300
                image = image.resize(
                    IMAGE_SIZE,
                    Image.Resampling.LANCZOS
                )

                image = np.asarray(
                    image,
                    dtype=np.float32
                )

        except Exception as exc:
            raise ValueError(
                f"Unable to process image: {exc}"
            ) from exc

        # ----------------------------------------------------
        # Validate shape
        # ----------------------------------------------------

        expected_shape = (
            IMAGE_SIZE[1],
            IMAGE_SIZE[0],
            3
        )

        if image.shape != expected_shape:
            raise ValueError(
                f"Unexpected image shape: {image.shape}. "
                f"Expected: {expected_shape}"
            )

        # ----------------------------------------------------
        # DO NOT NORMALIZE
        #
        # Keep values in RAW 0-255 range.
        # EfficientNetB1 model handles preprocessing internally.
        # ----------------------------------------------------

        image = np.expand_dims(
            image,
            axis=0
        )

        return image