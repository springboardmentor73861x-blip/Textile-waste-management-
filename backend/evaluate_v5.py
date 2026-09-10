import json
import numpy as np
import tensorflow as tf

from sklearn.metrics import (
    classification_report,
    confusion_matrix,
)

from ai.config import LABELS_PATH
from ai.dataset import load_dataset


MODEL_PATH = (
    "ai/models/textile_model_v5_best.keras"
)


print("\n" + "=" * 70)
print("TEXTILE AI V5 — FINAL BASELINE COMPARISON")
print("=" * 70)

print(
    f"\nLoading model:\n{MODEL_PATH}"
)

model = tf.keras.models.load_model(
    MODEL_PATH
)

_, val_ds, class_names = load_dataset()

print(
    f"\nValidation samples: "
    f"{sum(1 for _ in val_ds.unbatch())}"
)

y_true = []
y_pred = []

print(
    "\nGenerating predictions..."
)

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

y_true = np.array(y_true)
y_pred = np.array(y_pred)


accuracy = np.mean(
    y_true == y_pred
)

correct = np.sum(
    y_true == y_pred
)

wrong = np.sum(
    y_true != y_pred
)


print("\n" + "=" * 70)
print("V5 RESULTS")
print("=" * 70)

print(
    f"\nValidation samples : {len(y_true)}"
)

print(
    f"Correct predictions: {correct}"
)

print(
    f"Wrong predictions  : {wrong}"
)

print(
    f"\nV5 ACCURACY: "
    f"{accuracy * 100:.2f}%"
)


print("\n" + "=" * 70)
print("CLASSIFICATION REPORT")
print("=" * 70)

print(
    classification_report(
        y_true,
        y_pred,
        target_names=class_names,
        digits=4,
        zero_division=0,
    )
)


cm = confusion_matrix(
    y_true,
    y_pred,
)

print("\n" + "=" * 70)
print("CONFUSION MATRIX")
print("=" * 70)

print(cm)


print("\n" + "=" * 70)
print("PER-CLASS ACCURACY")
print("=" * 70)

for index, class_name in enumerate(
    class_names
):

    mask = (
        y_true == index
    )

    total = np.sum(
        mask
    )

    correct_class = np.sum(
        y_pred[mask] == index
    )

    accuracy_class = (
        correct_class / total * 100
        if total > 0
        else 0
    )

    print(
        f"{class_name:<15} "
        f"{correct_class:>4}/{total:<4} "
        f"{accuracy_class:>7.2f}%"
    )


print("\n" + "=" * 70)
print("V5 EVALUATION COMPLETE")
print("=" * 70)