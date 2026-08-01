from sqlalchemy import (
    Column,
    Integer,
    String,
    Float,
    DateTime,
    ForeignKey,
)
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.db.database import Base


class Inventory(Base):
    __tablename__ = "inventory"

    id = Column(Integer, primary_key=True, index=True)

    item_name = Column(String(200), nullable=False)

    category = Column(String(100), nullable=False)

    material = Column(String(100), nullable=False)

    color = Column(String(100), nullable=True)

    weight = Column(Float, nullable=False)

    quantity = Column(Integer, default=1)

    condition = Column(String(100), nullable=False)

    location = Column(String(200), nullable=True)

    image_url = Column(String(500), nullable=True)

    created_by = Column(
        Integer,
        ForeignKey("users.id"),
        nullable=False,
    )

    created_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
    )

    owner = relationship("User")