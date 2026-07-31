from fastapi import FastAPI
from app.core.config import settings

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