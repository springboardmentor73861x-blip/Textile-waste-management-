from pathlib import Path
from collections import Counter

import tensorflow as tf
from sklearn.model_selection import train_test_split


# ============================================================
# CONFIGURATION
# ============================================================

IMAGE_SIZE = (300, 300)
BATCH_SIZE = 32
VALIDATION_SPLIT = 0.20
SEED = 42

VALID_EXTENSIONS = (
    ".jpg",
    ".jpeg",
    ".png",
    ".bmp",
    ".webp",
)


# ============================================================
# FINAL DATASET PATH
# ============================================================

BASE_DIR = Path(__file__).resolve().parents[3]

DATASET_PATH = (
    BASE_DIR
    / "Dataset"
    / "Fabric_Image_iBUG"
)


# ============================================================
# DATASET CLEANING
# ============================================================

EXCLUDED_CLASSES = {
    "Unclassified",
    "Utilities",
}


# ============================================================
# HELPERS
# ============================================================

def is_valid_image(path: Path) -> bool:
    return (
        path.is_file()
        and path.suffix.lower() in VALID_EXTENSIONS
    )


def collect_sample_groups(class_folder: Path):
    """
    FINAL iBUG dataset structure:

        Fabric_Image_iBUG/
            Acrylic/
                65/
                    im_1.png
                    im_2.png
                66/
                    im_1.png
                    im_2.png

    Each sample-number folder is treated as ONE group.
    """

    sample_groups = []

    # --------------------------------------------------------
    # Nested sample folders
    # --------------------------------------------------------

    sample_folders = sorted(
        [
            folder
            for folder in class_folder.iterdir()
            if folder.is_dir()
        ],
        key=lambda p: p.name.lower(),
    )

    for sample_folder in sample_folders:

        images = sorted(
            [
                image
                for image in sample_folder.rglob("*")
                if is_valid_image(image)
            ],
            key=lambda p: str(p).lower(),
        )

        if images:

            sample_groups.append(
                {
                    "sample_id": sample_folder.name,
                    "images": [
                        str(image)
                        for image in images
                    ],
                }
            )

    # --------------------------------------------------------
    # Also support images directly inside class folder
    # --------------------------------------------------------

    direct_images = sorted(
        [
            image
            for image in class_folder.iterdir()
            if is_valid_image(image)
        ],
        key=lambda p: str(p).lower(),
    )

    if direct_images:

        sample_groups.append(
            {
                "sample_id": "__direct_images__",
                "images": direct_images,
            }
        )

    return sample_groups


# ============================================================
# LOAD DATASET
# ============================================================

def load_datasets():

    print("\n" + "=" * 60)
    print("TEXTILE WASTE INTELLIGENCE PLATFORM")
    print("Fabric Image iBUG Dataset Loader")
    print("=" * 60)

    print("\nDataset Path:")
    print(DATASET_PATH)

    # --------------------------------------------------------
    # Validate dataset
    # --------------------------------------------------------

    if not DATASET_PATH.exists():
        raise FileNotFoundError(
            f"\nDataset not found:\n{DATASET_PATH}\n"
            "Please check the Dataset/Fabric_Image_iBUG folder."
        )

    if not DATASET_PATH.is_dir():
        raise NotADirectoryError(
            f"\nDataset path is not a directory:\n"
            f"{DATASET_PATH}"
        )

    # --------------------------------------------------------
    # Find class folders
    # --------------------------------------------------------

    all_class_folders = sorted(
        [
            folder
            for folder in DATASET_PATH.iterdir()
            if folder.is_dir()
            and folder.name not in EXCLUDED_CLASSES
        ],
        key=lambda p: p.name.lower(),
    )

    if not all_class_folders:
        raise ValueError(
            f"No valid class folders found inside:\n"
            f"{DATASET_PATH}"
        )

    class_names = [
        folder.name
        for folder in all_class_folders
    ]

    class_to_index = {
        class_name: index
        for index, class_name in enumerate(class_names)
    }

    print("\nClasses:")
    for index, class_name in enumerate(class_names):
        print(f"{index}: {class_name}")

    # --------------------------------------------------------
    # Collect sample groups
    # --------------------------------------------------------

    all_samples = []

    for class_folder in all_class_folders:

        class_name = class_folder.name

        sample_groups = collect_sample_groups(
            class_folder
        )

        for sample in sample_groups:

            all_samples.append(
                {
                    "class_name": class_name,
                    "label": class_to_index[class_name],
                    "sample_id": sample["sample_id"],
                    "images": sample["images"],
                }
            )

    if not all_samples:
        raise ValueError(
            f"No images found in:\n{DATASET_PATH}"
        )

    # --------------------------------------------------------
    # Print class statistics
    # --------------------------------------------------------

    class_image_counts = Counter()

    for sample in all_samples:
        class_image_counts[sample["class_name"]] += len(
            sample["images"]
        )

    print("\nClass Image Counts:")

    for class_name in class_names:
        print(
            f"{class_name}: "
            f"{class_image_counts[class_name]} images"
        )

    print(
        f"\nTotal Classes : {len(class_names)}"
    )

    print(
        f"Total Samples : {len(all_samples)}"
    )

    print(
        f"Total Images  : "
        f"{sum(class_image_counts.values())}"
    )

    # --------------------------------------------------------
    # SAMPLE-LEVEL TRAIN / VALIDATION SPLIT
    # --------------------------------------------------------

    sample_indices = list(
        range(len(all_samples))
    )

    sample_labels = [
        sample["label"]
        for sample in all_samples
    ]

    train_indices, val_indices = train_test_split(
        sample_indices,
        test_size=VALIDATION_SPLIT,
        random_state=SEED,
        stratify=sample_labels,
    )

    # --------------------------------------------------------
    # Convert samples → image paths
    # --------------------------------------------------------

    train_images = []
    train_labels = []

    val_images = []
    val_labels = []

    for index in train_indices:

        sample = all_samples[index]

        for image_path in sample["images"]:

            train_images.append(
                str(image_path)
            )

            train_labels.append(
                sample["label"]
            )

    for index in val_indices:

        sample = all_samples[index]

        for image_path in sample["images"]:

            val_images.append(
                str(image_path)
            )

            val_labels.append(
                sample["label"]
            )

    print("\nSplit Information:")
    print(
        f"Training Images   : {len(train_images)}"
    )
    print(
        f"Validation Images : {len(val_images)}"
    )

    # --------------------------------------------------------
    # TensorFlow datasets
    # --------------------------------------------------------

    train_dataset = tf.data.Dataset.from_tensor_slices(
        (
            train_images,
            train_labels,
        )
    )

    validation_dataset = tf.data.Dataset.from_tensor_slices(
        (
            val_images,
            val_labels,
        )
    )

    return (
        train_dataset,
        validation_dataset,
        class_names,
    )