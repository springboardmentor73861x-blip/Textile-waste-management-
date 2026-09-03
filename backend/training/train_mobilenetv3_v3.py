# ============================================================
# AI TEXTILE WASTE INTELLIGENCE PLATFORM
# MobileNetV3 Small - V3 Training
# ============================================================

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
from torchvision.datasets import ImageFolder
from torchvision.models import (
    mobilenet_v3_small,
    MobileNet_V3_Small_Weights,
)

from torch.utils.data import (
    DataLoader,
    WeightedRandomSampler,
)

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

EPOCHS = 20

# First few epochs: classifier only
WARMUP_EPOCHS = 2

# Learning rates
CLASSIFIER_LR = 3e-4
BACKBONE_LR = 1e-5

WEIGHT_DECAY = 1e-4

# Mild label smoothing
LABEL_SMOOTHING = 0.03

NUM_WORKERS = 0

EARLY_STOPPING_PATIENCE = 6


# ============================================================
# 3. OUTPUT FILES
# ============================================================

MODEL_DIR = (
    BACKEND_DIR
    / "models"
    / "mobilenetv3"
)

MODEL_DIR.mkdir(
    parents=True,
    exist_ok=True,
)


BEST_MODEL_PATH = (
    MODEL_DIR
    / "mobilenetv3_small_v3_best.pth"
)

FINAL_MODEL_PATH = (
    MODEL_DIR
    / "mobilenetv3_small_v3_final.pth"
)

REPORT_PATH = (
    MODEL_DIR
    / "mobilenetv3_small_v3_classification_report.txt"
)

CONFUSION_PATH = (
    MODEL_DIR
    / "mobilenetv3_small_v3_confusion_matrix.csv"
)

HISTORY_PATH = (
    MODEL_DIR
    / "mobilenetv3_small_v3_training_history.csv"
)


# ============================================================
# 4. RANDOM SEED
# ============================================================

def set_seed(seed=42):

    random.seed(seed)

    np.random.seed(seed)

    torch.manual_seed(seed)

    if torch.cuda.is_available():

        torch.cuda.manual_seed(seed)
        torch.cuda.manual_seed_all(seed)

    torch.backends.cudnn.deterministic = True
    torch.backends.cudnn.benchmark = False


set_seed(SEED)


# ============================================================
# 5. DEVICE
# ============================================================

DEVICE = torch.device(
    "cuda"
    if torch.cuda.is_available()
    else "cpu"
)


print("=" * 70)
print("MOBILENETV3 SMALL V3 TRAINING")
print("=" * 70)

print(f"Device          : {DEVICE}")
print(f"Image Size      : {IMAGE_SIZE}")
print(f"Batch Size      : {BATCH_SIZE}")
print(f"Epochs          : {EPOCHS}")
print(f"Warmup Epochs   : {WARMUP_EPOCHS}")
print(f"Classes         : {CLASS_NAMES}")
print()


# ============================================================
# 6. TRANSFORMS
# ============================================================

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
# TRAIN
# ------------------------------------------------------------
#
# Mild augmentation.
#
# We intentionally avoid the aggressive augmentation used
# in the previous improved version.
#

train_transform = transforms.Compose([

    transforms.Resize(
        (IMAGE_SIZE, IMAGE_SIZE)
    ),

    transforms.RandomHorizontalFlip(
        p=0.5
    ),

    transforms.RandomRotation(
        degrees=8
    ),

    transforms.ColorJitter(
        brightness=0.12,
        contrast=0.12,
        saturation=0.08,
        hue=0.02,
    ),

    transforms.ToTensor(),

    transforms.Normalize(
        IMAGENET_MEAN,
        IMAGENET_STD,
    ),
])


# ------------------------------------------------------------
# VALIDATION / TEST
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
# 7. LOAD DATASETS
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
# 8. VERIFY CLASS ORDER
# ============================================================

expected_class_to_idx = {
    name: index
    for index, name in enumerate(CLASS_NAMES)
}


print("\nDataset class mappings:")

print(
    "Train:",
    train_dataset.class_to_idx
)

print(
    "Valid:",
    val_dataset.class_to_idx
)

print(
    "Test :",
    test_dataset.class_to_idx
)


if train_dataset.class_to_idx != expected_class_to_idx:

    raise ValueError(
        "\nTraining class order mismatch.\n"
        f"Expected: {expected_class_to_idx}\n"
        f"Found   : {train_dataset.class_to_idx}"
    )


if val_dataset.class_to_idx != expected_class_to_idx:

    raise ValueError(
        "\nValidation class order mismatch.\n"
        f"Expected: {expected_class_to_idx}\n"
        f"Found   : {val_dataset.class_to_idx}"
    )


if test_dataset.class_to_idx != expected_class_to_idx:

    raise ValueError(
        "\nTest class order mismatch.\n"
        f"Expected: {expected_class_to_idx}\n"
        f"Found   : {test_dataset.class_to_idx}"
    )


print(
    "\nClass order verified successfully."
)


# ============================================================
# 9. DATASET SIZE
# ============================================================

print("\nDataset sizes:")

print(
    f"Train : {len(train_dataset)}"
)

print(
    f"Valid : {len(val_dataset)}"
)

print(
    f"Test  : {len(test_dataset)}"
)


# ============================================================
# 10. CLASS DISTRIBUTION
# ============================================================

train_targets = np.array(
    train_dataset.targets
)


class_counts = np.bincount(
    train_targets,
    minlength=NUM_CLASSES,
)


print("\nTraining class distribution:")

for name, count in zip(
    CLASS_NAMES,
    class_counts,
):

    print(
        f"{name:<20} : {count}"
    )


# ============================================================
# 11. BALANCED SAMPLER
# ============================================================

class_weights = (
    1.0
    / np.maximum(
        class_counts,
        1
    )
)


sample_weights = (
    class_weights[
        train_targets
    ]
)


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
# 12. DATA LOADERS
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
    f"Train batches : {len(train_loader)}"
)

print(
    f"Valid batches : {len(val_loader)}"
)

print(
    f"Test batches  : {len(test_loader)}"
)


# ============================================================
# 13. LOAD MOBILENETV3 SMALL
# ============================================================

print("\n" + "=" * 70)
print("LOADING PRETRAINED MOBILENETV3 SMALL")
print("=" * 70)


weights = (
    MobileNet_V3_Small_Weights.DEFAULT
)


model = mobilenet_v3_small(
    weights=weights
)


# ============================================================
# 14. REPLACE CLASSIFIER
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
    f"Classifier output: {NUM_CLASSES}"
)


# ============================================================
# 15. LOSS
# ============================================================

criterion = nn.CrossEntropyLoss(
    label_smoothing=LABEL_SMOOTHING
)


# ============================================================
# 16. METRICS
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
# 17. TRAIN FUNCTION
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


        optimizer.zero_grad(
            set_to_none=True
        )


        outputs = model(
            images
        )


        loss = criterion(
            outputs,
            targets,
        )


        loss.backward()


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
        running_loss
        / len(loader.dataset)
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
# 18. VALIDATION FUNCTION
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


            outputs = model(
                images
            )


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
        running_loss
        / len(loader.dataset)
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
# 19. STAGE 1 - FREEZE BACKBONE
# ============================================================

print("\n" + "=" * 70)
print("STAGE 1 - CLASSIFIER WARMUP")
print("=" * 70)


for parameter in model.features.parameters():

    parameter.requires_grad = False


for parameter in model.classifier.parameters():

    parameter.requires_grad = True


optimizer = AdamW(
    model.classifier.parameters(),
    lr=CLASSIFIER_LR,
    weight_decay=WEIGHT_DECAY,
)


scheduler = ReduceLROnPlateau(
    optimizer,
    mode="max",
    factor=0.5,
    patience=2,
    min_lr=1e-7,
)


# ============================================================
# 20. TRAINING HISTORY
# ============================================================

history = []

best_val_f1 = -1.0

best_model_state = None

epochs_without_improvement = 0


# ============================================================
# 21. MAIN TRAINING LOOP
# ============================================================

for epoch in range(
    1,
    EPOCHS + 1
):


    # --------------------------------------------------------
    # UNFREEZE AFTER WARMUP
    # --------------------------------------------------------

    if epoch == WARMUP_EPOCHS + 1:

        print("\n" + "=" * 70)
        print("STAGE 2 - FULL FINE-TUNING")
        print("=" * 70)


        for parameter in model.features.parameters():

            parameter.requires_grad = True


        optimizer = AdamW(
            [
                {
                    "params":
                        model.features.parameters(),

                    "lr":
                        BACKBONE_LR,
                },

                {
                    "params":
                        model.classifier.parameters(),

                    "lr":
                        CLASSIFIER_LR,
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
        train_accuracy,
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
        val_accuracy,
        val_precision,
        val_recall,
        val_f1,
    ) = validate(
        model,
        val_loader,
        criterion,
    )


    # --------------------------------------------------------
    # SCHEDULER
    # --------------------------------------------------------

    scheduler.step(
        val_f1
    )


    # --------------------------------------------------------
    # CURRENT LR
    # --------------------------------------------------------

    current_lr = (
        optimizer.param_groups[0]["lr"]
    )


    # --------------------------------------------------------
    # SAVE HISTORY
    # --------------------------------------------------------

    history.append(
        {
            "epoch": epoch,

            "train_loss":
                train_loss,

            "train_accuracy":
                train_accuracy,

            "train_precision":
                train_precision,

            "train_recall":
                train_recall,

            "train_macro_f1":
                train_f1,

            "val_loss":
                val_loss,

            "val_accuracy":
                val_accuracy,

            "val_precision":
                val_precision,

            "val_recall":
                val_recall,

            "val_macro_f1":
                val_f1,

            "learning_rate":
                current_lr,
        }
    )


    # --------------------------------------------------------
    # PRINT
    # --------------------------------------------------------

    print("\n" + "-" * 70)

    print(
        f"Epoch {epoch:02d}/{EPOCHS}"
    )

    print(
        f"Train Loss     : {train_loss:.4f}"
    )

    print(
        f"Train Accuracy : {train_accuracy:.4f}"
    )

    print(
        f"Train Macro F1 : {train_f1:.4f}"
    )

    print(
        f"Val Loss       : {val_loss:.4f}"
    )

    print(
        f"Val Accuracy   : {val_accuracy:.4f}"
    )

    print(
        f"Val Precision  : {val_precision:.4f}"
    )

    print(
        f"Val Recall     : {val_recall:.4f}"
    )

    print(
        f"Val Macro F1   : {val_f1:.4f}"
    )

    print(
        f"Learning Rate  : {current_lr:.7f}"
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
# 22. SAVE HISTORY
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
# 23. RESTORE BEST MODEL
# ============================================================

if best_model_state is None:

    raise RuntimeError(
        "No best model was created."
    )


model.load_state_dict(
    best_model_state
)


# ============================================================
# 24. SAVE FINAL MODEL
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
# 25. TEST EVALUATION
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


        outputs = model(
            images
        )


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
# 26. CLASSIFICATION REPORT
# ============================================================

report = classification_report(
    test_targets,
    test_predictions,
    target_names=CLASS_NAMES,
    digits=4,
    zero_division=0,
)


# ============================================================
# 27. CONFUSION MATRIX
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
# 28. SAVE REPORT
# ============================================================

with open(
    REPORT_PATH,
    "w",
    encoding="utf-8",
) as file:

    file.write(
        "MOBILENETV3 SMALL V3\n"
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
# 29. FINAL OUTPUT
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
# 30. FILE LOCATIONS
# ============================================================

print("\n" + "=" * 70)
print("OUTPUT FILES")
print("=" * 70)

print(
    f"\nBest Model:\n{BEST_MODEL_PATH}"
)

print(
    f"\nFinal Model:\n{FINAL_MODEL_PATH}"
)

print(
    f"\nClassification Report:\n{REPORT_PATH}"
)

print(
    f"\nConfusion Matrix:\n{CONFUSION_PATH}"
)

print(
    f"\nTraining History:\n{HISTORY_PATH}"
)


print("\n" + "=" * 70)
print("V3 TRAINING COMPLETED SUCCESSFULLY")
print("=" * 70)