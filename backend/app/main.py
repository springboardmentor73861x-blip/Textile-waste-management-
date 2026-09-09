from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.database.database import Base, engine
from app.routes.inventory import router as inventory_router
from app.routes.user import router as user_router, auth_router
from app.api.prediction import router as prediction_router
from app.routes.analytics import router as analytics_router
from app.routes.feedback import router as feedback_router
from app.routes.sustainability import router as sustainability_router, recommendations_router
from app.routes.health import router as health_router
from app.middleware.logging_middleware import LoggingMiddleware
from app.config.config import FRONTEND_ORIGINS

from app.models import user, inventory, prediction_history

# Create database tables (gracefully catch if DB server is offline during module import)
try:
    Base.metadata.create_all(bind=engine)
except Exception as err:
    print(f"[DB Notice] Database table initialization deferred: {err}")

app = FastAPI(
    title="Textile Waste Intelligence Platform API",
    version="1.0.0",
    description="Production API for Textile Waste Classification, Inventory Tracking, Sustainability Analysis & Cloud Operations"
)

# Attach Logging Middleware
app.add_middleware(LoggingMiddleware)

# Enable CORS for React frontend integration - must be added before routes
app.add_middleware(
    CORSMiddleware,
    allow_origins=FRONTEND_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routes
app.include_router(health_router)
app.include_router(user_router)
app.include_router(auth_router)
app.include_router(inventory_router)
app.include_router(prediction_router)
app.include_router(analytics_router)
app.include_router(feedback_router)
app.include_router(sustainability_router)
app.include_router(recommendations_router)


@app.get("/")
def root():
    return {
        "message": "Welcome to Textile Waste Intelligence Platform API",
        "status": "running",
        "health_check": "/health",
        "docs": "/docs"
    }
