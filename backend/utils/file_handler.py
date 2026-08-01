import os
import uuid
from fastapi import UploadFile, HTTPException

# Allowed image extensions
ALLOWED_EXTENSIONS = {
    ".jpg",
    ".jpeg",
    ".png",
    ".webp",
}

# Maximum file size (5 MB)
MAX_FILE_SIZE = 5 * 1024 * 1024

# Upload folder
UPLOAD_DIRECTORY = "storage/uploads"

os.makedirs(UPLOAD_DIRECTORY, exist_ok=True)


class FileHandler:

    @staticmethod
    async def save_image(file: UploadFile):

        extension = os.path.splitext(file.filename)[1].lower()

        if extension not in ALLOWED_EXTENSIONS:
            raise HTTPException(
                status_code=400,
                detail="Only JPG, JPEG, PNG and WEBP files are allowed.",
            )

        contents = await file.read()

        if len(contents) > MAX_FILE_SIZE:
            raise HTTPException(
                status_code=400,
                detail="File size must be less than 5 MB.",
            )

        filename = f"{uuid.uuid4()}{extension}"

        filepath = os.path.join(
            UPLOAD_DIRECTORY,
            filename,
        )

        with open(filepath, "wb") as image:
            image.write(contents)

        return {
            "filename": filename,
            "filepath": filepath,
        }