import os
import shutil
from pathlib import Path

DESKTOP_ARCHIVE_DIR = Path("/Users/brajnandanprasad/Desktop/archive")
TARGET_DATASET_DIR = Path(__file__).resolve().parent / "datasets" / "fabric_dataset"
QUARANTINE_DIR = Path(__file__).resolve().parent / "datasets" / "invalid_classes_quarantine"

IMAGE_EXTENSIONS = {".jpg", ".jpeg", ".png", ".bmp", ".webp"}


def import_and_flatten_dataset():
    print("=" * 60)
    print("🚀 Removing Previous Dataset & Importing from Desktop Archive")
    print("=" * 60)
    print(f"Source Archive : {DESKTOP_ARCHIVE_DIR}")
    print(f"Target Dataset : {TARGET_DATASET_DIR}")

    if not DESKTOP_ARCHIVE_DIR.exists():
        raise FileNotFoundError(f"Source desktop archive directory not found: {DESKTOP_ARCHIVE_DIR}")

    # 1. Clean existing dataset and quarantine folders
    if TARGET_DATASET_DIR.exists():
        print(f"🗑️ Clearing existing dataset at {TARGET_DATASET_DIR}...")
        shutil.rmtree(TARGET_DATASET_DIR)
    
    if QUARANTINE_DIR.exists():
        print(f"🗑️ Clearing existing quarantine at {QUARANTINE_DIR}...")
        shutil.rmtree(QUARANTINE_DIR)

    TARGET_DATASET_DIR.mkdir(parents=True, exist_ok=True)

    # 2. Iterate through each class directory in Desktop archive
    total_copied = 0
    class_counts = {}

    for class_folder in sorted(DESKTOP_ARCHIVE_DIR.iterdir()):
        if not class_folder.is_dir() or class_folder.name.startswith("."):
            continue

        class_name = class_folder.name
        target_class_dir = TARGET_DATASET_DIR / class_name
        target_class_dir.mkdir(parents=True, exist_ok=True)

        copied_for_class = 0

        # Recursively find all images and flatten them into target_class_dir
        for file_path in class_folder.rglob("*"):
            if file_path.is_file() and not file_path.name.startswith(".") and file_path.suffix.lower() in IMAGE_EXTENSIONS:
                # Generate unique flattened filename using parent directory names
                rel_parts = file_path.relative_to(class_folder).parts
                if len(rel_parts) > 1:
                    new_filename = "_".join(rel_parts)
                else:
                    new_filename = file_path.name

                dest_file = target_class_dir / new_filename
                
                # Handle potential duplicate filenames
                counter = 1
                while dest_file.exists():
                    stem = Path(new_filename).stem
                    ext = Path(new_filename).suffix
                    dest_file = target_class_dir / f"{stem}_{counter}{ext}"
                    counter += 1

                shutil.copy2(file_path, dest_file)
                copied_for_class += 1

        class_counts[class_name] = copied_for_class
        total_copied += copied_for_class
        print(f"📁 Class '{class_name:20s}': Copied & flattened {copied_for_class:4d} images")

    print("=" * 60)
    print(f"✅ Import Complete! Total Images Imported: {total_copied}")
    print("=" * 60)
    return class_counts


if __name__ == "__main__":
    import_and_flatten_dataset()
