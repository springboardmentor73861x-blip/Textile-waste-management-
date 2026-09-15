import tensorflow as tf

print("Step 1")

from app.ml.dataset_loader import load_datasets

print("Step 2")

from app.ml.preprocess import prepare_dataset

print("Step 3")

_, validation_dataset, class_names = load_datasets()

print("Classes:", len(class_names))

validation_dataset = prepare_dataset(validation_dataset, training=False)

print("Step 4")

model = tf.keras.models.load_model(
    "app/saved_models/textile_efficientnetb1_clean_best.keras",
    compile=False
)

print("Step 5")

print("Evaluating...")

loss, accuracy = model.evaluate(validation_dataset, verbose=1)

print("Step 6")

print(f"Validation Accuracy : {accuracy * 100:.2f}%")
print(f"Validation Loss : {loss:.4f}")