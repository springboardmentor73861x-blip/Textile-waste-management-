import os
import shutil
from pathlib import Path
from PIL import Image

from app.ai.utils.config import DATASET_DIR, BASE_DIR

INVALID_CLASSES = ["Lut", "Unclassified", "Utilities"]
QUARANTINE_DIR = BASE_DIR / "datasets" / "invalid_classes_quarantine"
IMAGE_EXTENSIONS = {".jpg", ".jpeg", ".png", ".bmp", ".webp"}

MIN_SAMPLES_THRESHOLD = 15


class DatasetCleaner:

    @staticmethod
    def quarantine_invalid_classes():
        """
        Moves non-fabric / noisy class directories to a quarantine folder.
        """
        QUARANTINE_DIR.mkdir(parents=True, exist_ok=True)
        moved_classes = []

        if not DATASET_DIR.exists():
            print(f"⚠️ Dataset directory {DATASET_DIR} does not exist.")
            return moved_classes

        for invalid_name in INVALID_CLASSES:
            class_path = DATASET_DIR / invalid_name
            if class_path.exists() and class_path.is_dir():
                target_path = QUARANTINE_DIR / invalid_name
                if target_path.exists():
                    shutil.rmtree(target_path)
                shutil.move(str(class_path), str(target_path))
                moved_classes.append(invalid_name)
                print(f"📦 Quarantined invalid class folder: '{invalid_name}' -> {target_path}")

        return moved_classes

    @staticmethod
    def quarantine_low_sample_classes(min_samples: int = MIN_SAMPLES_THRESHOLD):
        """
        Quarantines class directories with fewer than `min_samples` images.
        """
        QUARANTINE_DIR.mkdir(parents=True, exist_ok=True)
        quarantined_low_sample = []

        if not DATASET_DIR.exists():
            return quarantined_low_sample

        for class_dir in sorted(DATASET_DIR.iterdir()):
            if not class_dir.is_dir():
                continue

            images = [
                f for f in class_dir.rglob("*")
                if f.is_file() and not f.name.startswith(".") and f.suffix.lower() in IMAGE_EXTENSIONS
            ]

            if len(images) < min_samples:
                target_path = QUARANTINE_DIR / class_dir.name
                if target_path.exists():
                    shutil.rmtree(target_path)
                shutil.move(str(class_dir), str(target_path))
                quarantined_low_sample.append((class_dir.name, len(images)))
                print(f"📦 Quarantined micro-class (<{min_samples} samples): '{class_dir.name}' ({len(images)} images) -> {target_path}")

        return quarantined_low_sample

    @staticmethod
    def verify_and_clean_images():
        """
        Recursively scans remaining class folders to ensure all images can be loaded properly.
        Removes any 0-byte or corrupted image files or non-image junk files (like .DS_Store).
        """
        removed_files = []
        if not DATASET_DIR.exists():
            return removed_files

        for class_dir in DATASET_DIR.iterdir():
            if not class_dir.is_dir():
                continue

            for file_path in class_dir.rglob("*"):
                if file_path.is_file():
                    # Ignore .DS_Store or non-image extensions
                    if file_path.name.startswith(".") or file_path.suffix.lower() not in IMAGE_EXTENSIONS:
                        print(f"🗑️ Removing non-image junk file: {file_path}")
                        file_path.unlink()
                        removed_files.append(str(file_path))
                        continue

                    # Check 0-byte
                    if file_path.stat().st_size == 0:
                        print(f"🗑️ Removing 0-byte file: {file_path}")
                        file_path.unlink()
                        removed_files.append(str(file_path))
                        continue

                    # Verify image with PIL
                    try:
                        with Image.open(file_path) as img:
                            img.verify()
                    except Exception as e:
                        print(f"🗑️ Removing corrupted image: {file_path} ({e})")
                        file_path.unlink()
                        removed_files.append(str(file_path))

        return removed_files

    @staticmethod
    def get_class_counts():
        """
        Returns a dictionary of class_name -> image count for valid classes by recursively searching files.
        """
        counts = {}
        if not DATASET_DIR.exists():
            return counts

        for class_dir in sorted(DATASET_DIR.iterdir()):
            if class_dir.is_dir():
                images = [
                    f for f in class_dir.rglob("*")
                    if f.is_file() and not f.name.startswith(".") and f.suffix.lower() in IMAGE_EXTENSIONS
                ]
                if len(images) > 0:
                    counts[class_dir.name] = len(images)

        return counts

    @classmethod
    def clean_dataset(cls, min_samples: int = MIN_SAMPLES_THRESHOLD):
        """
        Executes full dataset cleaning procedure.
        """
        print("=" * 60)
        print("🧹 Running Dataset Cleaner...")
        print("=" * 60)
        quarantined_invalid = cls.quarantine_invalid_classes()
        cleaned_files = cls.verify_and_clean_images()
        quarantined_low = cls.quarantine_low_sample_classes(min_samples=min_samples)
        counts = cls.get_class_counts()

        print(f"\n✅ Cleaning Summary:")
        print(f"   Quarantined Invalid Folders ({len(quarantined_invalid)}): {quarantined_invalid}")
        print(f"   Quarantined Micro-Classes (<{min_samples} samples) ({len(quarantined_low)}): {[name for name, _ in quarantined_low]}")
        print(f"   Removed Non-Image/Corrupt Files: {len(cleaned_files)}")
        print(f"   Active Valid Classes ({len(counts)}):")
        print("-" * 60)
        for class_name, count in counts.items():
            print(f"   - {class_name:25s}: {count:4d} images")
        print("=" * 60)
        return counts


if __name__ == "__main__":
    DatasetCleaner.clean_dataset()


