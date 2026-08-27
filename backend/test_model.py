from app.ai.models.fabric_classifier import FabricClassifier
from app.ai.utils.dataset_loader import DatasetLoader

train_ds, val_ds, classes, class_weights = DatasetLoader.load_dataset(clean_first=False)

model = FabricClassifier.build_model(len(classes))
print("\n--- Initial Model (Frozen Backbone) ---")
trainable_p1 = sum([w.shape.num_elements() for w in model.trainable_weights])
non_trainable_p1 = sum([w.shape.num_elements() for w in model.non_trainable_weights])
print(f"Trainable Params    : {trainable_p1:,}")
print(f"Non-Trainable Params: {non_trainable_p1:,}")

model = FabricClassifier.unfreeze_top_layers(model, num_layers=40, learning_rate=1e-5)
print("\n--- Fine-Tuning Model (Unfrozen Top Layers) ---")
trainable_p2 = sum([w.shape.num_elements() for w in model.trainable_weights])
non_trainable_p2 = sum([w.shape.num_elements() for w in model.non_trainable_weights])
print(f"Trainable Params    : {trainable_p2:,}")
print(f"Non-Trainable Params: {non_trainable_p2:,}")