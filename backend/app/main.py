from fastapi import FastAPI
from app.database import Base, engine
from fastapi.middleware.cors import CORSMiddleware
from app.models.user import User
from app.models.waste import WasteInventory

from app.routers.auth import router as auth_router
from app.routers.waste import router as waste_router
from app.models.sustainable_fashion import SustainableFashion
from app.routers.admin import router as admin_router
Base.metadata.create_all(bind=engine)

app = FastAPI(title="Textile Waste Intelligence Platform")
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.include_router(auth_router)
app.include_router(waste_router)
app.include_router(admin_router)
@app.get("/")
def home():
    return {"message": "FastAPI Backend Running Successfully!"}