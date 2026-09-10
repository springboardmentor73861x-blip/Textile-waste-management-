import os
import numpy as np
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

from ai.config import (
    MODELS_DIR,
    GRAPHS_DIR,
)


# ==========================================================
# CONFIGURATION
# ==========================================================

V4_MODEL_PATH = os.path.join(
    MODELS_DIR,
    "textile_model_v4_best.keras",
)

V6_MODEL_PATH = os.path.join(
    MODELS_DIR,
    "textile_model_v6.keras",
)

V6_BEST_MODEL_PATH = os.path.join(
    MODELS_DIR,
    "textile_model_v6_best.keras",
)

V6_EPOCHS = 25

V6_LEARNING_RATE = 1e-5


# ==========================================================
# FOLDERS
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
# HEADER
# ==========================================================

print("\n" + "=" * 70)
print("TEXTILE AI MODEL V6")
print("=" * 70)

print(
    "\nV6 starts from the trained V4 model."
)

print(
    "V4 will NOT be modified."
)


# ==========================================================
# CHECK V4
# ==========================================================

if not os.path.exists(
    V4_MODEL_PATH
):

    raise FileNotFoundError(
        f"\nV4 model not found:\n"
        f"{V4_MODEL_PATH}"
    )


print(
    f"\nV4 model found:\n"
    f"{V4_MODEL_PATH}"
)


# ==========================================================
# LOAD DATASET
# ==========================================================

print("\n" + "=" * 70)
print("LOADING DATASET")
print("=" * 70)

train_ds, val_ds, class_names = (
    load_dataset()
)

print(
    f"\nClasses: {class_names}"
)

print(
    f"Training batches: "
    f"{len(train_ds)}"
)

print(
    f"Validation batches: "
    f"{len(val_ds)}"
)


# ==========================================================
# LOAD V4 MODEL
# ==========================================================

print("\n" + "=" * 70)
print("LOADING V4 MODEL")
print("=" * 70)

model = tf.keras.models.load_model(
    V4_MODEL_PATH
)

print(
    "\nV4 model loaded successfully."
)


# ==========================================================
# FIND MOBILENETV2 BACKBONE
# ==========================================================

base_model = model.get_layer(
    "mobilenetv2_1.00_224"
)

print(
    "\nMobileNetV2 backbone found."
)

print(
    f"Total MobileNetV2 layers: "
    f"{len(base_model.layers)}"
)


# ==========================================================
# FINE-TUNING STRATEGY
# ==========================================================

print("\n" + "=" * 70)
print("CONFIGURING V6 FINE-TUNING")
print("=" * 70)

# Start by freezing everything.

base_model.trainable = True

# We only fine-tune the upper portion
# of MobileNetV2.
#
# Earlier layers contain generic visual
# features and are kept frozen.
#
# Later layers contain more task-specific
# visual features.

FINE_TUNE_FROM = 100


trainable_count = 0
frozen_count = 0


for index, layer in enumerate(
    base_model.layers
):

    if index < FINE_TUNE_FROM:

        layer.trainable = False

        frozen_count += 1

    else:

        # BatchNormalization layers remain
        # frozen for stability.

        if isinstance(
            layer,
            tf.keras.layers.BatchNormalization,
        ):

            layer.trainable = False

            frozen_count += 1

        else:

            layer.trainable = True

            trainable_count += 1


print(
    f"\nFrozen layers    : "
    f"{frozen_count}"
)

print(
    f"Trainable layers : "
    f"{trainable_count}"
)


# ==========================================================
# COMPILE
# ==========================================================

print("\n" + "=" * 70)
print("COMPILING V6")
print("=" * 70)

model.compile(
    optimizer=tf.keras.optimizers.Adam(
        learning_rate=V6_LEARNING_RATE
    ),
    loss="sparse_categorical_crossentropy",
    metrics=["accuracy"],
)


# ==========================================================
# CALLBACKS
# ==========================================================

callbacks = [

    ModelCheckpoint(
        filepath=V6_BEST_MODEL_PATH,
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


# ==========================================================
# TRAIN V6
# ==========================================================

print("\n" + "=" * 70)
print("V6 FINE-TUNING STARTED")
print("=" * 70)

print(
    "\nLearning rate:"
    f" {V6_LEARNING_RATE}"
)

print(
    f"Maximum epochs: "
    f"{V6_EPOCHS}"
)

print(
    "\nIMPORTANT:"
)

print(
    "No aggressive class weighting is being used."
)

print(
    "V4 weights are being fine-tuned directly."
)


history = model.fit(

    train_ds,

    validation_data=val_ds,

    epochs=V6_EPOCHS,

    callbacks=callbacks,

    verbose=1,
)


# ==========================================================
# LOAD BEST MODEL
# ==========================================================

print("\n" + "=" * 70)
print("LOADING BEST V6 MODEL")
print("=" * 70)

if os.path.exists(
    V6_BEST_MODEL_PATH
):

    model = tf.keras.models.load_model(
        V6_BEST_MODEL_PATH
    )


# ==========================================================
# SAVE FINAL MODEL
# ==========================================================

model.save(
    V6_MODEL_PATH
)

print(
    f"\nV6 model saved to:\n"
    f"{V6_MODEL_PATH}"
)

print(
    f"\nBest V6 model saved to:\n"
    f"{V6_BEST_MODEL_PATH}"
)


# ==========================================================
# FINAL EVALUATION
# ==========================================================

print("\n" + "=" * 70)
print("V6 FINAL EVALUATION")
print("=" * 70)

loss, accuracy = model.evaluate(
    val_ds,
    verbose=1,
)

print(
    f"\nV6 Validation Accuracy: "
    f"{accuracy * 100:.2f}%"
)

print(
    f"V6 Validation Loss: "
    f"{loss:.4f}"
)


# ==========================================================
# PREDICTIONS
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
# CLASSIFICATION REPORT
# ==========================================================

print("\n" + "=" * 70)
print("V6 CLASSIFICATION REPORT")
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


# ==========================================================
# CONFUSION MATRIX
# ==========================================================

cm = confusion_matrix(
    y_true,
    y_pred,
)

print("\n" + "=" * 70)
print("V6 CONFUSION MATRIX")
print("=" * 70)

print(cm)


# ==========================================================
# PER-CLASS ACCURACY
# ==========================================================

print("\n" + "=" * 70)
print("V6 PER-CLASS ACCURACY")
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
# COMPLETE
# ==========================================================

print("\n" + "=" * 70)
print("TEXTILE AI V6 COMPLETED")
print("=" * 70)

print(
    "\nV4 remains untouched."
)

print(
    "\nCompare V6 against:"
)

print(
    "V4 = 79.24%"
)

print(
    "\nDo NOT replace V4 in the website yet."
)