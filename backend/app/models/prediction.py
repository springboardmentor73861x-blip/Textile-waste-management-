from sqlalchemy import (
    Column,
    Integer,
    String,
    Float,
    Text,
    DateTime,
)

from sqlalchemy.sql import func

from app.database import Base


class PredictionHistory(Base):

    __tablename__ = "prediction_history"

    id = Column(
        Integer,
        primary_key=True,
        index=True,
    )

    filename = Column(
        String(255),
        nullable=False,
    )

    fabric_type = Column(
        String(100),
        nullable=False,
    )

    class_index = Column(
        Integer,
        nullable=False,
    )

    confidence = Column(
        Float,
        nullable=False,
    )

    confidence_percentage = Column(
        Float,
        nullable=False,
    )

    source = Column(
        String(100),
        nullable=True,
    )

    waste_category = Column(
        String(100),
        nullable=True,
    )

    color = Column(
        String(100),
        nullable=True,
    )

    condition = Column(
        String(100),
        nullable=True,
    )

    weight = Column(
        Float,
        nullable=True,
    )

    quantity = Column(
        Integer,
        nullable=True,
    )

    notes = Column(
        Text,
        nullable=True,
    )

    material_type = Column(
        String(255),
        nullable=True,
    )

    composition = Column(
        Text,
        nullable=True,
    )

    recyclability = Column(
        String(100),
        nullable=True,
    )

    biodegradability = Column(
        String(100),
        nullable=True,
    )

    recommended_processing = Column(
        Text,
        nullable=True,
    )

    potential_reuse = Column(
        Text,
        nullable=True,
    )

    created_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
    )