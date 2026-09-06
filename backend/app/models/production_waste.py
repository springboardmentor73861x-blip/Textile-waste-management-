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


class ProductionWaste(Base):

    __tablename__ = "production_waste"

    # ========================================================
    # PRIMARY KEY
    # ========================================================

    id = Column(
        Integer,
        primary_key=True,
        index=True,
    )

    # ========================================================
    # PRODUCTION INFORMATION
    # ========================================================

    production_unit = Column(
        String(150),
        nullable=False,
    )

    production_process = Column(
        String(150),
        nullable=True,
    )

    machine = Column(
        String(150),
        nullable=True,
    )

    # ========================================================
    # WASTE INFORMATION
    # ========================================================

    waste_type = Column(
        String(100),
        nullable=False,
    )

    waste_category = Column(
        String(100),
        nullable=True,
    )

    quantity = Column(
        Float,
        nullable=False,
    )

    unit = Column(
        String(30),
        nullable=False,
        default="Kg",
    )

    weight = Column(
        Float,
        nullable=True,
    )

    # ========================================================
    # TEXTILE INFORMATION
    # ========================================================

    material_type = Column(
        String(100),
        nullable=True,
    )

    fabric_type = Column(
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

    # ========================================================
    # LOCATION
    # ========================================================

    location = Column(
        String(150),
        nullable=False,
    )

    # ========================================================
    # STATUS
    # ========================================================

    status = Column(
        String(50),
        nullable=False,
        default="Pending",
    )

    # ========================================================
    # NOTES
    # ========================================================

    notes = Column(
        Text,
        nullable=True,
    )

    # ========================================================
    # CREATED DATE
    # ========================================================

    created_at = Column(
        DateTime,
        server_default=func.now(),
        nullable=False,
    )