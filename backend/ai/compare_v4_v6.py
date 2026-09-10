import sys
from pathlib import Path

import numpy as np
import tensorflow as tf
from tensorflow.keras.utils import load_img, img_to_array

from ai.config import IMAGE_SIZE, CLASSES


V4_PATH = Path(
    "ai/models/textile_model_v4_best.keras"
)

V6_PATH = Path(
    "ai/models/textile_model_v6_best.keras"
)


def predict(model, image_path):

    image = load_img(
        image_path,
        target_size=IMAGE_SIZE,
    )

    image_array = img_to_array(image)

    image_array = np.expand_dims(
        image_array,
        axis=0,
    )

    predictions = model.predict(
        image_array,
        verbose=0,
    )[0]

    indices = np.argsort(
        predictions
    )[-5:][::-1]

    return [
        (
            CLASSES[int(i)],
            float(predictions[i] * 100),
        )
        for i in indices
    ]


if len(sys.argv) < 2:
    print(
        'Usage: python -m ai.compare_v4_v6 "image_path"'
    )
    sys.exit(1)


image_path = Path(sys.argv[1])

if not image_path.exists():
    raise FileNotFoundError(
        f"Image not found:\n{image_path}"
    )


print("\n" + "=" * 70)
print("V4 vs V6 — SAME IMAGE COMPARISON")
print("=" * 70)

print(f"\nImage:\n{image_path}")


print("\nLoading V4...")
v4 = tf.keras.models.load_model(V4_PATH)

print("Loading V6...")
v6 = tf.keras.models.load_model(V6_PATH)


v4_results = predict(v4, image_path)
v6_results = predict(v6, image_path)


print("\n" + "=" * 70)
print("V4 RESULTS")
print("=" * 70)

for rank, (fabric, confidence) in enumerate(
    v4_results,
    1,
):
    print(
        f"{rank}. {fabric:<15} "
        f"{confidence:.2f}%"
    )


print("\n" + "=" * 70)
print("V6 RESULTS")
print("=" * 70)

for rank, (fabric, confidence) in enumerate(
    v6_results,
    1,
):
    print(
        f"{rank}. {fabric:<15} "
        f"{confidence:.2f}%"
    )


print("\n" + "=" * 70)
print("COMPARISON COMPLETE")
print("=" * 70)