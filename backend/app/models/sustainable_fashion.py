from sqlalchemy import (
    Column,
    Integer,
    String,
    Float,
)

from app.database import Base


class SustainableFashion(Base):

    __tablename__ = "sustainable_fashion"

    id = Column(
        Integer,
        primary_key=True,
        index=True,
    )

    brand_id = Column(
        String(50),
    )

    brand_name = Column(
        String(100),
    )

    country = Column(
        String(100),
    )

    year = Column(
        Integer,
    )

    sustainability_rating = Column(
        String(5),
    )

    material_type = Column(
        String(100),
    )

    eco_friendly_manufacturing = Column(
        String(20),
    )

    carbon_footprint_mt = Column(
        Float,
    )

    water_usage_liters = Column(
        Float,
    )

    waste_production_kg = Column(
        Float,
    )

    recycling_programs = Column(
        String(100),
    )

    product_lines = Column(
        Integer,
    )

    average_price_usd = Column(
        Float,
    )

    market_trend = Column(
        String(100),
    )

    certifications = Column(
        String(100),
    )