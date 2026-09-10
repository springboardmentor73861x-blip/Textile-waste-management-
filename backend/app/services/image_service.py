import os
import shutil
from uuid import uuid4
from fastapi import UploadFile

UPLOAD_DIR = "uploads"

os.makedirs(UPLOAD_DIR, exist_ok=True)
ALLOWED_EXTENSIONS = {"jpg", "jpeg", "png"}


def save_image(file: UploadFile) -> str:
    from app.services.image_service import save_image

    filepath = save_image(file)

    return filepath
    from fastapi import HTTPException
    if extension not in ALLOWED_EXTENSIONS:
      raise HTTPException(
        status_code=400,
        detail="Only JPG, JPEG and PNG images are allowed."
        )

