import os
import tensorflow as tf

from app.ai.models.fabric_classifier import FabricClassifier
from app.ai.utils.dataset_loader import DatasetLoader
from app.ai.utils.config import (
    MODEL_DIR,
    MODEL_NAME,
)

os.makedirs(MODEL_DIR, exist_ok=True)

# 1. Load Cleaned Class-Balanced Dataset & Multi-Input Generators
print("============================================================")
print("1. Loading Cleaned Dataset with Oversampling & Multi-Input Feature Extraction")
print("============================================================")
train_ds, val_ds, classes, class_weights = DatasetLoader.load_dataset(clean_first=True, target_min_samples=350)

num_classes = len(classes)
print(f"\n✅ Total Active Fabric Classes: {num_classes}")

# 2. Phase 1: Train Classification Fusion Head (Frozen Backbone)
print("\n============================================================")
print("2. Phase 1: Feature Extraction & Fusion Head Training (Frozen EfficientNet Backbone)")
print("============================================================")
model = FabricClassifier.build_model(num_classes=num_classes, num_features=16, learning_rate=1e-3)

callbacks_phase1 = [
    tf.keras.callbacks.EarlyStopping(
        monitor="val_accuracy",
        patience=4,
        restore_best_weights=True,
    ),
    tf.keras.callbacks.ReduceLROnPlateau(
        monitor="val_loss",
        factor=0.5,
        patience=2,
        min_lr=1e-5,
    ),
]

history_phase1 = model.fit(
    train_ds,
    validation_data=val_ds,
    epochs=10,
    callbacks=callbacks_phase1,
)

p1_best_acc = max(history_phase1.history.get("val_accuracy", [0]))
print(f"✅ Phase 1 Complete. Best Validation Accuracy: {p1_best_acc:.4f}")

# 3. Phase 2: Fine-Tuning Backbone Top Layers
print("\n============================================================")
print("3. Phase 2: Backbone Fine-Tuning (Unfreezing Top Layers)")
print("============================================================")
model = FabricClassifier.unfreeze_top_layers(model, num_layers=50, learning_rate=1e-5)

checkpoint_path = MODEL_DIR / MODEL_NAME

callbacks_phase2 = [
    tf.keras.callbacks.ModelCheckpoint(
        filepath=checkpoint_path,
        save_best_only=True,
        monitor="val_accuracy",
        verbose=1,
    ),
    tf.keras.callbacks.EarlyStopping(
        monitor="val_accuracy",
        patience=5,
        restore_best_weights=True,
    ),
    tf.keras.callbacks.ReduceLROnPlateau(
        monitor="val_loss",
        factor=0.2,
        patience=3,
        min_lr=1e-7,
    ),
]

history_phase2 = model.fit(
    train_ds,
    validation_data=val_ds,
    epochs=15,
    callbacks=callbacks_phase2,
)

p2_best_acc = max(history_phase2.history.get("val_accuracy", [0]))

print("\n============================================================")
print("🎉 Retraining Complete")
print("============================================================")
print(f"Phase 1 Best Val Accuracy : {p1_best_acc:.4f}")
print(f"Phase 2 Best Val Accuracy : {p2_best_acc:.4f}")
print(f"Saved Best Model File     : {checkpoint_path}")
print("============================================================")