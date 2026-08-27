import tensorflow as tf

from app.ai.utils.config import IMAGE_SIZE, LEARNING_RATE
from app.ai.utils.preprocessing import ImagePreprocessor


class FabricClassifier:

    @staticmethod
    def build_model(num_classes: int, num_features: int = 16, learning_rate: float = LEARNING_RATE):
        """
        Builds a Dual-Branch Multi-Input Deep Learning Architecture:
        - Image Branch: EfficientNetB0 backbone for raw spatial pixel features.
        - Feature Branch: Deep MLP for 16-dimensional visual/texture features (sheen, edges, roughness, HSV, RGB).
        - Fusion Head: Concatenates pixel embeddings and visual features for multi-modal classification.
        """
        data_augmentation = ImagePreprocessor.get_data_augmentation()

        # 1. Image Input Branch
        image_input = tf.keras.Input(shape=(*IMAGE_SIZE, 3), name="image_input")
        x_img = data_augmentation(image_input)
        x_img = tf.keras.applications.efficientnet.preprocess_input(x_img)

        base_model = tf.keras.applications.EfficientNetB0(
            include_top=False,
            weights="imagenet",
            input_shape=(*IMAGE_SIZE, 3),
            name="efficientnetb0",
        )
        base_model.trainable = False  # Freeze base model initially

        x_img = base_model(x_img, training=False)
        x_img = tf.keras.layers.GlobalAveragePooling2D()(x_img)
        x_img = tf.keras.layers.BatchNormalization()(x_img)
        x_img = tf.keras.layers.Dropout(0.3)(x_img)
        x_img = tf.keras.layers.Dense(256, activation="relu")(x_img)
        x_img = tf.keras.layers.BatchNormalization()(x_img)

        # 2. Visual/Texture Feature Vector Branch
        feature_input = tf.keras.Input(shape=(num_features,), name="feature_input")
        x_feat = tf.keras.layers.BatchNormalization()(feature_input)
        x_feat = tf.keras.layers.Dense(64, activation="relu")(x_feat)
        x_feat = tf.keras.layers.BatchNormalization()(x_feat)
        x_feat = tf.keras.layers.Dropout(0.2)(x_feat)
        x_feat = tf.keras.layers.Dense(32, activation="relu")(x_feat)
        x_feat = tf.keras.layers.BatchNormalization()(x_feat)

        # 3. Multi-Modal Feature Fusion Head
        fusion = tf.keras.layers.Concatenate(name="feature_fusion")([x_img, x_feat])
        fusion = tf.keras.layers.Dense(
            256, 
            activation="relu", 
            kernel_regularizer=tf.keras.regularizers.l2(1e-4),
            name="fusion_dense_1"
        )(fusion)
        fusion = tf.keras.layers.BatchNormalization()(fusion)
        fusion = tf.keras.layers.Dropout(0.3)(fusion)

        fusion = tf.keras.layers.Dense(128, activation="relu", name="fusion_dense_2")(fusion)
        fusion = tf.keras.layers.Dropout(0.2)(fusion)

        outputs = tf.keras.layers.Dense(num_classes, activation="softmax", name="class_output")(fusion)

        model = tf.keras.Model(
            inputs=[image_input, feature_input], 
            outputs=outputs, 
            name="multi_input_fabric_classifier"
        )

        model.compile(
            optimizer=tf.keras.optimizers.Adam(learning_rate),
            loss="sparse_categorical_crossentropy",
            metrics=["accuracy"],
        )

        return model

    @staticmethod
    def unfreeze_top_layers(model: tf.keras.Model, num_layers: int = 50, learning_rate: float = 1e-5):
        """
        Unfreezes top N layers of the EfficientNet backbone for fine-tuning while
        keeping BatchNormalization layers frozen in inference mode.
        """
        base_model = None
        for layer in model.layers:
            if "efficientnet" in layer.name.lower():
                base_model = layer
                break

        if base_model is None:
            raise ValueError("Base model layer EfficientNet not found in the model.")

        base_model.trainable = True

        total_layers = len(base_model.layers)
        freeze_until = max(0, total_layers - num_layers)

        for i, layer in enumerate(base_model.layers):
            if i < freeze_until or isinstance(layer, tf.keras.layers.BatchNormalization):
                layer.trainable = False
            else:
                layer.trainable = True

        model.compile(
            optimizer=tf.keras.optimizers.Adam(learning_rate),
            loss="sparse_categorical_crossentropy",
            metrics=["accuracy"],
        )

        unfrozen_count = sum(1 for l in base_model.layers if l.trainable)
        print(f"🔓 Fine-Tuning setup: Unfrozen top {unfrozen_count} layers of EfficientNetB0 (Base model total layers: {total_layers}).")
        return model