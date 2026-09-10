import json
from pathlib import Path

import numpy as np
import tensorflow as tf

from sklearn.model_selection import train_test_split

from ai.config import (
    DATASET_PATH,
    IMAGE_SIZE,
    BATCH_SIZE,
    VALIDATION_SPLIT,
    SEED,
    LABELS_PATH,
    CLASSES,
)

AUTOTUNE = tf.data.AUTOTUNE

# Supported image formats
IMAGE_EXTENSIONS = {
    ".jpg",
    ".jpeg",
    ".png",
    ".bmp",
    ".webp",
}


def load_image(path, label):
    """
    Load and resize one image.
    """

    image = tf.io.read_file(path)

    image = tf.image.decode_image(
        image,
        channels=3,
        expand_animations=False,
    )

    image = tf.image.resize(
        image,
        IMAGE_SIZE,
    )

    image = tf.cast(
        image,
        tf.float32,
    )

    return image, label


def load_dataset():

    print("\n" + "=" * 70)
    print("LOADING TEXTILE DATASET — STRATIFIED SPLIT")
    print("=" * 70)

    print(f"Dataset path       : {DATASET_PATH}")
    print(f"Image size         : {IMAGE_SIZE}")
    print(f"Batch size         : {BATCH_SIZE}")
    print(f"Validation split   : {VALIDATION_SPLIT}")

    dataset_root = Path(DATASET_PATH)

    # ======================================================
    # Find ALL images
    # ======================================================

    image_paths = []
    labels = []

    print("\nScanning dataset...")

    for class_index, class_name in enumerate(CLASSES):

        class_directory = dataset_root / class_name

        if not class_directory.exists():

            print(
                f"WARNING: Missing class directory: "
                f"{class_directory}"
            )

            continue

        class_images = []

        # Recursive search because your dataset has
        # nested folders such as:
        #
        # Cotton/10/im_1.png
        # Denim/12/im_2.png

        for path in class_directory.rglob("*"):

            if (
                path.is_file()
                and path.suffix.lower()
                in IMAGE_EXTENSIONS
            ):
                class_images.append(
                    str(path)
                )

        class_images.sort()

        print(
            f"{class_name:<15} : "
            f"{len(class_images)} images"
        )

        for image_path in class_images:

            image_paths.append(
                image_path
            )

            labels.append(
                class_index
            )

    # ======================================================
    # Convert to NumPy arrays
    # ======================================================

    image_paths = np.array(
        image_paths
    )

    labels = np.array(
        labels,
        dtype=np.int32,
    )

    total_images = len(
        image_paths
    )

    print(
        f"\nTotal images found : "
        f"{total_images}"
    )

    # ======================================================
    # Safety Check
    # ======================================================

    if total_images == 0:

        raise ValueError(
            "No images were found in the dataset."
        )

    # ======================================================
    # Stratified Train / Validation Split
    # ======================================================

    print(
        "\nCreating stratified "
        "train/validation split..."
    )

    train_paths, val_paths, train_labels, val_labels = (
        train_test_split(
            image_paths,
            labels,
            test_size=VALIDATION_SPLIT,
            random_state=SEED,
            stratify=labels,
            shuffle=True,
        )
    )

    # ======================================================
    # Print Split Distribution
    # ======================================================

    print("\n" + "=" * 70)
    print("STRATIFIED SPLIT DISTRIBUTION")
    print("=" * 70)

    print(
        f"{'Class':<15}"
        f"{'Total':>10}"
        f"{'Train':>10}"
        f"{'Validation':>14}"
    )

    print("-" * 55)

    for class_index, class_name in enumerate(CLASSES):

        total_count = np.sum(
            labels == class_index
        )

        train_count = np.sum(
            train_labels == class_index
        )

        val_count = np.sum(
            val_labels == class_index
        )

        print(
            f"{class_name:<15}"
            f"{total_count:>10}"
            f"{train_count:>10}"
            f"{val_count:>14}"
        )

    print("-" * 55)

    print(
        f"{'TOTAL':<15}"
        f"{len(labels):>10}"
        f"{len(train_labels):>10}"
        f"{len(val_labels):>14}"
    )

    # ======================================================
    # Create TensorFlow Datasets
    # ======================================================

    train_ds = tf.data.Dataset.from_tensor_slices(
        (
            train_paths,
            train_labels,
        )
    )

    val_ds = tf.data.Dataset.from_tensor_slices(
        (
            val_paths,
            val_labels,
        )
    )

    # ======================================================
    # Training Dataset
    # ======================================================

    train_ds = train_ds.shuffle(
        buffer_size=len(train_paths),
        seed=SEED,
        reshuffle_each_iteration=True,
    )

    train_ds = train_ds.map(
        load_image,
        num_parallel_calls=AUTOTUNE,
    )

    train_ds = train_ds.batch(
        BATCH_SIZE
    )

    # ======================================================
    # Validation Dataset
    # ======================================================

    val_ds = val_ds.map(
        load_image,
        num_parallel_calls=AUTOTUNE,
    )

    val_ds = val_ds.batch(
        BATCH_SIZE
    )

    # ======================================================
    # Performance Optimization
    # ======================================================

    train_ds = train_ds.prefetch(
        AUTOTUNE
    )

    val_ds = val_ds.prefetch(
        AUTOTUNE
    )

    # ======================================================
    # Save Class Labels
    # ======================================================

    with open(
        LABELS_PATH,
        "w"
    ) as f:

        json.dump(
            CLASSES,
            f,
            indent=4,
        )

    # ======================================================
    # Final Information
    # ======================================================

    print("\n" + "=" * 70)
    print("DATASET LOADED SUCCESSFULLY")
    print("=" * 70)

    print(
        f"Training images   : "
        f"{len(train_paths)}"
    )

    print(
        f"Validation images : "
        f"{len(val_paths)}"
    )

    print(
        f"Training batches  : "
        f"{len(train_ds)}"
    )

    print(
        f"Validation batches: "
        f"{len(val_ds)}"
    )

    print(
        f"\nClasses: {CLASSES}"
    )

    print("=" * 70)

    return (
        train_ds,
        val_ds,
        CLASSES,
    )