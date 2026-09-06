from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware


# ============================================================
# DATABASE
# ============================================================

from app.database import Base, engine


# ============================================================
# MODELS
# ============================================================

from app.models.user import User
from app.models.waste import WasteInventory
from app.models.prediction import PredictionHistory
from app.models.sustainable_fashion import SustainableFashion
from app.models.production_waste import ProductionWaste
from app.models.waste_request import WasteRequest
from app.models.notification import Notification


# ============================================================
# ROUTERS
# ============================================================

from app.routers.admin import router as admin_router
from app.routers.auth import router as auth_router
from app.routers.waste import router as waste_router
from app.routers.prediction import router as prediction_router

from app.routers.sustainability import (
    router as sustainability_router
)

from app.routers.production_waste import (
    router as production_waste_router
)

from app.routers.waste_requests import (
    router as waste_request_router
)

from app.routers.notifications import (
    router as notification_router
)


# ============================================================
# FASTAPI APPLICATION
# ============================================================

app = FastAPI(
    title="Textile Waste AI Platform",

    description=(
        "Textile Waste Management, "
        "AI Prediction and Sustainability "
        "Intelligence Platform API"
    ),

    version="1.0.0",
)


# ============================================================
# CREATE DATABASE TABLES
# ============================================================

try:

    Base.metadata.create_all(
        bind=engine
    )

    print("==============================================")
    print("DATABASE TABLE CREATION")
    print("==============================================")
    print("All SQLAlchemy tables checked/created.")
    print("WasteRequest table:", WasteRequest.__tablename__)
    print("Waste table:", WasteInventory.__tablename__)
    print("User table:", User.__tablename__)
    print("==============================================")

except Exception as exc:

    print("==============================================")
    print("DATABASE TABLE CREATION FAILED")
    print("==============================================")
    print(exc)
    print("==============================================")


# ============================================================
# CORS
# ============================================================

app.add_middleware(

    CORSMiddleware,

    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],

    allow_credentials=True,

    allow_methods=["*"],

    allow_headers=["*"],
)


# ============================================================
# AUTH ROUTER
# ============================================================

app.include_router(
    auth_router,
    prefix="/api",
)


# ============================================================
# ADMIN ROUTER
# ============================================================

app.include_router(
    admin_router,
    prefix="/api",
)


# ============================================================
# NOTIFICATION ROUTER
# ============================================================

app.include_router(
    notification_router,
    prefix="/api",
)


# ============================================================
# WASTE ROUTER
# ============================================================

app.include_router(
    waste_router,
    prefix="/api",
)


# ============================================================
# AI PREDICTION ROUTER
# ============================================================

app.include_router(
    prediction_router,
    prefix="/api",
)


# ============================================================
# PRODUCTION WASTE ROUTER
# ============================================================

app.include_router(
    production_waste_router,
    prefix="/api",
)


# ============================================================
# WASTE REQUEST ROUTER
# ============================================================

app.include_router(
    waste_request_router,
    prefix="/api",
)


# ============================================================
# SUSTAINABILITY ROUTER
# ============================================================

app.include_router(
    sustainability_router,
    prefix="/api",
)


# ============================================================
# ROOT
# ============================================================

@app.get("/")
def root():

    return {

        "message":
            "Textile Waste AI Backend is running",

        "status":
            "success",

        "version":
            "1.0.0",

    }


# ============================================================
# HEALTH CHECK
# ============================================================

@app.get("/health")
def health_check():

    return {

        "status":
            "healthy",

        "service":
            "Textile Waste AI Backend",

    }


# ============================================================
# API STATUS
# ============================================================

@app.get("/api/status")
def api_status():

    return {

        "success":
            True,

        "message":
            "Textile Waste AI API is operational",

        "services": {

            "authentication":
                "operational",

            "admin":
                "operational",

            "waste_management":
                "operational",

            "ai_prediction":
                "operational",

            "production_waste":
                "operational",

            "waste_requests":
                "operational",

            "sustainability_intelligence":
                "operational",

        },

    }