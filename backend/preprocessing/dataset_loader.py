from pathlib import Path
import random
import torch

from torchvision import datasets, transforms
from torch.utils.data import DataLoader, WeightedRandomSampler


# ============================================================
# PATHS
# ============================================================

BACKEND_DIR = Path(__file__).resolve().parent.parent

DATASET_DIR = BACKEND_DIR / "Fabric Classification"

TRAIN_DIR = DATASET_DIR / "train"
VAL_DIR = DATASET_DIR / "valid"
TEST_DIR = DATASET_DIR / "test"


# ============================================================
# CLASS NAMES
# ============================================================

# Final 7 classes used by this dataset.
#
# Dataset folder:
#     Cotton MIxed -> Mixed Fabrics
#     Viscose      -> Rayon
#
# The folders themselves will be renamed before training.

CLASS_NAMES = [
    "Cotton",
    "Denim",
    "Mixed Fabrics",
    "Polyester",
    "Rayon",
    "Silk",
    "Wool",
]


NUM_CLASSES = len(CLASS_NAMES)


# ============================================================
# SETTINGS
# ============================================================

IMAGE_SIZE = 224
BATCH_SIZE = 32
NUM_WORKERS = 0

SEED = 42

random.seed(SEED)
torch.manual_seed(SEED)


# ============================================================
# CHECK DATASET
# ============================================================

def check_dataset_directories():
    """
    Verify that train, valid and test directories exist.
    """

    required_dirs = [
        TRAIN_DIR,
        VAL_DIR,
        TEST_DIR,
    ]

    for directory in required_dirs:
        if not directory.exists():
            raise FileNotFoundError(
                f"\nDataset directory not found:\n{directory}\n\n"
                f"Expected structure:\n"
                f"{DATASET_DIR}/\n"
                f"├── train/\n"
                f"├── valid/\n"
                f"└── test/\n"
            )


# ============================================================
# TRANSFORMS
# ============================================================

# Training augmentation
#
# IMPORTANT:
# Augmentation is applied ONLY to training images.

train_transform = transforms.Compose([
    transforms.Resize((IMAGE_SIZE, IMAGE_SIZE)),

    transforms.RandomHorizontalFlip(p=0.5),

    transforms.RandomRotation(
        degrees=15
    ),

    transforms.ColorJitter(
        brightness=0.20,
        contrast=0.20,
        saturation=0.20,
        hue=0.05
    ),

    transforms.RandomAffine(
        degrees=0,
        translate=(0.05, 0.05),
        scale=(0.90, 1.10)
    ),

    transforms.ToTensor(),

    transforms.Normalize(
        mean=[0.485, 0.456, 0.406],
        std=[0.229, 0.224, 0.225]
    ),
])


# Validation and test:
# NO random augmentation.

val_test_transform = transforms.Compose([
    transforms.Resize((IMAGE_SIZE, IMAGE_SIZE)),

    transforms.ToTensor(),

    transforms.Normalize(
        mean=[0.485, 0.456, 0.406],
        std=[0.229, 0.224, 0.225]
    ),
])


# ============================================================
# CREATE DATASETS
# ============================================================

def create_datasets():

    check_dataset_directories()

    train_dataset = datasets.ImageFolder(
        root=str(TRAIN_DIR),
        transform=train_transform
    )

    val_dataset = datasets.ImageFolder(
        root=str(VAL_DIR),
        transform=val_test_transform
    )

    test_dataset = datasets.ImageFolder(
        root=str(TEST_DIR),
        transform=val_test_transform
    )

    return (
        train_dataset,
        val_dataset,
        test_dataset
    )


# ============================================================
# CLASS VALIDATION
# ============================================================

def validate_classes(
    train_dataset,
    val_dataset,
    test_dataset
):
    """
    Make sure all three splits contain exactly
    the same classes and order.
    """

    expected = CLASS_NAMES

    train_classes = train_dataset.classes
    val_classes = val_dataset.classes
    test_classes = test_dataset.classes

    print("\nDataset classes:")
    print("Train:", train_classes)
    print("Valid:", val_classes)
    print("Test :", test_classes)

    if train_classes != expected:
        raise ValueError(
            "\nTRAIN CLASS MISMATCH\n"
            f"Expected: {expected}\n"
            f"Found:    {train_classes}\n\n"
            "Rename the dataset folders correctly."
        )

    if val_classes != expected:
        raise ValueError(
            "\nVALID CLASS MISMATCH\n"
            f"Expected: {expected}\n"
            f"Found:    {val_classes}\n\n"
            "Rename the dataset folders correctly."
        )

    if test_classes != expected:
        raise ValueError(
            "\nTEST CLASS MISMATCH\n"
            f"Expected: {expected}\n"
            f"Found:    {test_classes}\n\n"
            "Rename the dataset folders correctly."
        )


# ============================================================
# WEIGHTED SAMPLER
# ============================================================

def create_weighted_sampler(train_dataset):
    """
    Gives slightly more sampling probability to
    underrepresented classes.

    This helps because Silk has fewer images than
    some of the other classes.
    """

    targets = torch.tensor(
        train_dataset.targets,
        dtype=torch.long
    )

    class_counts = torch.bincount(
        targets,
        minlength=NUM_CLASSES
    ).float()

    class_weights = 1.0 / class_counts.clamp(min=1)

    sample_weights = class_weights[targets]

    sampler = WeightedRandomSampler(
        weights=sample_weights,
        num_samples=len(sample_weights),
        replacement=True
    )

    return sampler


# ============================================================
# CREATE DATALOADERS
# ============================================================

def create_dataloaders():

    train_dataset, val_dataset, test_dataset = create_datasets()

    validate_classes(
        train_dataset,
        val_dataset,
        test_dataset
    )

    train_sampler = create_weighted_sampler(
        train_dataset
    )

    train_loader = DataLoader(
        train_dataset,
        batch_size=BATCH_SIZE,
        sampler=train_sampler,
        num_workers=NUM_WORKERS,
        pin_memory=torch.cuda.is_available()
    )

    val_loader = DataLoader(
        val_dataset,
        batch_size=BATCH_SIZE,
        shuffle=False,
        num_workers=NUM_WORKERS,
        pin_memory=torch.cuda.is_available()
    )

    test_loader = DataLoader(
        test_dataset,
        batch_size=BATCH_SIZE,
        shuffle=False,
        num_workers=NUM_WORKERS,
        pin_memory=torch.cuda.is_available()
    )

    return (
        train_loader,
        val_loader,
        test_loader,
        train_dataset,
        val_dataset,
        test_dataset
    )


# ============================================================
# DATASET INFORMATION
# ============================================================

def print_dataset_info(
    train_dataset,
    val_dataset,
    test_dataset
):

    print("\n" + "=" * 60)
    print("TEXTILE DATASET INFORMATION")
    print("=" * 60)

    print(f"Dataset location : {DATASET_DIR}")
    print(f"Number of classes: {NUM_CLASSES}")
    print(f"Image size       : {IMAGE_SIZE} x {IMAGE_SIZE}")
    print(f"Batch size       : {BATCH_SIZE}")

    print("\nClasses:")

    for index, class_name in enumerate(CLASS_NAMES):
        print(f"  {index}: {class_name}")

    print("\nImage counts:")

    print(f"  Train: {len(train_dataset)}")
    print(f"  Valid: {len(val_dataset)}")
    print(f"  Test : {len(test_dataset)}")

    print("=" * 60)


# ============================================================
# TEST LOADER
# ============================================================

if __name__ == "__main__":

    (
        train_loader,
        val_loader,
        test_loader,
        train_dataset,
        val_dataset,
        test_dataset
    ) = create_dataloaders()

    print_dataset_info(
        train_dataset,
        val_dataset,
        test_dataset
    )

    print("\nDataLoader test successful!")

    print(
        f"Train batches: {len(train_loader)}"
    )

    print(
        f"Valid batches: {len(val_loader)}"
    )

    print(
        f"Test batches : {len(test_loader)}"
    )

    images, labels = next(iter(train_loader))

    print("\nSample batch:")
    print("Images shape:", images.shape)
    print("Labels shape:", labels.shape)

    print("\nEverything is ready for MobileNetV3 training.")