print("Step 1")

from app.ml.dataset_loader import load_datasets

print("Step 2")

from app.ml.preprocess import prepare_dataset

print("Step 3")

from app.ml.model import build_model

from tensorflow.keras.callbacks import (
    EarlyStopping,
    ModelCheckpoint,
    ReduceLROnPlateau,
)

print("Step 4")

# Load Dataset
train_dataset, validation_dataset, class_names = load_datasets()

# Preprocess Dataset
train_dataset = prepare_dataset(train_dataset, training=True)
validation_dataset = prepare_dataset(validation_dataset, training=False)

print("Classes:", class_names)

print("Step 5")

# Build Model
model = build_model(len(class_names))

print("Step 6")

model.summary()

early_stop = EarlyStopping(
    monitor="val_loss",
    patience=5,
    restore_best_weights=True,
)

checkpoint = ModelCheckpoint(
    "app/saved_models/best_model_aug.keras",
    monitor="val_accuracy",
    save_best_only=True,
    verbose=1,
)

reduce_lr = ReduceLROnPlateau(
    monitor="val_loss",
    factor=0.2,
    patience=2,
    min_lr=1e-6,
    verbose=1,
)
# -------------------------
# Train Model
# -------------------------

history = model.fit(
    train_dataset,
    validation_data=validation_dataset,
    epochs=30,
    callbacks=[
        early_stop,
        checkpoint,
        reduce_lr,
    ],
)    

print("\n✅ Model Saved Successfully!")

