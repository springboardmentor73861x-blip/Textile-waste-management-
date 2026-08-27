import random
import shutil
from pathlib import Path

random.seed(42)

SOURCE_DIR = Path("app/ai_training/datasets/TFD Textile Dataset")
OUTPUT_DIR = Path("app/ai_training/datasets")

TRAIN_RATIO = 0.8
VALID_RATIO = 0.1


def split_dataset():

    classes = [
        folder
        for folder in SOURCE_DIR.iterdir()
        if folder.is_dir()
    ]

    for class_dir in classes:

        # Only PNG images
        images = list(class_dir.glob("*.png"))

        random.shuffle(images)

        train_end = int(len(images) * TRAIN_RATIO)
        valid_end = int(len(images) * (TRAIN_RATIO + VALID_RATIO))

        splits = {
            "train": images[:train_end],
            "valid": images[train_end:valid_end],
            "test": images[valid_end:],
        }

        for split_name, image_list in splits.items():

            destination = (
                OUTPUT_DIR
                / split_name
                / class_dir.name
            )

            destination.mkdir(
                parents=True,
                exist_ok=True,
            )

            for image in image_list:
                shutil.copy2(
                    image,
                    destination / image.name,
                )

    print("✅ Dataset successfully split.")


if __name__ == "__main__":
    split_dataset()