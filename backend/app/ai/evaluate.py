import json
import numpy as np
import matplotlib
matplotlib.use("Agg")  # Non-interactive backend for server/script execution
import matplotlib.pyplot as plt
import seaborn as sns
import tensorflow as tf

from sklearn.metrics import (
    classification_report,
    confusion_matrix,
    accuracy_score,
    f1_score,
)

from app.ai.utils.dataset_loader import DatasetLoader
from app.ai.utils.preprocessing import ImagePreprocessor
from app.ai.utils.config import MODEL_DIR, MODEL_NAME, OUTPUT_DIR

OUTPUT_DIR.mkdir(parents=True, exist_ok=True)


def main():
    print("============================================================")
    print("📊 Evaluating Fine-Tuned Fabric Classifier")
    print("============================================================")

    model_path = MODEL_DIR / MODEL_NAME
    if not model_path.exists():
        print(f"❌ Trained model not found at {model_path}. Please run train.py first.")
        return

    train_ds, val_ds, class_names, _ = DatasetLoader.load_dataset(clean_first=False)

    val_ds = ImagePreprocessor.preprocess_dataset(val_ds)

    print(f"📦 Loading model from {model_path}...")
    model = tf.keras.models.load_model(model_path)

    y_true = []
    y_pred = []

    for images, labels in val_ds:
        predictions = model.predict(images, verbose=0)
        predicted = np.argmax(predictions, axis=1)
        y_true.extend(labels.numpy())
        y_pred.extend(predicted)

    labels = list(range(len(class_names)))
    overall_acc = accuracy_score(y_true, y_pred)
    macro_f1 = f1_score(y_true, y_pred, average="macro", zero_division=0)
    weighted_f1 = f1_score(y_true, y_pred, average="weighted", zero_division=0)

    report_str = classification_report(
        y_true,
        y_pred,
        labels=labels,
        target_names=class_names,
        zero_division=0,
    )

    report_dict = classification_report(
        y_true,
        y_pred,
        labels=labels,
        target_names=class_names,
        zero_division=0,
        output_dict=True,
    )

    print("\n" + "=" * 80)
    print(f"CLASSIFICATION REPORT (Accuracy: {overall_acc:.4f} | Macro F1: {macro_f1:.4f} | Weighted F1: {weighted_f1:.4f})")
    print("=" * 80)
    print(report_str)
    print("=" * 80)

    # Export metrics JSON
    metrics_file = OUTPUT_DIR / "evaluation_metrics.json"
    metrics_payload = {
        "overall_accuracy": float(overall_acc),
        "macro_f1": float(macro_f1),
        "weighted_f1": float(weighted_f1),
        "num_classes": len(class_names),
        "class_metrics": report_dict,
    }

    with open(metrics_file, "w") as f:
        json.dump(metrics_payload, f, indent=2)
    print(f"✅ Saved evaluation metrics JSON to: {metrics_file}")

    # Plot & Save Confusion Matrix
    cm = confusion_matrix(
        y_true,
        y_pred,
        labels=labels,
    )

    plt.figure(figsize=(16, 14))
    sns.heatmap(
        cm,
        annot=True,
        fmt="d",
        cmap="Blues",
        xticklabels=class_names,
        yticklabels=class_names,
    )

    plt.title(f"Confusion Matrix - Fine-Tuned Fabric Classifier (Acc: {overall_acc:.2%})", fontsize=14)
    plt.xlabel("Predicted Class", fontsize=12)
    plt.ylabel("Actual Class", fontsize=12)
    plt.xticks(rotation=45, ha="right")
    plt.yticks(rotation=0)
    plt.tight_layout()

    cm_file = OUTPUT_DIR / "confusion_matrix.png"
    plt.savefig(cm_file, dpi=300)
    plt.close()

    print(f"🖼️ Saved confusion matrix plot to: {cm_file}")
    print("=" * 80)


if __name__ == "__main__":
    main()