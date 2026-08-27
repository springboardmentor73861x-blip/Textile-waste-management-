import tensorflow as tf

from app.ai.utils.config import IMAGE_SIZE


class ImagePreprocessor:

    @staticmethod
    def get_data_augmentation():
        """
        Returns spatial and color augmentation pipeline for training textile classifier.
        """
        return tf.keras.Sequential([
            tf.keras.layers.RandomFlip("horizontal_and_vertical"),
            tf.keras.layers.RandomRotation(0.20),
            tf.keras.layers.RandomZoom(0.15),
            tf.keras.layers.RandomContrast(0.15),
            tf.keras.layers.RandomBrightness(0.10),
        ], name="data_augmentation")

    @staticmethod
    def cast_float32(images, labels):
        images = tf.cast(images, tf.float32)
        return images, labels

    @staticmethod
    def preprocess_dataset(dataset):
        return dataset.map(
            ImagePreprocessor.cast_float32,
            num_parallel_calls=tf.data.AUTOTUNE,
        )