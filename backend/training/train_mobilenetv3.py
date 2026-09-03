from pathlib import Path
import sys
import random
import csv

# ============================================================
# BACKEND PATH FIX
# ============================================================

BACKEND_DIR = Path(__file__).resolve().parent.parent

if str(BACKEND_DIR) not in sys.path:
    sys.path.insert(0, str(BACKEND_DIR))


# ============================================================
# IMPORTS
# ============================================================

import numpy as np
import torch
import torch.nn as nn

from torchvision.models import (
    mobilenet_v3_small,
    MobileNet_V3_Small_Weights,
)

from torch.optim import AdamW
from torch.optim.lr_scheduler import ReduceLROnPlateau

from sklearn.metrics import (
    accuracy_score,
    precision_recall_fscore_support,
    classification_report,
    confusion_matrix,
)

from preprocessing.dataset_loader import (
    create_dataloaders,
    print_dataset_info,
    CLASS_NAMES,
    NUM_CLASSES,
)


# ============================================================
# CONFIGURATION
# ============================================================

SEED = 42

# Faster training
EPOCHS = 15

LEARNING_RATE = 1e-4

WEIGHT_DECAY = 1e-4

DEVICE = torch.device(
    "cuda" if torch.cuda.is_available() else "cpu"
)


# ============================================================
# MODEL DIRECTORY
# ============================================================

MODEL_DIR = (
    BACKEND_DIR
    / "models"
    / "mobilenetv3"
)

MODEL_DIR.mkdir(
    parents=True,
    exist_ok=True
)


# ============================================================
# OUTPUT FILES
# ============================================================

BEST_MODEL_PATH = (
    MODEL_DIR
    / "mobilenetv3_small_best.pth"
)

FINAL_MODEL_PATH = (
    MODEL_DIR
    / "mobilenetv3_small_final.pth"
)

REPORT_PATH = (
    MODEL_DIR
    / "mobilenetv3_small_classification_report.txt"
)

CONFUSION_MATRIX_PATH = (
    MODEL_DIR
    / "mobilenetv3_small_confusion_matrix.csv"
)

HISTORY_PATH = (
    MODEL_DIR
    / "mobilenetv3_small_training_history.csv"
)


# ============================================================
# REPRODUCIBILITY
# ============================================================

random.seed(SEED)

np.random.seed(SEED)

torch.manual_seed(SEED)

if torch.cuda.is_available():
    torch.cuda.manual_seed_all(SEED)


# ============================================================
# START
# ============================================================

print("\n" + "=" * 70)
print("MOBILENETV3 SMALL - TEXTILE FABRIC CLASSIFICATION")
print("=" * 70)

print(f"Backend directory : {BACKEND_DIR}")
print(f"Device            : {DEVICE}")
print(f"Number of classes : {NUM_CLASSES}")
print(f"Epochs            : {EPOCHS}")
print(f"Learning rate     : {LEARNING_RATE}")
print(f"Weight decay      : {WEIGHT_DECAY}")


# ============================================================
# CLASS MAPPING
# ============================================================

print("\nClass mapping:")

for index, class_name in enumerate(CLASS_NAMES):

    print(
        f"  {index}: {class_name}"
    )


# ============================================================
# LOAD DATA
# ============================================================

print("\n" + "=" * 70)
print("LOADING DATASET")
print("=" * 70)

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


# ============================================================
# CREATE MOBILENETV3 SMALL
# ============================================================

print("\n" + "=" * 70)
print("CREATING MOBILENETV3 SMALL")
print("=" * 70)

print(
    "Loading ImageNet pretrained MobileNetV3 Small..."
)


model = mobilenet_v3_small(
    weights=MobileNet_V3_Small_Weights.DEFAULT
)


# ============================================================
# REPLACE FINAL CLASSIFIER
# ============================================================

in_features = (
    model.classifier[-1].in_features
)

model.classifier[-1] = nn.Linear(
    in_features,
    NUM_CLASSES
)


model = model.to(DEVICE)


print("\nFinal classifier:")

print(model.classifier)


# ============================================================
# LOSS FUNCTION
# ============================================================

criterion = nn.CrossEntropyLoss()


# ============================================================
# OPTIMIZER
# ============================================================

optimizer = AdamW(
    model.parameters(),
    lr=LEARNING_RATE,
    weight_decay=WEIGHT_DECAY
)


# ============================================================
# LEARNING RATE SCHEDULER
# ============================================================

scheduler = ReduceLROnPlateau(
    optimizer,
    mode="max",
    factor=0.5,
    patience=2,
    min_lr=1e-7
)


# ============================================================
# TRAINING HISTORY
# ============================================================

history = []

best_val_f1 = -1.0


# ============================================================
# TRAIN ONE EPOCH
# ============================================================

def train_one_epoch():

    model.train()

    running_loss = 0.0

    all_predictions = []

    all_targets = []


    for images, labels in train_loader:

        images = images.to(
            DEVICE,
            non_blocking=True
        )

        labels = labels.to(
            DEVICE,
            non_blocking=True
        )


        # ----------------------------------------------------
        # CLEAR GRADIENTS
        # ----------------------------------------------------

        optimizer.zero_grad()


        # ----------------------------------------------------
        # FORWARD PASS
        # ----------------------------------------------------

        outputs = model(images)


        # ----------------------------------------------------
        # LOSS
        # ----------------------------------------------------

        loss = criterion(
            outputs,
            labels
        )


        # ----------------------------------------------------
        # BACKPROPAGATION
        # ----------------------------------------------------

        loss.backward()


        # ----------------------------------------------------
        # UPDATE WEIGHTS
        # ----------------------------------------------------

        optimizer.step()


        # ----------------------------------------------------
        # LOSS TRACKING
        # ----------------------------------------------------

        running_loss += (
            loss.item()
            * images.size(0)
        )


        # ----------------------------------------------------
        # PREDICTIONS
        # ----------------------------------------------------

        predictions = torch.argmax(
            outputs,
            dim=1
        )


        all_predictions.extend(
            predictions.detach()
            .cpu()
            .numpy()
        )


        all_targets.extend(
            labels.detach()
            .cpu()
            .numpy()
        )


    # ========================================================
    # METRICS
    # ========================================================

    epoch_loss = (
        running_loss
        / len(train_loader.dataset)
    )


    accuracy = accuracy_score(
        all_targets,
        all_predictions
    )


    precision, recall, f1, _ = (
        precision_recall_fscore_support(
            all_targets,
            all_predictions,
            average="macro",
            zero_division=0
        )
    )


    return (
        epoch_loss,
        accuracy,
        precision,
        recall,
        f1
    )


# ============================================================
# VALIDATION
# ============================================================

def validate():

    model.eval()

    running_loss = 0.0

    all_predictions = []

    all_targets = []


    with torch.no_grad():

        for images, labels in val_loader:

            images = images.to(
                DEVICE,
                non_blocking=True
            )

            labels = labels.to(
                DEVICE,
                non_blocking=True
            )


            # ------------------------------------------------
            # FORWARD
            # ------------------------------------------------

            outputs = model(images)


            # ------------------------------------------------
            # LOSS
            # ------------------------------------------------

            loss = criterion(
                outputs,
                labels
            )


            running_loss += (
                loss.item()
                * images.size(0)
            )


            # ------------------------------------------------
            # PREDICTION
            # ------------------------------------------------

            predictions = torch.argmax(
                outputs,
                dim=1
            )


            all_predictions.extend(
                predictions
                .cpu()
                .numpy()
            )


            all_targets.extend(
                labels
                .cpu()
                .numpy()
            )


    # ========================================================
    # METRICS
    # ========================================================

    epoch_loss = (
        running_loss
        / len(val_loader.dataset)
    )


    accuracy = accuracy_score(
        all_targets,
        all_predictions
    )


    precision, recall, f1, _ = (
        precision_recall_fscore_support(
            all_targets,
            all_predictions,
            average="macro",
            zero_division=0
        )
    )


    return (
        epoch_loss,
        accuracy,
        precision,
        recall,
        f1
    )


# ============================================================
# TRAINING LOOP
# ============================================================

print("\n" + "=" * 70)
print("STARTING MOBILENETV3 SMALL TRAINING")
print("=" * 70)

print(
    "\nTraining for "
    f"{EPOCHS} epochs..."
)

print(
    "Best model will be selected using Validation Macro F1."
)


for epoch in range(
    1,
    EPOCHS + 1
):

    print("\n" + "-" * 70)

    print(
        f"Epoch {epoch}/{EPOCHS}"
    )

    print("-" * 70)


    # ========================================================
    # TRAIN
    # ========================================================

    (
        train_loss,
        train_accuracy,
        train_precision,
        train_recall,
        train_f1
    ) = train_one_epoch()


    # ========================================================
    # VALIDATION
    # ========================================================

    (
        val_loss,
        val_accuracy,
        val_precision,
        val_recall,
        val_f1
    ) = validate()


    # ========================================================
    # SCHEDULER
    # ========================================================

    scheduler.step(
        val_f1
    )


    current_lr = (
        optimizer
        .param_groups[0]["lr"]
    )


    # ========================================================
    # PRINT RESULTS
    # ========================================================

    print(
        f"Train Loss      : {train_loss:.4f}"
    )

    print(
        f"Train Accuracy  : {train_accuracy:.4f}"
    )

    print(
        f"Train Precision : {train_precision:.4f}"
    )

    print(
        f"Train Recall    : {train_recall:.4f}"
    )

    print(
        f"Train Macro F1  : {train_f1:.4f}"
    )

    print()

    print(
        f"Val Loss        : {val_loss:.4f}"
    )

    print(
        f"Val Accuracy    : {val_accuracy:.4f}"
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

    print()

    print(
        f"Learning Rate   : {current_lr:.8f}"
    )


    # ========================================================
    # SAVE HISTORY
    # ========================================================

    history.append({

        "epoch": epoch,

        "train_loss": train_loss,

        "train_accuracy": train_accuracy,

        "train_precision": train_precision,

        "train_recall": train_recall,

        "train_f1": train_f1,

        "val_loss": val_loss,

        "val_accuracy": val_accuracy,

        "val_precision": val_precision,

        "val_recall": val_recall,

        "val_f1": val_f1,

        "learning_rate": current_lr,

    })


    # ========================================================
    # SAVE BEST MODEL
    # ========================================================

    if val_f1 > best_val_f1:

        best_val_f1 = val_f1


        checkpoint = {

            "model_name":
                "MobileNetV3-Small",

            "model_state_dict":
                model.state_dict(),

            "class_names":
                CLASS_NAMES,

            "num_classes":
                NUM_CLASSES,

            "image_size":
                224,

            "best_val_f1":
                best_val_f1,

        }


        torch.save(
            checkpoint,
            BEST_MODEL_PATH
        )


        print(
            "\n✓ BEST MODEL SAVED"
        )

        print(
            f"  Validation Macro F1: "
            f"{best_val_f1:.4f}"
        )

        print(
            f"  Path: {BEST_MODEL_PATH}"
        )


# ============================================================
# SAVE FINAL MODEL
# ============================================================

final_checkpoint = {

    "model_name":
        "MobileNetV3-Small",

    "model_state_dict":
        model.state_dict(),

    "class_names":
        CLASS_NAMES,

    "num_classes":
        NUM_CLASSES,

    "image_size":
        224,

}


torch.save(
    final_checkpoint,
    FINAL_MODEL_PATH
)


print(
    "\n✓ FINAL MODEL SAVED"
)

print(
    FINAL_MODEL_PATH
)


# ============================================================
# SAVE TRAINING HISTORY
# ============================================================

if len(history) > 0:

    with open(
        HISTORY_PATH,
        "w",
        newline="",
        encoding="utf-8"
    ) as file:

        writer = csv.DictWriter(
            file,
            fieldnames=history[0].keys()
        )

        writer.writeheader()

        writer.writerows(history)


print(
    "\n✓ TRAINING HISTORY SAVED"
)

print(
    HISTORY_PATH
)


# ============================================================
# LOAD BEST MODEL
# ============================================================

print(
    "\n" + "=" * 70
)

print(
    "LOADING BEST MODEL"
)

print(
    "=" * 70
)


checkpoint = torch.load(
    BEST_MODEL_PATH,
    map_location=DEVICE
)


model.load_state_dict(
    checkpoint["model_state_dict"]
)


model.eval()


print(
    "✓ Best MobileNetV3 Small model loaded."
)


# ============================================================
# TEST EVALUATION
# ============================================================

print("\n" + "=" * 70)

print(
    "FINAL TEST EVALUATION"
)

print("=" * 70)


all_predictions = []

all_targets = []

all_probabilities = []

test_loss = 0.0


with torch.no_grad():

    for images, labels in test_loader:

        images = images.to(
            DEVICE,
            non_blocking=True
        )

        labels = labels.to(
            DEVICE,
            non_blocking=True
        )


        # ----------------------------------------------------
        # FORWARD
        # ----------------------------------------------------

        outputs = model(images)


        # ----------------------------------------------------
        # LOSS
        # ----------------------------------------------------

        loss = criterion(
            outputs,
            labels
        )


        test_loss += (
            loss.item()
            * images.size(0)
        )


        # ----------------------------------------------------
        # PROBABILITIES
        # ----------------------------------------------------

        probabilities = torch.softmax(
            outputs,
            dim=1
        )


        # ----------------------------------------------------
        # PREDICTIONS
        # ----------------------------------------------------

        predictions = torch.argmax(
            probabilities,
            dim=1
        )


        all_probabilities.extend(
            probabilities
            .cpu()
            .numpy()
        )


        all_predictions.extend(
            predictions
            .cpu()
            .numpy()
        )


        all_targets.extend(
            labels
            .cpu()
            .numpy()
        )


# ============================================================
# TEST LOSS
# ============================================================

test_loss /= len(
    test_loader.dataset
)


# ============================================================
# TEST METRICS
# ============================================================

test_accuracy = accuracy_score(
    all_targets,
    all_predictions
)


(
    test_precision,
    test_recall,
    test_f1,
    _
) = precision_recall_fscore_support(

    all_targets,

    all_predictions,

    average="macro",

    zero_division=0
)


# ============================================================
# PRINT TEST RESULTS
# ============================================================

print(
    f"\nTest Loss      : {test_loss:.4f}"
)

print(
    f"Test Accuracy  : {test_accuracy:.4f}"
)

print(
    f"Test Precision : {test_precision:.4f}"
)

print(
    f"Test Recall    : {test_recall:.4f}"
)

print(
    f"Test Macro F1  : {test_f1:.4f}"
)


# ============================================================
# CLASSIFICATION REPORT
# ============================================================

report = classification_report(

    all_targets,

    all_predictions,

    target_names=CLASS_NAMES,

    digits=4,

    zero_division=0
)


print(
    "\nClassification Report:"
)

print(
    report
)


# ============================================================
# SAVE CLASSIFICATION REPORT
# ============================================================

with open(
    REPORT_PATH,
    "w",
    encoding="utf-8"
) as file:

    file.write(
        "MobileNetV3 Small "
        "Textile Classification\n"
    )

    file.write(
        "=" * 70
        + "\n\n"
    )

    file.write(
        f"Model: MobileNetV3 Small\n"
    )

    file.write(
        f"Number of Classes: "
        f"{NUM_CLASSES}\n"
    )

    file.write(
        f"Test Loss: "
        f"{test_loss:.4f}\n"
    )

    file.write(
        f"Test Accuracy: "
        f"{test_accuracy:.4f}\n"
    )

    file.write(
        f"Test Precision: "
        f"{test_precision:.4f}\n"
    )

    file.write(
        f"Test Recall: "
        f"{test_recall:.4f}\n"
    )

    file.write(
        f"Test Macro F1: "
        f"{test_f1:.4f}\n\n"
    )

    file.write(
        "Classification Report\n"
    )

    file.write(
        "-" * 70
        + "\n"
    )

    file.write(
        report
    )


print(
    "\n✓ CLASSIFICATION REPORT SAVED"
)

print(
    REPORT_PATH
)


# ============================================================
# CONFUSION MATRIX
# ============================================================

cm = confusion_matrix(

    all_targets,

    all_predictions

)


# ============================================================
# PRINT CONFUSION MATRIX
# ============================================================

print(
    "\nConfusion Matrix:"
)

print(
    cm
)


# ============================================================
# SAVE CONFUSION MATRIX
# ============================================================

with open(

    CONFUSION_MATRIX_PATH,

    "w",

    newline="",

    encoding="utf-8"

) as file:

    writer = csv.writer(file)


    writer.writerow(
        ["Actual / Predicted"]
        + CLASS_NAMES
    )


    for index, row in enumerate(cm):

        writer.writerow(

            [CLASS_NAMES[index]]
            + row.tolist()

        )


print(
    "\n✓ CONFUSION MATRIX SAVED"
)

print(
    CONFUSION_MATRIX_PATH
)


# ============================================================
# FINAL SUMMARY
# ============================================================

print("\n" + "=" * 70)

print(
    "MOBILENETV3 SMALL TRAINING COMPLETE"
)

print("=" * 70)


print(
    f"\nBest Validation Macro F1: "
    f"{best_val_f1:.4f}"
)


print(
    f"Final Test Accuracy: "
    f"{test_accuracy:.4f}"
)


print(
    f"Final Test Macro F1: "
    f"{test_f1:.4f}"
)


print(
    "\nModel: MobileNetV3 Small"
)


print(
    "\nClasses:"
)


for index, name in enumerate(
    CLASS_NAMES
):

    print(
        f"  {index}: {name}"
    )


print(
    "\nSaved files:"
)

print(
    f"  Best model  : "
    f"{BEST_MODEL_PATH}"
)

print(
    f"  Final model : "
    f"{FINAL_MODEL_PATH}"
)

print(
    f"  Report      : "
    f"{REPORT_PATH}"
)

print(
    f"  Confusion   : "
    f"{CONFUSION_MATRIX_PATH}"
)

print(
    f"  History     : "
    f"{HISTORY_PATH}"
)


print(
    "\n✓ MobileNetV3 Small is ready for inference."
)

print(
    "=" * 70
)
