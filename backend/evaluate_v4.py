import json
import numpy as np
import tensorflow as tf

from sklearn.metrics import classification_report, confusion_matrix

from ai.config import LABELS_PATH
from ai.dataset import load_dataset
from ai.predict import model


print("\n" + "=" * 70)
print("TEXTILE AI V4 — BASELINE EVALUATION")
print("=" * 70)

# ----------------------------------------------------------
# Load dataset
# ----------------------------------------------------------

print("\nLoading validation dataset...")

_, val_ds, class_names = load_dataset()

print(f"\nClasses: {class_names}")
print(f"Validation batches: {len(val_ds)}")


# ----------------------------------------------------------
# Generate predictions
# ----------------------------------------------------------

print("\nGenerating predictions...")

y_true = []
y_pred = []
y_prob = []

for images, labels in val_ds:

    predictions = model.predict(
        images,
        verbose=0,
    )

    predicted_classes = np.argmax(
        predictions,
        axis=1,
    )

    y_true.extend(
        labels.numpy()
    )

    y_pred.extend(
        predicted_classes
    )

    y_prob.extend(
        predictions
    )


y_true = np.array(y_true)
y_pred = np.array(y_pred)
y_prob = np.array(y_prob)


# ----------------------------------------------------------
# Overall accuracy
# ----------------------------------------------------------

accuracy = np.mean(
    y_true == y_pred
)

print("\n" + "=" * 70)
print("OVERALL RESULTS")
print("=" * 70)

print(
    f"\nValidation samples : {len(y_true)}"
)

print(
    f"Correct predictions: "
    f"{np.sum(y_true == y_pred)}"
)

print(
    f"Wrong predictions  : "
    f"{np.sum(y_true != y_pred)}"
)

print(
    f"\nVALIDATION ACCURACY: "
    f"{accuracy * 100:.2f}%"
)


# ----------------------------------------------------------
# Classification report
# ----------------------------------------------------------

print("\n" + "=" * 70)
print("CLASSIFICATION REPORT")
print("=" * 70)

report = classification_report(
    y_true,
    y_pred,
    target_names=class_names,
    digits=4,
    zero_division=0,
)

print(report)


# ----------------------------------------------------------
# Confusion matrix
# ----------------------------------------------------------

cm = confusion_matrix(
    y_true,
    y_pred,
)

print("\n" + "=" * 70)
print("CONFUSION MATRIX")
print("=" * 70)

print(
    "\nRows    = Actual class"
)

print(
    "Columns = Predicted class\n"
)

print(cm)


# ----------------------------------------------------------
# Per-class accuracy
# ----------------------------------------------------------

print("\n" + "=" * 70)
print("PER-CLASS ACCURACY")
print("=" * 70)

for index, class_name in enumerate(class_names):

    class_mask = (
        y_true == index
    )

    total = np.sum(
        class_mask
    )

    correct = np.sum(
        y_pred[class_mask] == index
    )

    if total > 0:

        class_accuracy = (
            correct / total
        ) * 100

    else:

        class_accuracy = 0.0

    print(
        f"{class_name:<15} "
        f"{correct:>4}/{total:<4} "
        f"{class_accuracy:>7.2f}%"
    )


# ----------------------------------------------------------
# Most confused pairs
# ----------------------------------------------------------

print("\n" + "=" * 70)
print("TOP CONFUSIONS")
print("=" * 70)

confusions = []

for actual in range(
    len(class_names)
):

    for predicted in range(
        len(class_names)
    ):

        if actual == predicted:
            continue

        count = cm[
            actual,
            predicted
        ]

        if count > 0:

            confusions.append(
                (
                    count,
                    class_names[actual],
                    class_names[predicted],
                )
            )


confusions.sort(
    reverse=True
)


for count, actual, predicted in confusions[:15]:

    print(
        f"{actual:<15} -> "
        f"{predicted:<15} : "
        f"{count}"
    )


print("\n" + "=" * 70)
print("BASELINE EVALUATION COMPLETE")
print("=" * 70)