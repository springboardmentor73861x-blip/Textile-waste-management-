import shutil
from pathlib import Path

VALID_EXTENSIONS = (".jpg", ".jpeg", ".png", ".bmp", ".webp")

BASE_DIR = Path(__file__).resolve().parents[3]

SOURCE_DATASET = (
    BASE_DIR
    / "Dataset"
    / "Fabric_Image_iBUG"
)

DESTINATION_DATASET = (
    BASE_DIR
    / "Dataset"
    / "Processed_Dataset"
)


def prepare_dataset():

    # Fresh Folder
    if DESTINATION_DATASET.exists():
        shutil.rmtree(DESTINATION_DATASET)

    DESTINATION_DATASET.mkdir(parents=True)

    total_images = 0

    # Material folders
    for material_folder in SOURCE_DATASET.iterdir():

        if not material_folder.is_dir():
            continue

        destination_class = DESTINATION_DATASET / material_folder.name
        destination_class.mkdir(exist_ok=True)

        # 65,66,100...
        for sample_folder in material_folder.iterdir():

            if not sample_folder.is_dir():
                continue

            # Search every image recursively
            for image in sample_folder.rglob("*"):

                if image.suffix.lower() in VALID_EXTENSIONS:

                    new_name = f"{sample_folder.name}_{image.name}"

                    shutil.copy2(
                        image,
                        destination_class / new_name
                    )

                    total_images += 1

    print("\n=================================")
    print("Dataset Prepared Successfully")
    print("Processed Images :", total_images)
    print("Output Folder :", DESTINATION_DATASET)
    print("=================================")


if __name__ == "__main__":
    prepare_dataset()