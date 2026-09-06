from sqlalchemy import (
    Column,
    Integer,
    String,
    Float,
    Text,
    ForeignKey,
)

from app.database import Base


class WasteInventory(Base):

    __tablename__ = "waste_inventory"

    # ============================================================
    # PRIMARY KEY
    # ============================================================

    id = Column(
        Integer,
        primary_key=True,
        index=True,
    )

    # ============================================================
    # MANUFACTURER
    # ============================================================

    manufacturer_id = Column(
        Integer,
        ForeignKey("users.id"),
        nullable=True,
        index=True,
    )

    manufacturer = Column(
        String(100),
        nullable=True,
        index=True,
    )

    # ============================================================
    # BASIC WASTE INFORMATION
    # ============================================================

    waste_type = Column(
        String(100),
        nullable=False,
    )

    quantity = Column(
        Float,
        nullable=False,
    )

    unit = Column(
        String(20),
        nullable=False,
    )

    location = Column(
        String(100),
        nullable=False,
    )

    status = Column(
        String(50),
        nullable=False,
        default="Available",
    )

    # ============================================================
    # TEXTILE INFORMATION
    # ============================================================

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

    notes = Column(
        Text,
        nullable=True,
    )

    # ============================================================
    # AI PREDICTION
    # ============================================================

    material_type = Column(
        String(100),
        nullable=True,
    )

    fabric_type = Column(
        String(100),
        nullable=True,
    )

    class_index = Column(
        Integer,
        nullable=True,
    )

    confidence = Column(
        Float,
        nullable=True,
    )

    composition = Column(
        String(200),
        nullable=True,
    )

    recyclability = Column(
        String(200),
        nullable=True,
    )

    biodegradability = Column(
        String(200),
        nullable=True,
    )

    environmental_impact = Column(
        Text,
        nullable=True,
    )

    recommended_processing = Column(
        Text,
        nullable=True,
    )

    recycling_method = Column(
        Text,
        nullable=True,
    )

    disposal_method = Column(
        Text,
        nullable=True,
    )

    potential_reuse = Column(
        Text,
        nullable=True,
    )

    predicted_color = Column(
        String(100),
        nullable=True,
    )

    predicted_condition = Column(
        String(100),
        nullable=True,
    )