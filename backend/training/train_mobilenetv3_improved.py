# ============================================================
# AI TEXTILE WASTE INTELLIGENCE PLATFORM
# Improved MobileNetV3 Small Training
# ============================================================

import os
import sys
import copy
import random
from pathlib import Path

import numpy as np
import pandas as pd
import torch
import torch.nn as nn
from torch.optim import AdamW
from torch.optim.lr_scheduler import ReduceLROnPlateau
from torchvision import transforms
from torchvision.models import (
    mobilenet_v3_small,
    MobileNet_V3_Small_Weights,
)
from torch.utils.data import DataLoader, WeightedRandomSampler
from torchvision.datasets import ImageFolder

from sklearn.metrics import (
    accuracy_score,
    precision_score,
    recall_score,
    f1_score,
    classification_report,
    confusion_matrix,
)


# ============================================================
# 1. PATH SETUP
# ============================================================

BACKEND_DIR = Path(__file__).resolve().parent.parent

if str(BACKEND_DIR) not in sys.path:
    sys.path.insert(0, str(BACKEND_DIR))


from preprocessing.dataset_loader import (
    TRAIN_DIR,
    VAL_DIR,
    TEST_DIR,
    CLASS_NAMES,
    NUM_CLASSES,
)


# ============================================================
# 2. CONFIGURATION
# ============================================================

SEED = 42

IMAGE_SIZE = 224
BATCH_SIZE = 32

# Total epochs
EPOCHS = 20

# Stage 1: classifier training
STAGE1_EPOCHS = 3

# Learning rates
STAGE1_LR = 1e-3
STAGE2_BACKBONE_LR = 3e-5
STAGE2_CLASSIFIER_LR = 3e-4

WEIGHT_DECAY = 1e-4

# Label smoothing
LABEL_SMOOTHING = 0.05

# DataLoader
NUM_WORKERS = 0

# Early stopping
EARLY_STOPPING_PATIENCE = 6

# Model output directory
MODEL_DIR = BACKEND_DIR / "models" / "mobilenetv3"

MODEL_DIR.mkdir(parents=True, exist_ok=True)

BEST_MODEL_PATH = (
    MODEL_DIR / "mobilenetv3_small_improved_best.pth"
)

FINAL_MODEL_PATH = (
    MODEL_DIR / "mobilenetv3_small_improved_final.pth"
)

REPORT_PATH = (
    MODEL_DIR / "mobilenetv3_small_improved_classification_report.txt"
)

CONFUSION_PATH = (
    MODEL_DIR / "mobilenetv3_small_improved_confusion_matrix.csv"
)

HISTORY_PATH = (
    MODEL_DIR / "mobilenetv3_small_improved_training_history.csv"
)


# ============================================================
# 3. REPRODUCIBILITY
# ============================================================

def set_seed(seed=42):

    random.seed(seed)

    np.random.seed(seed)

    torch.manual_seed(seed)

    if torch.cuda.is_available():
        torch.cuda.manual_seed(seed)
        torch.cuda.manual_seed_all(seed)

    # Reproducibility
    torch.backends.cudnn.deterministic = True
    torch.backends.cudnn.benchmark = False


set_seed(SEED)


# ============================================================
# 4. DEVICE
# ============================================================

DEVICE = torch.device(
    "cuda" if torch.cuda.is_available() else "cpu"
)


print("=" * 70)
print("IMPROVED MOBILENETV3 SMALL TRAINING")
print("=" * 70)

print(f"Device        : {DEVICE}")
print(f"Image Size    : {IMAGE_SIZE}")
print(f"Batch Size    : {BATCH_SIZE}")
print(f"Epochs        : {EPOCHS}")
print(f"Stage 1 Epochs: {STAGE1_EPOCHS}")
print(f"Classes       : {CLASS_NAMES}")
print()


# ============================================================
# 5. IMAGE TRANSFORMS
# ============================================================

# ImageNet normalization
IMAGENET_MEAN = [
    0.485,
    0.456,
    0.406,
]

IMAGENET_STD = [
    0.229,
    0.224,
    0.225,
]


# ------------------------------------------------------------
# TRAIN TRANSFORMS
# ------------------------------------------------------------
#
# Stronger augmentation than the previous model.
# Designed to improve generalization while preserving
# important textile texture/pattern information.
#

train_transform = transforms.Compose([

    transforms.RandomResizedCrop(
        IMAGE_SIZE,
        scale=(0.75, 1.0),
        ratio=(0.85, 1.15),
    ),

    transforms.RandomHorizontalFlip(
        p=0.5
    ),

    transforms.RandomRotation(
        degrees=10
    ),

    transforms.ColorJitter(
        brightness=0.20,
        contrast=0.20,
        saturation=0.15,
        hue=0.03,
    ),

    transforms.RandomAffine(
        degrees=0,
        translate=(0.05, 0.05),
        scale=(0.95, 1.05),
    ),

    transforms.ToTensor(),

    transforms.Normalize(
        IMAGENET_MEAN,
        IMAGENET_STD,
    ),

    transforms.RandomErasing(
        p=0.15,
        scale=(0.02, 0.12),
        ratio=(0.3, 3.3),
        value="random",
    ),
])


# ------------------------------------------------------------
# VALIDATION / TEST TRANSFORMS
# ------------------------------------------------------------

val_transform = transforms.Compose([

    transforms.Resize(
        (IMAGE_SIZE, IMAGE_SIZE)
    ),

    transforms.ToTensor(),

    transforms.Normalize(
        IMAGENET_MEAN,
        IMAGENET_STD,
    ),
])


# ============================================================
# 6. LOAD DATASETS
# ============================================================

print("=" * 70)
print("LOADING DATASET")
print("=" * 70)


train_dataset = ImageFolder(
    root=str(TRAIN_DIR),
    transform=train_transform,
)

val_dataset = ImageFolder(
    root=str(VAL_DIR),
    transform=val_transform,
)

test_dataset = ImageFolder(
    root=str(TEST_DIR),
    transform=val_transform,
)


# ============================================================
# 7. VERIFY CLASS ORDER
# ============================================================

expected_class_to_idx = {
    class_name: index
    for index, class_name in enumerate(CLASS_NAMES)
}


print("\nDataset classes:")

print("Train:", train_dataset.class_to_idx)
print("Valid:", val_dataset.class_to_idx)
print("Test :", test_dataset.class_to_idx)


if train_dataset.class_to_idx != expected_class_to_idx:

    raise ValueError(
        "\nERROR: Training dataset class order does not match "
        "CLASS_NAMES.\n"
        f"Expected: {expected_class_to_idx}\n"
        f"Found: {train_dataset.class_to_idx}"
    )


if val_dataset.class_to_idx != expected_class_to_idx:

    raise ValueError(
        "\nERROR: Validation dataset class order does not match "
        "CLASS_NAMES.\n"
        f"Expected: {expected_class_to_idx}\n"
        f"Found: {val_dataset.class_to_idx}"
    )


if test_dataset.class_to_idx != expected_class_to_idx:

    raise ValueError(
        "\nERROR: Test dataset class order does not match "
        "CLASS_NAMES.\n"
        f"Expected: {expected_class_to_idx}\n"
        f"Found: {test_dataset.class_to_idx}"
    )


print("\nClass order verified successfully.")


# ============================================================
# 8. DATASET SIZES
# ============================================================

print("\nDataset sizes:")

print(f"Train : {len(train_dataset)}")
print(f"Valid : {len(val_dataset)}")
print(f"Test  : {len(test_dataset)}")


# ============================================================
# 9. CLASS DISTRIBUTION
# ============================================================

train_targets = np.array(
    train_dataset.targets
)

class_counts = np.bincount(
    train_targets,
    minlength=NUM_CLASSES,
)


print("\nTraining class distribution:")

for class_name, count in zip(
    CLASS_NAMES,
    class_counts
):

    print(
        f"{class_name:<20} : {count}"
    )


# ============================================================
# 10. WEIGHTED RANDOM SAMPLER
# ============================================================
#
# The dataset is somewhat imbalanced.
# WeightedRandomSampler gives underrepresented classes
# more opportunities during training.
#

class_weights = (
    1.0 /
    np.maximum(class_counts, 1)
)


sample_weights = class_weights[
    train_targets
]


sample_weights = torch.as_tensor(
    sample_weights,
    dtype=torch.double,
)


train_sampler = WeightedRandomSampler(
    weights=sample_weights,
    num_samples=len(sample_weights),
    replacement=True,
)


# ============================================================
# 11. DATA LOADERS
# ============================================================

train_loader = DataLoader(
    train_dataset,
    batch_size=BATCH_SIZE,
    sampler=train_sampler,
    num_workers=NUM_WORKERS,
    pin_memory=torch.cuda.is_available(),
)

val_loader = DataLoader(
    val_dataset,
    batch_size=BATCH_SIZE,
    shuffle=False,
    num_workers=NUM_WORKERS,
    pin_memory=torch.cuda.is_available(),
)

test_loader = DataLoader(
    test_dataset,
    batch_size=BATCH_SIZE,
    shuffle=False,
    num_workers=NUM_WORKERS,
    pin_memory=torch.cuda.is_available(),
)


print("\nDataLoader information:")

print(
    f"Train batches: {len(train_loader)}"
)

print(
    f"Valid batches: {len(val_loader)}"
)

print(
    f"Test batches : {len(test_loader)}"
)


# ============================================================
# 12. BUILD MOBILENETV3 SMALL
# ============================================================

print("\n" + "=" * 70)
print("LOADING PRETRAINED MOBILENETV3 SMALL")
print("=" * 70)


weights = MobileNet_V3_Small_Weights.DEFAULT

model = mobilenet_v3_small(
    weights=weights
)


# ============================================================
# 13. REPLACE CLASSIFIER
# ============================================================

in_features = (
    model.classifier[-1].in_features
)


model.classifier[-1] = nn.Linear(
    in_features,
    NUM_CLASSES,
)


model = model.to(DEVICE)


print(
    f"Classifier output classes: {NUM_CLASSES}"
)


# ============================================================
# 14. LOSS FUNCTION
# ============================================================

criterion = nn.CrossEntropyLoss(
    label_smoothing=LABEL_SMOOTHING
)


# ============================================================
# 15. METRIC FUNCTION
# ============================================================

def calculate_metrics(
    y_true,
    y_pred,
):

    accuracy = accuracy_score(
        y_true,
        y_pred,
    )

    precision = precision_score(
        y_true,
        y_pred,
        average="macro",
        zero_division=0,
    )

    recall = recall_score(
        y_true,
        y_pred,
        average="macro",
        zero_division=0,
    )

    f1 = f1_score(
        y_true,
        y_pred,
        average="macro",
        zero_division=0,
    )

    return (
        accuracy,
        precision,
        recall,
        f1,
    )


# ============================================================
# 16. TRAIN ONE EPOCH
# ============================================================

def train_one_epoch(
    model,
    loader,
    criterion,
    optimizer,
):

    model.train()

    running_loss = 0.0

    all_targets = []
    all_predictions = []


    for images, targets in loader:

        images = images.to(
            DEVICE,
            non_blocking=True,
        )

        targets = targets.to(
            DEVICE,
            non_blocking=True,
        )


        optimizer.zero_grad()


        outputs = model(images)


        loss = criterion(
            outputs,
            targets,
        )


        loss.backward()


        # Prevent exploding gradients
        torch.nn.utils.clip_grad_norm_(
            model.parameters(),
            max_norm=5.0,
        )


        optimizer.step()


        running_loss += (
            loss.item()
            * images.size(0)
        )


        predictions = torch.argmax(
            outputs,
            dim=1,
        )


        all_targets.extend(
            targets.detach()
            .cpu()
            .numpy()
        )

        all_predictions.extend(
            predictions.detach()
            .cpu()
            .numpy()
        )


    epoch_loss = (
        running_loss /
        len(loader.dataset)
    )


    (
        accuracy,
        precision,
        recall,
        f1,
    ) = calculate_metrics(
        all_targets,
        all_predictions,
    )


    return (
        epoch_loss,
        accuracy,
        precision,
        recall,
        f1,
    )


# ============================================================
# 17. VALIDATION
# ============================================================

def validate(
    model,
    loader,
    criterion,
):

    model.eval()

    running_loss = 0.0

    all_targets = []
    all_predictions = []


    with torch.no_grad():

        for images, targets in loader:

            images = images.to(
                DEVICE,
                non_blocking=True,
            )

            targets = targets.to(
                DEVICE,
                non_blocking=True,
            )


            outputs = model(images)


            loss = criterion(
                outputs,
                targets,
            )


            running_loss += (
                loss.item()
                * images.size(0)
            )


            predictions = torch.argmax(
                outputs,
                dim=1,
            )


            all_targets.extend(
                targets.cpu().numpy()
            )

            all_predictions.extend(
                predictions.cpu().numpy()
            )


    epoch_loss = (
        running_loss /
        len(loader.dataset)
    )


    (
        accuracy,
        precision,
        recall,
        f1,
    ) = calculate_metrics(
        all_targets,
        all_predictions,
    )


    return (
        epoch_loss,
        accuracy,
        precision,
        recall,
        f1,
    )


# ============================================================
# 18. STAGE 1 - FREEZE BACKBONE
# ============================================================

print("\n" + "=" * 70)
print("STAGE 1: CLASSIFIER WARM-UP")
print("=" * 70)


# Freeze all backbone parameters
for parameter in model.features.parameters():

    parameter.requires_grad = False


# Classifier remains trainable
for parameter in model.classifier.parameters():

    parameter.requires_grad = True


optimizer = AdamW(
    model.classifier.parameters(),
    lr=STAGE1_LR,
    weight_decay=WEIGHT_DECAY,
)


scheduler = ReduceLROnPlateau(
    optimizer,
    mode="max",
    factor=0.5,
    patience=1,
    min_lr=1e-7,
)


# ============================================================
# 19. TRAINING HISTORY
# ============================================================

history = []

best_val_f1 = -1.0

best_model_state = None

epochs_without_improvement = 0


# ============================================================
# 20. TRAINING LOOP
# ============================================================

for epoch in range(1, EPOCHS + 1):


    # --------------------------------------------------------
    # STAGE 2 STARTS AFTER STAGE1_EPOCHS
    # --------------------------------------------------------

    if epoch == STAGE1_EPOCHS + 1:

        print("\n" + "=" * 70)
        print("STAGE 2: FULL FINE-TUNING")
        print("=" * 70)


        # Unfreeze backbone
        for parameter in model.features.parameters():

            parameter.requires_grad = True


        # Discriminative learning rates:
        # lower LR for pretrained backbone
        # higher LR for new classifier
        optimizer = AdamW(
            [
                {
                    "params": model.features.parameters(),
                    "lr": STAGE2_BACKBONE_LR,
                },
                {
                    "params": model.classifier.parameters(),
                    "lr": STAGE2_CLASSIFIER_LR,
                },
            ],
            weight_decay=WEIGHT_DECAY,
        )


        scheduler = ReduceLROnPlateau(
            optimizer,
            mode="max",
            factor=0.5,
            patience=2,
            min_lr=1e-7,
        )


    # --------------------------------------------------------
    # TRAIN
    # --------------------------------------------------------

    (
        train_loss,
        train_acc,
        train_precision,
        train_recall,
        train_f1,
    ) = train_one_epoch(
        model,
        train_loader,
        criterion,
        optimizer,
    )


    # --------------------------------------------------------
    # VALIDATE
    # --------------------------------------------------------

    (
        val_loss,
        val_acc,
        val_precision,
        val_recall,
        val_f1,
    ) = validate(
        model,
        val_loader,
        criterion,
    )


    # --------------------------------------------------------
    # LEARNING RATE
    # --------------------------------------------------------

    scheduler.step(
        val_f1
    )


    current_lr = optimizer.param_groups[0][
        "lr"
    ]


    # --------------------------------------------------------
    # SAVE HISTORY
    # --------------------------------------------------------

    history.append(
        {
            "epoch": epoch,

            "train_loss": train_loss,
            "train_accuracy": train_acc,
            "train_precision": train_precision,
            "train_recall": train_recall,
            "train_macro_f1": train_f1,

            "val_loss": val_loss,
            "val_accuracy": val_acc,
            "val_precision": val_precision,
            "val_recall": val_recall,
            "val_macro_f1": val_f1,

            "learning_rate": current_lr,
        }
    )


    # --------------------------------------------------------
    # PRINT RESULTS
    # --------------------------------------------------------

    print("\n" + "-" * 70)

    print(
        f"Epoch {epoch:02d}/{EPOCHS}"
    )

    print(
        f"Train Loss      : {train_loss:.4f}"
    )

    print(
        f"Train Accuracy  : {train_acc:.4f}"
    )

    print(
        f"Train Macro F1  : {train_f1:.4f}"
    )

    print(
        f"Val Loss        : {val_loss:.4f}"
    )

    print(
        f"Val Accuracy    : {val_acc:.4f}"
    )

    print(
        f"Val Precision   : {val_precision:.4f}"
    )

    print(
        f"Val Recall      : {val_recall:.4f}"
    )

    print(
        f"Val Macro F1    : {val_f1:.4f}"
    )

    print(
        f"Learning Rate   : {current_lr:.7f}"
    )


    # --------------------------------------------------------
    # BEST MODEL
    # --------------------------------------------------------

    if val_f1 > best_val_f1:

        best_val_f1 = val_f1

        best_model_state = copy.deepcopy(
            model.state_dict()
        )

        torch.save(
            {
                "model_state_dict":
                    best_model_state,

                "class_names":
                    CLASS_NAMES,

                "num_classes":
                    NUM_CLASSES,

                "image_size":
                    IMAGE_SIZE,

                "best_val_macro_f1":
                    best_val_f1,
            },
            BEST_MODEL_PATH,
        )


        epochs_without_improvement = 0


        print(
            f"*** NEW BEST MODEL SAVED "
            f"(Val Macro F1: {best_val_f1:.4f}) ***"
        )


    else:

        epochs_without_improvement += 1

        print(
            f"No improvement for "
            f"{epochs_without_improvement} epoch(s)."
        )


    # --------------------------------------------------------
    # EARLY STOPPING
    # --------------------------------------------------------

    if (
        epochs_without_improvement
        >= EARLY_STOPPING_PATIENCE
    ):

        print(
            "\nEarly stopping triggered."
        )

        break


# ============================================================
# 21. SAVE TRAINING HISTORY
# ============================================================

history_df = pd.DataFrame(
    history
)


history_df.to_csv(
    HISTORY_PATH,
    index=False,
)


print("\n" + "=" * 70)
print("TRAINING HISTORY SAVED")
print("=" * 70)

print(HISTORY_PATH)


# ============================================================
# 22. RESTORE BEST MODEL
# ============================================================

if best_model_state is None:

    raise RuntimeError(
        "No best model was saved."
    )


model.load_state_dict(
    best_model_state
)


# ============================================================
# 23. SAVE FINAL MODEL
# ============================================================

torch.save(
    {
        "model_state_dict":
            model.state_dict(),

        "class_names":
            CLASS_NAMES,

        "num_classes":
            NUM_CLASSES,

        "image_size":
            IMAGE_SIZE,

        "best_val_macro_f1":
            best_val_f1,
    },
    FINAL_MODEL_PATH,
)


print("\n" + "=" * 70)
print("FINAL MODEL SAVED")
print("=" * 70)

print(FINAL_MODEL_PATH)


# ============================================================
# 24. TEST EVALUATION
# ============================================================

print("\n" + "=" * 70)
print("FINAL TEST EVALUATION")
print("=" * 70)


model.eval()

test_loss = 0.0

test_targets = []
test_predictions = []


with torch.no_grad():

    for images, targets in test_loader:

        images = images.to(
            DEVICE,
            non_blocking=True,
        )

        targets = targets.to(
            DEVICE,
            non_blocking=True,
        )


        outputs = model(images)


        loss = criterion(
            outputs,
            targets,
        )


        test_loss += (
            loss.item()
            * images.size(0)
        )


        predictions = torch.argmax(
            outputs,
            dim=1,
        )


        test_targets.extend(
            targets.cpu().numpy()
        )

        test_predictions.extend(
            predictions.cpu().numpy()
        )


test_loss /= len(
    test_loader.dataset
)


(
    test_accuracy,
    test_precision,
    test_recall,
    test_f1,
) = calculate_metrics(
    test_targets,
    test_predictions,
)


# ============================================================
# 25. CLASSIFICATION REPORT
# ============================================================

report = classification_report(
    test_targets,
    test_predictions,
    target_names=CLASS_NAMES,
    digits=4,
    zero_division=0,
)


# ============================================================
# 26. CONFUSION MATRIX
# ============================================================

cm = confusion_matrix(
    test_targets,
    test_predictions,
)


cm_df = pd.DataFrame(
    cm,
    index=CLASS_NAMES,
    columns=CLASS_NAMES,
)


cm_df.to_csv(
    CONFUSION_PATH
)


# ============================================================
# 27. SAVE REPORT
# ============================================================

with open(
    REPORT_PATH,
    "w",
    encoding="utf-8",
) as file:

    file.write(
        "IMPROVED MOBILENETV3 SMALL\n"
    )

    file.write(
        "=" * 70 + "\n\n"
    )

    file.write(
        f"Best Validation Macro F1 : "
        f"{best_val_f1:.4f}\n"
    )

    file.write(
        f"Test Loss                : "
        f"{test_loss:.4f}\n"
    )

    file.write(
        f"Test Accuracy            : "
        f"{test_accuracy:.4f}\n"
    )

    file.write(
        f"Test Precision           : "
        f"{test_precision:.4f}\n"
    )

    file.write(
        f"Test Recall              : "
        f"{test_recall:.4f}\n"
    )

    file.write(
        f"Test Macro F1            : "
        f"{test_f1:.4f}\n\n"
    )

    file.write(
        "CLASSIFICATION REPORT\n"
    )

    file.write(
        "=" * 70 + "\n"
    )

    file.write(
        report
    )

    file.write(
        "\n\nCONFUSION MATRIX\n"
    )

    file.write(
        "=" * 70 + "\n"
    )

    file.write(
        np.array2string(cm)
    )


# ============================================================
# 28. PRINT FINAL RESULTS
# ============================================================

print("\n" + "=" * 70)
print("FINAL RESULTS")
print("=" * 70)

print(
    f"\nBest Validation Macro F1 : "
    f"{best_val_f1:.4f}"
)

print(
    f"Test Loss                : "
    f"{test_loss:.4f}"
)

print(
    f"Test Accuracy            : "
    f"{test_accuracy:.4f}"
)

print(
    f"Test Precision           : "
    f"{test_precision:.4f}"
)

print(
    f"Test Recall              : "
    f"{test_recall:.4f}"
)

print(
    f"Test Macro F1            : "
    f"{test_f1:.4f}"
)


print("\n" + "=" * 70)
print("CLASSIFICATION REPORT")
print("=" * 70)

print(report)


print("\n" + "=" * 70)
print("CONFUSION MATRIX")
print("=" * 70)

print(cm_df)


# ============================================================
# 29. OUTPUT FILES
# ============================================================

print("\n" + "=" * 70)
print("OUTPUT FILES")
print("=" * 70)

print(
    f"\nBest Model:"
    f"\n{BEST_MODEL_PATH}"
)

print(
    f"\nFinal Model:"
    f"\n{FINAL_MODEL_PATH}"
)

print(
    f"\nClassification Report:"
    f"\n{REPORT_PATH}"
)

print(
    f"\nConfusion Matrix:"
    f"\n{CONFUSION_PATH}"
)

print(
    f"\nTraining History:"
    f"\n{HISTORY_PATH}"
)


print("\n" + "=" * 70)
print("TRAINING COMPLETED SUCCESSFULLY")
print("=" * 70)