from sqlalchemy.orm import Session

from app.models.inventory import Inventory


class InventoryRepository:

    @staticmethod
    def create(
        db: Session,
        inventory: Inventory,
    ):
        db.add(inventory)
        db.commit()
        db.refresh(inventory)
        return inventory

    @staticmethod
    def get_by_id(
        db: Session,
        inventory_id: int,
    ):
        return (
            db.query(Inventory)
            .filter(Inventory.id == inventory_id)
            .first()
        )

    @staticmethod
    def get_all(
        db: Session,
    ):
        return (
            db.query(Inventory)
            .order_by(Inventory.created_at.desc())
            .all()
        )

    @staticmethod
    def update(
        db: Session,
        inventory: Inventory,
    ):
        db.commit()
        db.refresh(inventory)
        return inventory

    @staticmethod
    def delete(
        db: Session,
        inventory: Inventory,
    ):
        db.delete(inventory)
        db.commit()