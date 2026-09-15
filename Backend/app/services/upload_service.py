import os
import uuid
from datetime import datetime

from fastapi import UploadFile
from sqlalchemy.orm import Session

from app.models.upload import Upload
from app.models.inventory import Inventory
from app.models.user import User
from app.services.activity_service import create_activity
from app.ml.image_preprocessing import ImageProcessor
from app.services.image_validation import ImageValidator
from app.services.prediction_service import PredictionService


UPLOAD_FOLDER = "app/uploads"


def save_uploaded_file(db: Session, file: UploadFile, uploaded_by: str):
    os.makedirs(UPLOAD_FOLDER, exist_ok=True)

    ImageValidator.validate(file)

    file_extension = os.path.splitext(file.filename)[1]
    unique_filename = f"{uuid.uuid4()}{file_extension}"
    file_path = os.path.join(UPLOAD_FOLDER, unique_filename)

    with open(file_path, "wb") as buffer:
        buffer.write(file.file.read())

    processed_image = ImageProcessor.preprocess_image(file_path)

    prediction = PredictionService.predict(processed_image)

    user = db.query(User).filter(User.email == uploaded_by).first()

    if not user:
        raise ValueError("User not found")

    company_name = user.company_name
    company_code = user.company_code

    upload = Upload(
        filename=unique_filename,
        file_path=file_path,
        uploaded_by=uploaded_by,
        company_name=company_name,
        company_code=company_code,
        material=prediction["material"],
        waste_type=prediction["waste_type"],
        confidence=str(prediction["confidence"]),
        recycle=str(prediction["recycle"]),
        reuse=str(prediction["reuse"]),
        repair=str(prediction["repair"]),
        score=prediction["score"]
    )

    db.add(upload)

    batch_id = f"TW-{uuid.uuid4().hex[:8].upper()}"

    inventory = Inventory(
        batch_id=batch_id,
        fabric_type=prediction["material"],
        company_name=company_name,
        company_code=company_code,
        source="Image Upload",
        quantity=1,
        color="Unknown",
        condition="Waste",
        collection_date=datetime.utcnow(),
        waste_category=prediction["waste_type"],
        recyclability=str(prediction["recycle"]),
        status="Available"
    )

    db.add(inventory)
    db.commit()

    db.refresh(upload)
    db.refresh(inventory)

    create_activity(
        db=db,
        username=user.username,
        role=user.role,
        action="Uploaded textile image",
        status="Success",
        company_name=company_name,
        company_code=company_code
    )

    return upload