from fastapi import FastAPI

from app.core.config import settings
from app.db.database import Base, engine

# Import all models here
from app.models.user import User

# Create tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
)


@app.get("/")
async def root():
    return {
        "status": "success",
        "message": f"Welcome to {settings.APP_NAME} 🚀",
    }