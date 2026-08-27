import os
import json
import random
import numpy as np
from PIL import Image
import tensorflow as tf

from app.ai.utils.config import (
    DATASET_DIR,
    IMAGE_SIZE,
    BATCH_SIZE,
    VALIDATION_SPLIT,
    SEED,
    AUTOTUNE,
    LABEL_DIR,
)
from app.ai.utils.dataset_cleaner import DatasetCleaner
from app.ai.utils.feature_extractor import FabricFeatureExtractor


class DatasetLoader:

    @staticmethod
    def load_dataset(clean_first: bool = True, target_min_samples: int = 350):
        """
        Loads cleaned fabric dataset with:
        1. Class-Balanced Oversampling: Oversamples minor fabric classes (< target_min_samples) to resolve imbalance.
        2. Multi-Input Feature Extraction: Extracts 16-dimensional visual feature vectors for each image.
        3. Returns Keras Multi-Input Datasets: ((image_input, feature_input), label_input).
        """
        if clean_first:
            DatasetCleaner.clean_dataset()

        # Get active class names
        class_names = sorted([d for d in os.listdir(DATASET_DIR) if os.path.isdir(os.path.join(DATASET_DIR, d)) and not d.startswith(".")])
        class_to_idx = {name: idx for idx, name in enumerate(class_names)}
        num_classes = len(class_names)

        # Save active class list to labels directory
        LABEL_DIR.mkdir(parents=True, exist_ok=True)
        label_file = LABEL_DIR / "fabric_labels.json"
        with open(label_file, "w") as f:
            json.dump(class_names, f, indent=2)
        print(f"📝 Persisted {num_classes} fabric labels to {label_file}")

        # Gather image file paths per class
        all_samples = []
        random.seed(SEED)

        for class_name in class_names:
            class_folder = os.path.join(DATASET_DIR, class_name)
            valid_files = [
                os.path.join(class_folder, f)
                for f in os.listdir(class_folder)
                if f.lower().endswith((".jpg", ".jpeg", ".png", ".bmp", ".webp"))
            ]
            valid_files.sort()
            all_samples.append((class_name, valid_files))

        # Perform Train/Val Split per class (80% train, 20% val)
        train_filepaths = []
        train_labels = []
        val_filepaths = []
        val_labels = []

        for class_name, files in all_samples:
            random.shuffle(files)
            split_idx = max(1, int(len(files) * (1.0 - VALIDATION_SPLIT)))
            t_files = files[:split_idx]
            v_files = files[split_idx:]

            # Apply Class-Balanced Oversampling on Training Split
            if len(t_files) < target_min_samples:
                multiplier = (target_min_samples // len(t_files)) + 1
                oversampled_t = (t_files * multiplier)[:target_min_samples]
            else:
                oversampled_t = t_files

            for fp in oversampled_t:
                train_filepaths.append(fp)
                train_labels.append(class_to_idx[class_name])

            for fp in v_files:
                val_filepaths.append(fp)
                val_labels.append(class_to_idx[class_name])

        # Shuffle training set
        combined_train = list(zip(train_filepaths, train_labels))
        random.shuffle(combined_train)
        train_filepaths, train_labels = zip(*combined_train)

        print(f"============================================================")
        print(f"⚖️ Class-Balanced Dataset Loading:")
        print(f"   Train Samples (Oversampled) : {len(train_filepaths)}")
        print(f"   Validation Samples          : {len(val_filepaths)}")
        print(f"   Target Min Samples/Class    : {target_min_samples}")
        print(f"============================================================")

        # Helper function to generate tf.data Dataset with pre-extracted features
        def create_tf_dataset(filepaths, labels, is_training=True):
            def generator():
                for fp, lbl in zip(filepaths, labels):
                    try:
                        with Image.open(fp) as img:
                            img_rgb = img.convert("RGB")
                            # Extract 16-dim feature vector
                            features = FabricFeatureExtractor.extract_features(img_rgb)
                            
                            # Resize image to target size
                            img_resized = img_rgb.resize(IMAGE_SIZE)
                            img_arr = np.array(img_resized, dtype=np.float32)

                            yield {"image_input": img_arr, "feature_input": features}, lbl
                    except Exception as e:
                        continue

            output_signature = (
                {
                    "image_input": tf.TensorSpec(shape=(*IMAGE_SIZE, 3), dtype=tf.float32),
                    "feature_input": tf.TensorSpec(shape=(16,), dtype=tf.float32),
                },
                tf.TensorSpec(shape=(), dtype=tf.int32),
            )

            ds = tf.data.Dataset.from_generator(generator, output_signature=output_signature)
            if is_training:
                ds = ds.shuffle(buffer_size=1000)
            ds = ds.batch(BATCH_SIZE).prefetch(AUTOTUNE)
            return ds

        train_dataset = create_tf_dataset(train_filepaths, train_labels, is_training=True)
        validation_dataset = create_tf_dataset(val_filepaths, val_labels, is_training=False)

        # Equal class weights since dataset is balanced via oversampling
        class_weights = {idx: 1.0 for idx in range(num_classes)}

        return (
            train_dataset,
            validation_dataset,
            class_names,
            class_weights,
        )