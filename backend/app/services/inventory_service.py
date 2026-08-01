from sqlalchemy.orm import Session

from app.models.inventory import Inventory
from app.repositories.inventory_repository import InventoryRepository
from app.schemas.inventory_schema import (
    InventoryCreate,
    InventoryUpdate,
)


class InventoryService:

    @staticmethod
    def create_inventory(
        db: Session,
        inventory_data: InventoryCreate,
        user_id: int,
    ):

        inventory = Inventory(
            item_name=inventory_data.item_name,
            category=inventory_data.category,
            material=inventory_data.material,
            color=inventory_data.color,
            weight=inventory_data.weight,
            quantity=inventory_data.quantity,
            condition=inventory_data.condition,
            location=inventory_data.location,
            image_url=inventory_data.image_url,
            created_by=user_id,
        )

        return InventoryRepository.create(
            db,
            inventory,
        )

    @staticmethod
    def get_inventory(
        db: Session,
    ):
        return InventoryRepository.get_all(db)

    @staticmethod
    def get_inventory_by_id(
        db: Session,
        inventory_id: int,
    ):

        inventory = InventoryRepository.get_by_id(
            db,
            inventory_id,
        )

        if inventory is None:
            raise ValueError("Inventory item not found.")

        return inventory

    @staticmethod
    def update_inventory(
        db: Session,
        inventory_id: int,
        inventory_data: InventoryUpdate,
    ):

        inventory = InventoryRepository.get_by_id(
            db,
            inventory_id,
        )

        if inventory is None:
            raise ValueError("Inventory item not found.")

        update_data = inventory_data.model_dump(exclude_unset=True)

        for key, value in update_data.items():
            setattr(inventory, key, value)

        return InventoryRepository.update(
            db,
            inventory,
        )

    @staticmethod
    def delete_inventory(
        db: Session,
        inventory_id: int,
    ):

        inventory = InventoryRepository.get_by_id(
            db,
            inventory_id,
        )

        if inventory is None:
            raise ValueError("Inventory item not found.")

        InventoryRepository.delete(
            db,
            inventory,
        )

        return {
            "message": "Inventory deleted successfully."
        }