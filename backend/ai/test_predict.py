from pathlib import Path

import numpy as np
import tensorflow as tf

from tensorflow.keras.utils import (
    load_img,
    img_to_array,
)


# ==========================================================
# PATHS
# ==========================================================

PROJECT_ROOT = (
    Path(__file__).resolve().parents[2]
)

DATASET_PATH = (
    PROJECT_ROOT / "datasets"
)

MODEL_PATH = (
    PROJECT_ROOT
    / "backend"
    / "ai"
    / "models"
    / "textile_model_v4_best.keras"
)


# ==========================================================
# MODEL CONFIGURATION
# ==========================================================

IMAGE_SIZE = (224, 224)

CLASSES = [
    "Corduroy",
    "Cotton",
    "Denim",
    "Fleece",
    "Leather",
    "Linen",
    "Nylon",
    "Polyester",
    "Silk",
    "Velvet",
]


IMAGE_EXTENSIONS = {
    ".jpg",
    ".jpeg",
    ".png",
    ".bmp",
    ".webp",
}


# ==========================================================
# LOAD V4 MODEL
# ==========================================================

print("\n" + "=" * 70)

print(
    "TEXTILE AI — V4 SANITY TEST"
)

print("=" * 70)

print(
    "\nLoading V4 best model..."
)

print(
    MODEL_PATH
)

if not MODEL_PATH.exists():

    raise FileNotFoundError(
        f"\nModel not found:\n{MODEL_PATH}\n\n"
        "Make sure you renamed the V4 model correctly."
    )


model = tf.keras.models.load_model(
    MODEL_PATH
)

print(
    "\nV4 model loaded successfully!"
)


# ==========================================================
# FIND ONE IMAGE PER CLASS
# ==========================================================

print("\n" + "=" * 70)

print(
    "FINDING DATASET TEST IMAGES"
)

print("=" * 70)


test_images = {}


for class_name in CLASSES:

    class_path = (
        DATASET_PATH / class_name
    )

    if not class_path.exists():

        print(
            f"\nWARNING: "
            f"{class_name} folder not found."
        )

        continue


    images = sorted(
        [
            file
            for file in class_path.rglob("*")
            if (
                file.is_file()
                and file.suffix.lower()
                in IMAGE_EXTENSIONS
            )
        ]
    )


    if len(images) == 0:

        print(
            f"\nWARNING: "
            f"No images found for "
            f"{class_name}"
        )

        continue


    test_images[
        class_name
    ] = images[0]


    print(
        f"{class_name:<15} -> "
        f"{images[0]}"
    )


# ==========================================================
# PREDICTION FUNCTION
# ==========================================================

def predict_image(image_path):

    image = load_img(
        image_path,
        target_size=IMAGE_SIZE,
    )


    image_array = img_to_array(
        image
    )


    # IMPORTANT
    #
    # Do NOT apply preprocess_input here.
    #
    # The model already performs:
    #
    # mobilenet_v2.preprocess_input()
    #
    # internally.

    image_array = np.expand_dims(
        image_array,
        axis=0,
    )


    predictions = model.predict(
        image_array,
        verbose=0,
    )[0]


    # ======================================================
    # Top 3
    # ======================================================

    top_indices = np.argsort(
        predictions
    )[-3:][::-1]


    top_predictions = []


    for index in top_indices:

        top_predictions.append(
            (
                CLASSES[index],
                float(
                    predictions[index] * 100
                ),
            )
        )


    # ======================================================
    # Primary Prediction
    # ======================================================

    predicted_index = int(
        np.argmax(predictions)
    )


    predicted_class = (
        CLASSES[predicted_index]
    )


    confidence = float(
        predictions[
            predicted_index
        ] * 100
    )


    return (
        predicted_class,
        confidence,
        top_predictions,
    )


# ==========================================================
# TEST DATASET IMAGES
# ==========================================================

print("\n" + "=" * 70)

print(
    "TESTING ONE IMAGE FROM EACH CLASS"
)

print("=" * 70)


results = []

correct = 0
total = 0


for actual_class in CLASSES:

    if actual_class not in test_images:
        continue


    image_path = (
        test_images[actual_class]
    )


    (
        predicted_class,
        confidence,
        top_predictions,
    ) = predict_image(
        image_path
    )


    is_correct = (
        actual_class
        == predicted_class
    )


    if is_correct:
        correct += 1


    total += 1


    results.append(
        {
            "actual": actual_class,
            "predicted": predicted_class,
            "confidence": confidence,
            "correct": is_correct,
        }
    )


    print(
        "\n" + "-" * 70
    )


    print(
        f"Actual Class : "
        f"{actual_class}"
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
        top_predictions,
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


# ==========================================================
# FINAL DATASET SUMMARY
# ==========================================================

print(
    "\n\n" + "=" * 70
)

print(
    "V4 DATASET SANITY TEST RESULTS"
)

print("=" * 70)


print(
    f"\nImages tested : "
    f"{total}"
)


print(
    f"Correct       : "
    f"{correct}"
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


# ==========================================================
# SUMMARY TABLE
# ==========================================================

print(
    "\n" + "=" * 70
)

print(
    "SUMMARY"
)

print("=" * 70)


print(
    f"{'Actual':<15}"
    f"{'Predicted':<15}"
    f"{'Confidence':<15}"
    f"Result"
)


print(
    "-" * 70
)


for result in results:

    print(
        f"{result['actual']:<15}"
        f"{result['predicted']:<15}"
        f"{result['confidence']:<14.2f}%"
        f"{'CORRECT' if result['correct'] else 'INCORRECT'}"
    )


print(
    "\n" + "=" * 70
)

print(
    "V4 SANITY TEST COMPLETED"
)

print("=" * 70)