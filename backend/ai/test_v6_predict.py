import json
from pathlib import Path

import numpy as np
import tensorflow as tf

from tensorflow.keras.utils import load_img, img_to_array

from ai.config import (
    DATASET_PATH,
    IMAGE_SIZE,
    CLASSES,
)


MODEL_PATH = Path(
    "ai/models/textile_model_v6_best.keras"
)


IMAGE_EXTENSIONS = {
    ".jpg",
    ".jpeg",
    ".png",
    ".bmp",
    ".webp",
}


def find_one_image(class_name):

    class_dir = Path(
        DATASET_PATH
    ) / class_name

    for path in class_dir.rglob("*"):

        if (
            path.is_file()
            and path.suffix.lower()
            in IMAGE_EXTENSIONS
        ):
            return path

    return None


def predict_image(
    model,
    image_path,
):

    image = load_img(
        image_path,
        target_size=IMAGE_SIZE,
    )

    image_array = img_to_array(
        image
    )

    image_array = np.expand_dims(
        image_array,
        axis=0,
    )

    predictions = model.predict(
        image_array,
        verbose=0,
    )[0]

    top_indices = np.argsort(
        predictions
    )[-3:][::-1]

    results = []

    for index in top_indices:

        results.append(
            (
                CLASSES[int(index)],
                float(
                    predictions[index] * 100
                ),
            )
        )

    return results


print("\n" + "=" * 70)
print("TEXTILE AI — V6 SANITY TEST")
print("=" * 70)

print(
    f"\nLoading V6 best model..."
)

print(
    MODEL_PATH
)


if not MODEL_PATH.exists():

    raise FileNotFoundError(
        f"\nV6 model not found:\n"
        f"{MODEL_PATH}"
    )


model = tf.keras.models.load_model(
    MODEL_PATH
)

print(
    "\nV6 model loaded successfully!"
)


correct = 0
total = 0


print("\n" + "=" * 70)
print("TESTING ONE IMAGE FROM EACH CLASS")
print("=" * 70)


for actual_class in CLASSES:

    image_path = find_one_image(
        actual_class
    )

    if image_path is None:

        print(
            f"\nWARNING: No image found "
            f"for {actual_class}"
        )

        continue

    results = predict_image(
        model,
        image_path,
    )

    predicted_class = results[0][0]
    confidence = results[0][1]

    total += 1

    is_correct = (
        predicted_class == actual_class
    )

    if is_correct:
        correct += 1

    print("\n" + "-" * 70)

    print(
        f"Actual Class : {actual_class}"
    )

    print(
        f"Image        : "
        f"{image_path.name}"
    )

    print(
        f"Predicted    : "
        f"{predicted_class}"
    )

    print(
        f"Confidence   : "
        f"{confidence:.2f}%"
    )

    print(
        "\nTop 3 Predictions:"
    )

    for rank, (
        fabric,
        probability,
    ) in enumerate(
        results,
        start=1,
    ):

        print(
            f"{rank}. "
            f"{fabric:<15} "
            f"{probability:.2f}%"
        )

    print(
        "\nResult       : "
        + (
            "CORRECT"
            if is_correct
            else "INCORRECT"
        )
    )


print("\n" + "=" * 70)
print("V6 SANITY TEST RESULTS")
print("=" * 70)

print(
    f"\nImages tested : {total}"
)

print(
    f"Correct       : {correct}"
)

print(
    f"Incorrect     : "
    f"{total - correct}"
)

if total > 0:

    accuracy = (
        correct / total
    ) * 100

    print(
        f"Sample Accuracy : "
        f"{accuracy:.2f}%"
    )


print("\n" + "=" * 70)
print("V6 SANITY TEST COMPLETED")
print("=" * 70)