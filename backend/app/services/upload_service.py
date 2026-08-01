from fastapi import UploadFile

from app.utils.file_handler import FileHandler


class UploadService:

    @staticmethod
    async def upload_image(file: UploadFile):

        image = await FileHandler.save_image(file)

        return {
            "message": "Image uploaded successfully.",
            "filename": image["filename"],
            "image_url": f"/storage/uploads/{image['filename']}",
        }