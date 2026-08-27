from app.ai.utils.dataset_loader import DatasetLoader

train_ds, val_ds, classes, class_weights = DatasetLoader.load_dataset(clean_first=True)

print("=" * 60)
print("Number of Active Classes:", len(classes))
print("Class List:", classes)
print("Class Weights (First 5):", {classes[k]: round(v, 3) for k, v in list(class_weights.items())[:5]})
print("=" * 60)

for inputs, labels in train_ds.take(1):
    print("Image Input Batch Shape   :", inputs["image_input"].shape)
    print("Feature Input Batch Shape :", inputs["feature_input"].shape)
    print("Label Batch Shape         :", labels.shape)