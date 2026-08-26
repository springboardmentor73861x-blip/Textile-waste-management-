from sqlalchemy import (
    Column,
    Integer,
    String,
    Float,
    Text,
)

from app.database import Base


class WasteRequest(Base):

    __tablename__ = "waste_requests"

    # ============================================================
    # PRIMARY KEY
    # ============================================================

    id = Column(
        Integer,
        primary_key=True,
        index=True,
    )

    # ============================================================
    # WASTE
    # ============================================================

    waste_id = Column(
        Integer,
        nullable=True,
        index=True,
    )

    # ============================================================
    # MANUFACTURER
    # ============================================================

    manufacturer_id = Column(
        Integer,
        nullable=True,
        index=True,
    )

    manufacturer = Column(
        String(100),
        nullable=True,
    )

    # ============================================================
    # RECYCLER
    # ============================================================

    recycler_id = Column(
        Integer,
        nullable=True,
        index=True,
    )

    recycler = Column(
        String(100),
        nullable=True,
    )

    # ============================================================
    # WASTE INFORMATION
    # ============================================================

    material = Column(
        String(100),
        nullable=True,
    )

    quantity = Column(
        Float,
        nullable=False,
        default=0,
    )

    unit = Column(
        String(20),
        nullable=True,
        default="items",
    )

    # ============================================================
    # REQUEST STATUS
    # ============================================================

    status = Column(
        String(50),
        nullable=False,
        default="Pending",
    )

    # ============================================================
    # PROCESSING
    # ============================================================

    machine = Column(
        String(100),
        nullable=True,
    )

    progress = Column(
        Float,
        nullable=True,
        default=0,
    )

    # ============================================================
    # NOTES
    # ============================================================

    notes = Column(
        Text,
        nullable=True,
    )