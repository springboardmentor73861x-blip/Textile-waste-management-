import datetime
import os
try:
    import psutil
    HAS_PSUTIL = True
except ImportError:
    HAS_PSUTIL = False

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import text

from app.database.database import get_db
from app.services.prediction_service import is_model_loaded

router = APIRouter(tags=["Health & Monitoring"])

START_TIME = datetime.datetime.now(datetime.timezone.utc)

@router.get("/health")
def health_check(db: Session = Depends(get_db)):
    # Database connectivity check
    db_status = "healthy"
    try:
        db.execute(text("SELECT 1"))
    except Exception as e:
        db_status = f"unhealthy: {str(e)}"

    # AI Model status check
    ai_status = "loaded" if is_model_loaded() else "fallback_mode"

    # Memory & Process stats
    if HAS_PSUTIL:
        process = psutil.Process(os.getpid())
        memory_info = process.memory_info()
        cpu_percent = psutil.cpu_percent(interval=None)
        sys_stats = {
            "cpu_usage_percent": cpu_percent,
            "memory_usage_mb": round(memory_info.rss / (1024 * 1024), 2)
        }
    else:
        sys_stats = {
            "status": "psutil module not installed"
        }

    uptime_seconds = int((datetime.datetime.now(datetime.timezone.utc) - START_TIME).total_seconds())

    return {
        "status": "healthy" if db_status == "healthy" else "degraded",
        "service": "Textile Waste Intelligence Platform API",
        "version": "1.0.0",
        "timestamp": datetime.datetime.now(datetime.timezone.utc).isoformat(),
        "uptime_seconds": uptime_seconds,
        "components": {
            "database": {
                "status": db_status,
                "engine": "PostgreSQL"
            },
            "ai_model": {
                "status": ai_status,
                "architecture": "MobileNetV3-Large",
                "classes_count": 17
            }
        },
        "system": sys_stats
    }
