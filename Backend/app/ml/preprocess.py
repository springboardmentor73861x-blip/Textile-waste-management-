import numpy as np
from pathlib import Path
from typing import Union

from PIL import Image, ImageFile


# ============================================================
# FINAL ML PREPROCESSING CONFIGURATION
# ============================================================

IMAGE_SIZE = (300, 300)
NUM_CHANNELS = 3

VALID_EXTENSIONS = (
    ".jpg",
    ".jpeg",
    ".png",
)

ImageFile.LOAD_TRUNCATED_IMAGES = False


# ============================================================
# CUSTOM IMAGE ERROR
# ============================================================

class InvalidImageError(ValueError):
    pass


# ============================================================
# PREPROCESSED IMAGE RESULT
# ============================================================

class PreprocessedImage:
    def __init__(self, array: np.ndarray):
        self.array = array


# ============================================================
# IMAGE PREPROCESSING
# ============================================================

def preprocess_image(
    image_input: Union[str, Path, bytes],
    filename: str | None = None
) -> PreprocessedImage:

    try:

        # ----------------------------------------------------
        # OPEN IMAGE
        # ----------------------------------------------------

        if isinstance(image_input, (str, Path)):

            image_path = Path(image_input)

            if not image_path.exists():
                raise InvalidImageError(
                    f"Image not found: {image_path}"
                )

            if image_path.suffix.lower() not in VALID_EXTENSIONS:
                raise InvalidImageError(
                    f"Unsupported image format: {image_path.suffix}"
                )

            with Image.open(image_path) as image:
                image.verify()

            with Image.open(image_path) as image:
                image = image.convert("RGB")

                # Resize exactly as FINAL pipeline
                image = image.resize(
                    IMAGE_SIZE,
                    Image.Resampling.LANCZOS
                )

                array = np.asarray(
                    image,
                    dtype=np.float32
                )

        # ----------------------------------------------------
        # IMAGE BYTES
        # ----------------------------------------------------

        elif isinstance(image_input, bytes):

            if filename:
                extension = Path(filename).suffix.lower()

                if extension not in VALID_EXTENSIONS:
                    raise InvalidImageError(
                        f"Unsupported image format: {extension}"
                    )

            from io import BytesIO

            with Image.open(BytesIO(image_input)) as image:
                image.verify()

            with Image.open(BytesIO(image_input)) as image:
                image = image.convert("RGB")

                image = image.resize(
                    IMAGE_SIZE,
                    Image.Resampling.LANCZOS
                )

                array = np.asarray(
                    image,
                    dtype=np.float32
                )

        else:

            raise InvalidImageError(
                "Image input must be a file path or bytes."
            )

        # ----------------------------------------------------
        # VALIDATE ARRAY
        # ----------------------------------------------------

        if array.shape != (
            IMAGE_SIZE[1],
            IMAGE_SIZE[0],
            NUM_CHANNELS
        ):
            raise InvalidImageError(
                f"Unexpected image shape: {array.shape}"
            )

        # ----------------------------------------------------
        # IMPORTANT:
        # DO NOT NORMALIZE HERE
        #
        # FINAL EfficientNetB1 model already contains
        # preprocessing layers.
        #
        # Input remains FLOAT32 in RAW 0-255 RANGE.
        # ----------------------------------------------------

        array = np.expand_dims(
            array,
            axis=0
        )

        return PreprocessedImage(array)

    except InvalidImageError:
        raise

    except Exception as exc:
        raise InvalidImageError(
            f"Unable to preprocess image: {exc}"
        ) from exc


# ============================================================
# LEGACY DATASET COMPATIBILITY
# ============================================================

def prepare_dataset(
    dataset,
    batch_size=32,
    training=True
):
    """
    Kept for compatibility with the existing project.

    Runtime prediction does NOT use this function.
    """

    import tensorflow as tf

    AUTOTUNE = tf.data.AUTOTUNE

    dataset = dataset.batch(
        batch_size
    )

    dataset = dataset.prefetch(
        AUTOTUNE
    )

    return dataset