from sqlalchemy.orm import Session

from app.models.inventory import Inventory
from app.schemas.inventory import InventoryCreate


def create_inventory(db: Session, item: InventoryCreate, current_user: dict):

    new_item = Inventory(
        batch_id=item.batch_id,
        fabric_type=item.fabric_type,
        source=item.source,
        quantity=item.quantity,
        color=item.color,
        condition=item.condition,
        collection_date=item.collection_date,
        waste_category=item.waste_category,
        recyclability=item.recyclability,
        status=item.status,
        company_name=current_user.get("company_name"),
        company_code=current_user.get("company_code")
    )

    db.add(new_item)
    db.commit()
    db.refresh(new_item)

    return new_item


def get_all_inventory(db: Session, current_user: dict):
    company_code = current_user.get("company_code")
    return(
        db.query(Inventory)
        .filter(Inventory.company_code == company_code)
        .all()
    )


def update_inventory(db: Session, item_id: int, updated_item: InventoryCreate,current_user: dict):
    company_code = current_user.get("company_code")

    item = (
        db.query(Inventory)
        .filter(
            Inventory.id == item_id,
            Inventory.company_code ==company_code
        )
        .first()
    )

    if not item:
        return None

    item.batch_id = updated_item.batch_id
    item.fabric_type = updated_item.fabric_type
    item.source = updated_item.source
    item.quantity = updated_item.quantity
    item.color = updated_item.color
    item.condition = updated_item.condition
    item.collection_date = updated_item.collection_date
    item.waste_category = updated_item.waste_category
    item.recyclability = updated_item.recyclability
    item.status = updated_item.status

    db.commit()
    db.refresh(item)

    return item


def delete_inventory(db: Session, item_id: int,
                     current_user:dict):
    company_code = current_user.get("company_code")

    item = (
        db.query(Inventory)
        .filter(Inventory.id == item_id,
                Inventory.company_code == company_code
                )
                .first()
    )

    if not item:
        return None

    db.delete(item)
    db.commit()

    return item