import tensorflow as tf

from tensorflow.keras import Model
from tensorflow.keras.layers import (
    Dense,
    Dropout,
    GlobalAveragePooling2D,
    RandomFlip,
    RandomRotation,
    RandomZoom,
    RandomContrast,
)
from tensorflow.keras.applications import MobileNetV2
from tensorflow.keras.optimizers import Adam

from ai.config import IMAGE_SIZE


def build_model(
    num_classes,
    learning_rate=1e-4,
    fine_tune=False,
):
    # ======================================================
    # Data Augmentation
    # ======================================================

    augmentation = tf.keras.Sequential(
        [
            RandomFlip("horizontal"),
            RandomRotation(0.12),
            RandomZoom(0.15),
            RandomContrast(0.10),
        ],
        name="data_augmentation",
    )

    # ======================================================
    # MobileNetV2 Backbone
    # ======================================================

    base_model = MobileNetV2(
        input_shape=IMAGE_SIZE + (3,),
        include_top=False,
        weights="imagenet",
    )

    # ======================================================
    # Freeze / Fine-Tune
    # ======================================================

    if not fine_tune:

        base_model.trainable = False

    else:

        base_model.trainable = True

        # Freeze earlier layers.
        #
        # Only the later MobileNetV2 feature layers
        # will adapt to textile-specific features.

        fine_tune_from = 100

        for layer in base_model.layers[
            :fine_tune_from
        ]:
            layer.trainable = False

        # Keep BatchNormalization frozen.
        #
        # This makes fine-tuning more stable on
        # relatively small datasets.

        for layer in base_model.layers:

            if isinstance(
                layer,
                tf.keras.layers.BatchNormalization,
            ):
                layer.trainable = False

    # ======================================================
    # Input
    # ======================================================

    inputs = tf.keras.Input(
        shape=IMAGE_SIZE + (3,),
        name="image_input",
    )

    # ======================================================
    # Augmentation
    # ======================================================

    x = augmentation(inputs)

    # ======================================================
    # MobileNetV2 Preprocessing
    # ======================================================

    x = tf.keras.applications.mobilenet_v2.preprocess_input(
        x
    )

    # ======================================================
    # Feature Extraction
    # ======================================================

    x = base_model(
        x,
        training=False,
    )

    # ======================================================
    # Classification Head
    # ======================================================

    x = GlobalAveragePooling2D()(x)

    x = Dropout(
        0.30,
        name="dropout_1",
    )(x)

    x = Dense(
        256,
        activation="relu",
        name="classification_dense",
    )(x)

    x = Dropout(
        0.20,
        name="dropout_2",
    )(x)

    outputs = Dense(
        num_classes,
        activation="softmax",
        name="predictions",
    )(x)

    # ======================================================
    # Create Model
    # ======================================================

    model = Model(
        inputs=inputs,
        outputs=outputs,
        name="Textile_MobileNetV2_V5",
    )

    # ======================================================
    # Compile
    # ======================================================

    model.compile(
        optimizer=Adam(
            learning_rate=learning_rate,
        ),
        loss="sparse_categorical_crossentropy",
        metrics=["accuracy"],
    )

    return model