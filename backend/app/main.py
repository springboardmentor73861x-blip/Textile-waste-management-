from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from app.config import settings
# ==========================================================
# MODELS
# Import all models BEFORE create_all()
# ==========================================================
import os
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
from slowapi import _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded
from app.core.rate_limiter import limiter

# ==========================================================
# FASTAPI APP
# ==========================================================

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.PROJECT_VERSION
)
app.state.limiter = limiter
app.add_exception_handler(
    RateLimitExceeded,
    _rate_limit_exceeded_handler
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

allowed_origins = [
    origin.strip()
    for origin in os.getenv(
        "ALLOWED_ORIGINS",
        "http://localhost:5173"
    ).split(",")
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
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