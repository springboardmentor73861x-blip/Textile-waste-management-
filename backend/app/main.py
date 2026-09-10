from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from app.config import settings
from app.database import Base, engine
# ==========================================================
# MODELS
# Import all models BEFORE create_all()
# ==========================================================

from app.models.user import User
from app.models.textile import Textile
from app.models.notification import Notification
from app.routers.dashboard import router as dashboard_router
# ==========================================================
# ROUTERS
# ==========================================================

from app.routers.auth import router as auth_router
from app.routers.user import router as user_router
from app.routers.textile import router as textile_router
from app.routers.notification import router as notification_router

# ==========================================================
# CREATE DATABASE TABLES
# ==========================================================

Base.metadata.create_all(bind=engine)


# ==========================================================
# FASTAPI APP
# ==========================================================

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.PROJECT_VERSION
)


# ==========================================================
# STATIC FILES
# ==========================================================

app.mount(
    "/uploads",
    StaticFiles(directory="uploads"),
    name="uploads"
)


# ==========================================================
# CORS
# ==========================================================

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ==========================================================
# BASIC ROUTES
# ==========================================================

@app.get("/")
def root():
    return {
        "message": "Welcome to Textile Waste Intelligence Platform API"
    }


@app.get("/health")
def health():
    return {
        "status": "Healthy"
    }


# ==========================================================
# ROUTERS
# ==========================================================

app.include_router(auth_router)
app.include_router(user_router)
app.include_router(textile_router)
app.include_router(notification_router)
app.include_router(dashboard_router)