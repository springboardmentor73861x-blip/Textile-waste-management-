import os

ALLOWED_EXTENSIONS = [".jpg", ".jpeg", ".png"]
MAX_FILE_SIZE = 5 * 1024 * 1024  # 5 MB

class ImageValidator:

    @staticmethod
    def validate(file):

        extension = os.path.splitext(file.filename)[1].lower()

        if extension not in ALLOWED_EXTENSIONS:
            raise ValueError(
                "Only JPG, JPEG and PNG images are allowed."
            )

        file.file.seek(0, 2)
        size = file.file.tell()
        file.file.seek(0)

        if size > MAX_FILE_SIZE:
            raise ValueError(
                "Image size must be less than 5 MB."
            )

        return True