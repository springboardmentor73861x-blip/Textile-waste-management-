from fastapi import FastAPI

from app.api.auth import router as auth_router
from app.core.config import settings
from app.db.database import Base, engine
from app.api.users import router as user_router

# Import models so SQLAlchemy creates tables
from app.models.user import User
from app.models.inventory import Inventory

# Create database tables
Base.metadata.create_all(bind=engine)

# Create FastAPI application
app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
)

# Register API routes
app.include_router(auth_router)
app.include_router(user_router)


@app.get("/")
async def root():
    return {
        "status": "success",
        "message": f"Welcome to {settings.APP_NAME} 🚀",
    }