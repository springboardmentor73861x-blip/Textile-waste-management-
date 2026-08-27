from app.ai.utils.dataset_loader import DatasetLoader
from app.ai.utils.preprocessing import ImagePreprocessor

train_ds, val_ds, classes, class_weights = DatasetLoader.load_dataset()

train_ds = ImagePreprocessor.preprocess_dataset(train_ds)

for images, labels in train_ds.take(1):

    print("=" * 60)

    print(images.dtype)

    print(images.numpy().min())

    print(images.numpy().max())

    print(images.shape)

    print(labels.shape)