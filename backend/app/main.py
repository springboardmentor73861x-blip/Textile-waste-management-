from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware

from app.api.auth import router as auth_router
from app.api.users import router as user_router
from app.api.inventory import router as inventory_router
from app.api.upload import router as upload_router
from app.api.dashboard import router as dashboard_router
from app.api.analysis import router as analysis_router
from app.api.reports import router as reports_router
from app.api.sustainability import router as sustainability_router
from app.api.recommendations import router as recommendations_router
from app.api.analytics import router as analytics_router

from app.core.config import settings
from app.db.database import Base, engine

from app.models.user import User
from app.models.inventory import Inventory

Base.metadata.create_all(bind=engine)

app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
)

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.mount(
    "/storage",
    StaticFiles(directory="storage"),
    name="storage",
)

# Register Routers
app.include_router(auth_router)
app.include_router(user_router)
app.include_router(inventory_router)
app.include_router(upload_router)
app.include_router(dashboard_router)
app.include_router(analysis_router)
app.include_router(reports_router)
app.include_router(sustainability_router)
app.include_router(recommendations_router)
app.include_router(analytics_router)



@app.get("/")
async def root():
    return {
        "status": "success",
        "message": f"Welcome to {settings.APP_NAME} 🚀",
    }