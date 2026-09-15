from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from app.api.auth import router as auth_router
from app.api.inventory import router as inventory_router
from app.api.upload import router as upload_router
from app.api.admin import router as admin_router
from app.api.activity import router as activity_router
from app.api.sustainability import router as sustainability_router
from app.api.reports import router as reports_router
from app.api.textile_dashboard import router as textile_dashboard_router
from app.api.report_dashboard import router as report_dashboard_router
from app.api.recommendations import router as recommendations_router
from app.api.Sustainabilityanalytics import router as analytics_router
from app.api.recycler import router as recycler_router

from app.db.database import Base, engine
from app.db import base

app = FastAPI(
    title="Textile Waste Intelligence Platform"
)

# Static Files
app.mount(
    "/uploads",
    StaticFiles(directory="app/uploads"),
    name="uploads"
)

# ---------- CORS ----------
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://localhost:5174",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---------- Database ----------
Base.metadata.create_all(bind=engine)

# ---------- Routers ----------
app.include_router(auth_router)
app.include_router(inventory_router)
app.include_router(upload_router)
app.include_router(admin_router)
app.include_router(activity_router)
app.include_router(sustainability_router)
app.include_router(reports_router)
app.include_router(textile_dashboard_router)
app.include_router(report_dashboard_router)
app.include_router(recommendations_router)
app.include_router(analytics_router)
app.include_router(recycler_router)

# ---------- Home ----------
@app.get("/")
def home():
    return {
        "message": "Backend Running Successfully"
    }