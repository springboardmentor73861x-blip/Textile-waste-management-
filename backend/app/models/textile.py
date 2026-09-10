from sqlalchemy import (
    Column,
    Integer,
    String,
    DateTime,
    ForeignKey,
    Float,
)
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship

from app.database import Base


class Textile(Base):

    __tablename__ = "textiles"

    # ==========================================================
    # BASIC INFORMATION
    # ==========================================================

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    user_id = Column(
        Integer,
        ForeignKey("users.id"),
        nullable=False
    )

    image_path = Column(
        String,
        nullable=False
    )

    textile_name = Column(
        String,
        nullable=True
    )

    description = Column(
        String,
        nullable=True
    )

    # ==========================================================
    # AI PREDICTION
    # ==========================================================

    prediction = Column(
        String(100),
        nullable=True
    )

    confidence = Column(
        String(50),
        nullable=True
    )

    category = Column(
        String(100),
        nullable=True
    )

    recyclable = Column(
        String(20),
        nullable=True
    )

    top_predictions = Column(
        String(2000),
        nullable=True
    )

    recommendation = Column(
        String(500),
        nullable=True
    )

    # ==========================================================
    # MILESTONE 3
    # SUSTAINABILITY INTELLIGENCE
    # ==========================================================

    sustainability_score = Column(
        Float,
        nullable=True
    )

    circularity_score = Column(
        Float,
        nullable=True
    )

    recovery_category = Column(
        String(100),
        nullable=True
    )

    # ==========================================================
    # MILESTONE 3
    # RECOMMENDATION INTELLIGENCE
    # ==========================================================

    primary_action = Column(
        String(150),
        nullable=True
    )

    alternative_action = Column(
        String(150),
        nullable=True
    )

    # ==========================================================
    # MILESTONE 3
    # ENVIRONMENTAL IMPACT
    # ==========================================================

    estimated_co2_savings_kg = Column(
        Float,
        nullable=True
    )

    estimated_water_savings_liters = Column(
        Float,
        nullable=True
    )

    estimated_landfill_diversion_kg = Column(
        Float,
        nullable=True
    )

    estimated_resource_recovery_kg = Column(
        Float,
        nullable=True
    )

    environmental_benefit_score = Column(
        Float,
        nullable=True
    )

    environmental_benefit = Column(
        String(100),
        nullable=True
    )

    # ==========================================================
    # TIMESTAMP
    # ==========================================================

    uploaded_at = Column(
        DateTime(timezone=True),
        server_default=func.now()
    )

    # ==========================================================
    # RELATIONSHIP
    # ==========================================================

    owner = relationship(
        "User"
    )