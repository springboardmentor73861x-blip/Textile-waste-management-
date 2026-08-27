from sqlalchemy.orm import Session
from sqlalchemy import func

from app.models.inventory import Inventory


class DashboardRepository:

    @staticmethod
    def get_total_inventory(db: Session):
        return db.query(Inventory).count()

    @staticmethod
    def get_total_categories(db: Session):
        return (
            db.query(Inventory.category)
            .distinct()
            .count()
        )

    @staticmethod
    def get_total_weight(db: Session):
        return (
            db.query(
                func.sum(Inventory.weight)
            ).scalar()
            or 0
        )

    @staticmethod
    def get_total_quantity(db: Session):
        return (
            db.query(
                func.sum(Inventory.quantity)
            ).scalar()
            or 0
        )

    @staticmethod
    def get_recent_inventory(
        db: Session,
        limit: int = 5,
    ):
        return (
            db.query(Inventory)
            .order_by(
                Inventory.created_at.desc()
            )
            .limit(limit)
            .all()
        )

    @staticmethod
    def get_category_distribution(db: Session):
        return (
            db.query(
                Inventory.category,
                func.count(Inventory.id).label("count"),
            )
            .group_by(Inventory.category)
            .all()
        )