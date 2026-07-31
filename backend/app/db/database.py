from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base

from app.core.config import settings

# Create the SQLAlchemy engine
engine = create_engine(
    settings.DATABASE_URL,
    echo=settings.DEBUG == "True",
)

# Base class for all database models
Base = declarative_base()