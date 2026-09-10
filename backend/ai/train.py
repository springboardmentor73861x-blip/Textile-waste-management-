import os
import numpy as np
import matplotlib.pyplot as plt
import tensorflow as tf

from sklearn.metrics import (
    classification_report,
    confusion_matrix,
)

from tensorflow.keras.callbacks import (
    EarlyStopping,
    ModelCheckpoint,
    ReduceLROnPlateau,
)

from ai.dataset import load_dataset
from ai.model import build_model

from ai.config import (
    MODELS_DIR,
    GRAPHS_DIR,
)


# ==========================================================
# Configuration
# ==========================================================

HEAD_EPOCHS = 15
FINE_TUNE_EPOCHS = 20

HEAD_LEARNING_RATE = 1e-4
FINE_TUNE_LEARNING_RATE = 1e-5

MODEL_V5_PATH = os.path.join(
    MODELS_DIR,
    "textile_model_v5.keras",
)

BEST_MODEL_V5_PATH = os.path.join(
    MODELS_DIR,
    "textile_model_v5_best.keras",
)

ACCURACY_GRAPH = os.path.join(
    GRAPHS_DIR,
    "accuracy_v5.png",
)

LOSS_GRAPH = os.path.join(
    GRAPHS_DIR,
    "loss_v5.png",
)

CONFUSION_GRAPH = os.path.join(
    GRAPHS_DIR,
    "confusion_matrix_v5.png",
)


# ==========================================================
# Folders
# ==========================================================

os.makedirs(
    MODELS_DIR,
    exist_ok=True,
)

os.makedirs(
    GRAPHS_DIR,
    exist_ok=True,
)


# ==========================================================
# Header
# ==========================================================

print("\n" + "=" * 70)
print("TEXTILE AI MODEL V5")
print("=" * 70)

print("\nIMPORTANT:")
print("V4 model will NOT be modified.")
print("V5 will be trained as a separate model.")


# ==========================================================
# Load Dataset
# ==========================================================

print("\n" + "=" * 70)
print("LOADING DATASET")
print("=" * 70)

train_ds, val_ds, class_names = load_dataset()

print("\nClasses:")

for index, name in enumerate(class_names):

    print(
        f"{index}: {name}"
    )


# ==========================================================
# Calculate Class Counts
# ==========================================================

print("\n" + "=" * 70)
print("CALCULATING CLASS WEIGHTS")
print("=" * 70)

class_counts = np.zeros(
    len(class_names),
    dtype=np.int64,
)

for _, labels in train_ds:

    labels_numpy = labels.numpy()

    for label in labels_numpy:

        class_counts[
            int(label)
        ] += 1


print("\nTraining samples per class:")

for index, name in enumerate(class_names):

    print(
        f"{name:<15} : "
        f"{class_counts[index]}"
    )


# ==========================================================
# Balanced Class Weights
# ==========================================================

# Standard balanced weighting:
#
# total_samples
# ----------------------------
# number_of_classes * class_count
#
# We cap extreme weights to avoid
# unstable training for classes with
# very few examples.

total_training_samples = np.sum(
    class_counts
)

num_classes = len(
    class_names
)

class_weights = {}

for index, count in enumerate(
    class_counts
):

    if count > 0:

        weight = (
            total_training_samples
            / (
                num_classes
                * count
            )
        )

        # Prevent tiny classes from
        # receiving excessively large
        # weights.

        weight = min(
            weight,
            4.0,
        )

        class_weights[index] = float(
            weight
        )

    else:

        class_weights[index] = 1.0


print("\nClass weights:")

for index, name in enumerate(class_names):

    print(
        f"{name:<15} : "
        f"{class_weights[index]:.4f}"
    )


# ==========================================================
# Build V5 Model
# ==========================================================

print("\n" + "=" * 70)
print("BUILDING V5 MODEL")
print("=" * 70)

model = build_model(
    num_classes=num_classes,
    learning_rate=HEAD_LEARNING_RATE,
    fine_tune=False,
)

model.summary()


# ==========================================================
# Callbacks
# ==========================================================

callbacks = [

    ModelCheckpoint(
        filepath=BEST_MODEL_V5_PATH,
        monitor="val_accuracy",
        mode="max",
        save_best_only=True,
        verbose=1,
    ),

    EarlyStopping(
        monitor="val_accuracy",
        mode="max",
        patience=5,
        restore_best_weights=True,
        verbose=1,
    ),

    ReduceLROnPlateau(
        monitor="val_loss",
        factor=0.3,
        patience=2,
        min_lr=1e-7,
        verbose=1,
    ),
]


# ==========================================================
# PHASE 1
# Train Classification Head
# ==========================================================

print("\n" + "=" * 70)
print("V5 PHASE 1 — CLASSIFIER TRAINING")
print("=" * 70)

history_head = model.fit(

    train_ds,

    validation_data=val_ds,

    epochs=HEAD_EPOCHS,

    class_weight=class_weights,

    callbacks=callbacks,

    verbose=1,
)


# ==========================================================
# PHASE 2
# Fine-Tuning
# ==========================================================

print("\n" + "=" * 70)
print("V5 PHASE 2 — MOBILENETV2 FINE-TUNING")
print("=" * 70)

# Rebuild with fine-tuning enabled.

model = build_model(
    num_classes=num_classes,
    learning_rate=FINE_TUNE_LEARNING_RATE,
    fine_tune=True,
)

# Load the best classifier weights from Phase 1
# if available.

if os.path.exists(
    BEST_MODEL_V5_PATH
):

    print(
        "\nLoading best Phase 1 weights..."
    )

    model.load_weights(
        BEST_MODEL_V5_PATH
    )


# Recompile after changing trainable layers.

model.compile(
    optimizer=tf.keras.optimizers.Adam(
        learning_rate=FINE_TUNE_LEARNING_RATE,
    ),
    loss="sparse_categorical_crossentropy",
    metrics=["accuracy"],
)


# Fresh callbacks for fine-tuning.

fine_tune_callbacks = [

    ModelCheckpoint(
        filepath=BEST_MODEL_V5_PATH,
        monitor="val_accuracy",
        mode="max",
        save_best_only=True,
        verbose=1,
    ),

    EarlyStopping(
        monitor="val_accuracy",
        mode="max",
        patience=6,
        restore_best_weights=True,
        verbose=1,
    ),

    ReduceLROnPlateau(
        monitor="val_loss",
        factor=0.3,
        patience=2,
        min_lr=1e-7,
        verbose=1,
    ),
]


history_fine = model.fit(

    train_ds,

    validation_data=val_ds,

    epochs=FINE_TUNE_EPOCHS,

    class_weight=class_weights,

    callbacks=fine_tune_callbacks,

    verbose=1,
)


# ==========================================================
# Load Best V5 Model
# ==========================================================

print("\n" + "=" * 70)
print("LOADING BEST V5 MODEL")
print("=" * 70)

if os.path.exists(
    BEST_MODEL_V5_PATH
):

    model = tf.keras.models.load_model(
        BEST_MODEL_V5_PATH
    )


# ==========================================================
# Save Final V5
# ==========================================================

model.save(
    MODEL_V5_PATH
)

print(
    f"\nFinal V5 model saved to:"
)

print(
    MODEL_V5_PATH
)

print(
    "\nBest V5 model saved to:"
)

print(
    BEST_MODEL_V5_PATH
)


# ==========================================================
# Combine Training History
# ==========================================================

accuracy_history = (
    history_head.history.get(
        "accuracy",
        []
    )
    +
    history_fine.history.get(
        "accuracy",
        []
    )
)

val_accuracy_history = (
    history_head.history.get(
        "val_accuracy",
        []
    )
    +
    history_fine.history.get(
        "val_accuracy",
        []
    )
)

loss_history = (
    history_head.history.get(
        "loss",
        []
    )
    +
    history_fine.history.get(
        "loss",
        []
    )
)

val_loss_history = (
    history_head.history.get(
        "val_loss",
        []
    )
    +
    history_fine.history.get(
        "val_loss",
        []
    )
)


# ==========================================================
# Accuracy Graph
# ==========================================================

plt.figure(
    figsize=(10, 6)
)

plt.plot(
    accuracy_history,
    label="Training Accuracy",
)

plt.plot(
    val_accuracy_history,
    label="Validation Accuracy",
)

plt.axvline(
    x=len(
        history_head.history[
            "accuracy"
        ]
    ) - 1,
    linestyle="--",
    label="Fine-Tuning Start",
)

plt.title(
    "Textile AI V5 — Accuracy"
)

plt.xlabel(
    "Epoch"
)

plt.ylabel(
    "Accuracy"
)

plt.legend()

plt.grid(True)

plt.tight_layout()

plt.savefig(
    ACCURACY_GRAPH
)

plt.close()


# ==========================================================
# Loss Graph
# ==========================================================

plt.figure(
    figsize=(10, 6)
)

plt.plot(
    loss_history,
    label="Training Loss",
)

plt.plot(
    val_loss_history,
    label="Validation Loss",
)

plt.axvline(
    x=len(
        history_head.history[
            "loss"
        ]
    ) - 1,
    linestyle="--",
    label="Fine-Tuning Start",
)

plt.title(
    "Textile AI V5 — Loss"
)

plt.xlabel(
    "Epoch"
)

plt.ylabel(
    "Loss"
)

plt.legend()

plt.grid(True)

plt.tight_layout()

plt.savefig(
    LOSS_GRAPH
)

plt.close()


# ==========================================================
# Final Evaluation
# ==========================================================

print("\n" + "=" * 70)
print("FINAL V5 EVALUATION")
print("=" * 70)

loss, accuracy = model.evaluate(
    val_ds,
    verbose=1,
)

print(
    f"\nValidation Accuracy : "
    f"{accuracy * 100:.2f}%"
)

print(
    f"Validation Loss     : "
    f"{loss:.4f}"
)


# ==========================================================
# Predictions
# ==========================================================

print(
    "\nGenerating predictions..."
)

y_true = []
y_pred = []

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


y_true = np.array(
    y_true
)

y_pred = np.array(
    y_pred
)


# ==========================================================
# Classification Report
# ==========================================================

print(
    "\n" + "=" * 70
)

print(
    "V5 CLASSIFICATION REPORT"
)

print(
    "=" * 70
)

print(
    classification_report(
        y_true,
        y_pred,
        target_names=class_names,
        digits=4,
        zero_division=0,
    )
)


# ==========================================================
# Confusion Matrix
# ==========================================================

cm = confusion_matrix(
    y_true,
    y_pred,
)

plt.figure(
    figsize=(10, 8)
)

plt.imshow(
    cm,
    interpolation="nearest",
)

plt.title(
    "Textile Fabric Classification — V5"
)

plt.colorbar()

tick_marks = np.arange(
    len(class_names)
)

plt.xticks(
    tick_marks,
    class_names,
    rotation=45,
    ha="right",
)

plt.yticks(
    tick_marks,
    class_names,
)

plt.xlabel(
    "Predicted Label"
)

plt.ylabel(
    "True Label"
)

plt.tight_layout()

plt.savefig(
    CONFUSION_GRAPH
)

plt.close()


# ==========================================================
# Per-Class Accuracy
# ==========================================================

print(
    "\n" + "=" * 70
)

print(
    "V5 PER-CLASS ACCURACY"
)

print(
    "=" * 70
)

for index, class_name in enumerate(
    class_names
):

    mask = (
        y_true == index
    )

    total = np.sum(
        mask
    )

    correct = np.sum(
        y_pred[mask] == index
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


# ==========================================================
# Complete
# ==========================================================

print(
    "\n" + "=" * 70
)

print(
    "TEXTILE AI V5 TRAINING COMPLETED"
)

print(
    "=" * 70
)