import json

from sqlalchemy.orm import Session

from app.models.textile import Textile


# ==========================================================
# CREATE TEXTILE
# ==========================================================

def create_textile(
    db: Session,
    user_id: int,
    image_path: str,

    # Basic information
    textile_name: str = None,
    description: str = None,

    # AI prediction
    prediction: str = None,
    confidence: float = None,
    category: str = None,
    recyclable: str = None,
    recommendation: str = None,
    top_predictions: list = None,

    # Sustainability
    sustainability_score: float = None,
    circularity_score: float = None,
    recovery_category: str = None,

    # Recommendation
    primary_action: str = None,
    alternative_action: str = None,

    # Environmental impact
    estimated_co2_savings_kg: float = None,
    estimated_water_savings_liters: float = None,
    estimated_landfill_diversion_kg: float = None,
    estimated_resource_recovery_kg: float = None,
    environmental_benefit_score: float = None,
    environmental_benefit: str = None,
):

    textile = Textile(

        # ==================================================
        # BASIC INFORMATION
        # ==================================================

        user_id=user_id,

        image_path=image_path,

        textile_name=textile_name,

        description=description,

        # ==================================================
        # AI PREDICTION
        # ==================================================

        prediction=prediction,

        confidence=confidence,

        category=category,

        recyclable=recyclable,

        recommendation=recommendation,

        top_predictions=(
            json.dumps(top_predictions)
            if top_predictions is not None
            else None
        ),

        # ==================================================
        # SUSTAINABILITY
        # ==================================================

        sustainability_score=sustainability_score,

        circularity_score=circularity_score,

        recovery_category=recovery_category,

        # ==================================================
        # RECOMMENDATION
        # ==================================================

        primary_action=primary_action,

        alternative_action=alternative_action,

        # ==================================================
        # ENVIRONMENTAL IMPACT
        # ==================================================

        estimated_co2_savings_kg=estimated_co2_savings_kg,

        estimated_water_savings_liters=estimated_water_savings_liters,

        estimated_landfill_diversion_kg=estimated_landfill_diversion_kg,

        estimated_resource_recovery_kg=estimated_resource_recovery_kg,

        environmental_benefit_score=environmental_benefit_score,

        environmental_benefit=environmental_benefit,
    )

    db.add(textile)

    db.commit()

    db.refresh(textile)

    return textile


# ==========================================================
# GET USER TEXTILES
# ==========================================================

def get_user_textiles(
    db: Session,
    user_id: int,
):

    return (
        db.query(Textile)
        .filter(
            Textile.user_id == user_id
        )
        .order_by(
            Textile.uploaded_at.desc()
        )
        .all()
    )


# ==========================================================
# GET SINGLE TEXTILE
# ==========================================================

def get_textile_by_id(
    db: Session,
    textile_id: int,
    user_id: int,
):

    return (
        db.query(Textile)
        .filter(
            Textile.id == textile_id,
            Textile.user_id == user_id,
        )
        .first()
    )


# ==========================================================
# UPDATE TEXTILE
# ==========================================================

def update_textile(
    db: Session,
    textile: Textile,
    textile_name: str = None,
    description: str = None,
):

    if textile_name is not None:

        textile.textile_name = textile_name

    if description is not None:

        textile.description = description

    db.commit()

    db.refresh(textile)

    return textile


# ==========================================================
# DELETE TEXTILE
# ==========================================================

def delete_textile(
    db: Session,
    textile: Textile,
):

    db.delete(textile)

    db.commit()

# ==========================================================
# GET ALL TEXTILES (ADMIN ONLY)
# ==========================================================

def get_all_textiles(db: Session):

    return (
        db.query(Textile)
        .order_by(Textile.uploaded_at.desc())
        .all()
    )