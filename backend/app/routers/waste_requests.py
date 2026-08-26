from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db

from app.models.waste_request import WasteRequest
from app.models.notification import Notification
from app.models.user import User

from app.schemas.waste_request import (
    WasteRequestCreate,
    WasteRequestStatusUpdate,
    WasteRequestProcessingUpdate,
    WasteRequestResponse,
)


# ============================================================
# ROUTER
# ============================================================

router = APIRouter(
    prefix="/waste-requests",
    tags=["Waste Requests"],
)


# ============================================================
# NORMALIZE ROLE
# ============================================================

def normalize_role(role):

    return (
        str(role or "")
        .strip()
        .lower()
        .replace("_", " ")
        .replace("-", " ")
    )


# ============================================================
# CHECK ADMIN
# ============================================================

def is_admin(user):

    if not user:
        return False

    role = normalize_role(user.role)

    return role in {
        "admin",
        "administrator",
    }


# ============================================================
# CHECK MANUFACTURER
# ============================================================

def is_manufacturer(user):

    if not user:
        return False

    role = normalize_role(user.role)

    return role in {
        "manufacturer",
        "textile manufacturer",
    }


# ============================================================
# CHECK USER CAN ACT AS MANUFACTURER
#
# ADMIN CAN DO EVERYTHING
# ============================================================

def can_act_as_manufacturer(user):

    if not user:
        return False

    if is_admin(user):
        return True

    if is_manufacturer(user):
        return True

    return False


# ============================================================
# FIND USER BY ID / NAME / EMAIL
# ============================================================

def find_user_by_name_or_email(
    value,
    db: Session,
):

    if not value:
        return None

    value = str(value).strip()

    if not value:
        return None

    # --------------------------------------------------------
    # EXACT EMAIL
    # --------------------------------------------------------

    user = (
        db.query(User)
        .filter(
            User.email.ilike(value)
        )
        .first()
    )

    if user:
        return user

    # --------------------------------------------------------
    # EXACT NAME
    # --------------------------------------------------------

    user = (
        db.query(User)
        .filter(
            User.full_name.ilike(value)
        )
        .first()
    )

    if user:
        return user

    # --------------------------------------------------------
    # PARTIAL NAME
    # --------------------------------------------------------

    user = (
        db.query(User)
        .filter(
            User.full_name.ilike(
                f"%{value}%"
            )
        )
        .first()
    )

    if user:
        return user

    # --------------------------------------------------------
    # PARTIAL EMAIL
    # --------------------------------------------------------

    user = (
        db.query(User)
        .filter(
            User.email.ilike(
                f"%{value}%"
            )
        )
        .first()
    )

    if user:
        return user

    return None


# ============================================================
# FIND MANUFACTURER
#
# PRIORITY:
# 1. manufacturer_id
# 2. manufacturer name/email
# ============================================================

def find_manufacturer(
    request: WasteRequestCreate,
    db: Session,
):

    manufacturer_user = None

    # ========================================================
    # OPTION 1 - MANUFACTURER ID
    # ========================================================

    if request.manufacturer_id is not None:

        try:

            manufacturer_id = int(
                request.manufacturer_id
            )

        except (
            TypeError,
            ValueError,
        ):

            raise HTTPException(
                status_code=400,
                detail="Invalid manufacturer_id.",
            )

        manufacturer_user = (
            db.query(User)
            .filter(
                User.id == manufacturer_id
            )
            .first()
        )

        if manufacturer_user:

            return manufacturer_user

    # ========================================================
    # OPTION 2 - MANUFACTURER NAME / EMAIL
    # ========================================================

    if request.manufacturer:

        manufacturer_user = (
            find_user_by_name_or_email(
                request.manufacturer,
                db,
            )
        )

    return manufacturer_user


# ============================================================
# CREATE NOTIFICATION
# ============================================================

def create_notification(
    db: Session,
    user_id: int,
    title: str,
    message: str,
    notification_type: str,
):

    notification = Notification(
        user_id=user_id,
        title=title,
        message=message,
        notification_type=notification_type,
        is_read=False,
    )

    db.add(notification)

    return notification


# ============================================================
# CREATE WASTE REQUEST
#
# Recycler/Admin -> Manufacturer/Admin
# ============================================================

@router.post(
    "/",
    response_model=WasteRequestResponse,
)
def create_waste_request(
    request: WasteRequestCreate,
    db: Session = Depends(get_db),
):

    try:

        print()
        print("=" * 60)
        print("CREATE WASTE REQUEST")
        print("=" * 60)

        print(
            "Manufacturer ID:",
            request.manufacturer_id,
        )

        print(
            "Manufacturer:",
            request.manufacturer,
        )

        print(
            "Recycler:",
            request.recycler,
        )

        print(
            "Material:",
            request.material,
        )

        print(
            "Quantity:",
            request.quantity,
        )

        print(
            "Unit:",
            request.unit,
        )

        print(
            "Machine:",
            request.machine,
        )

        # ====================================================
        # SOURCE VALUES
        # ====================================================

        invalid_manufacturer_values = {
            "industrial",
            "industrial waste",
            "manufacturing",
            "garment production",
            "collection center",
            "household",
            "retail",
            "donation center",
            "production",
            "production unit",
            "textile waste",
            "other",
        }

        manufacturer_value = (
            str(request.manufacturer).strip()
            if request.manufacturer
            else ""
        )

        if (
            manufacturer_value
            and manufacturer_value.lower()
            in invalid_manufacturer_values
        ):

            raise HTTPException(
                status_code=400,
                detail=(
                    f"'{manufacturer_value}' is a waste "
                    "source, not a registered manufacturer. "
                    "Please send the actual manufacturer "
                    "name or manufacturer_id."
                ),
            )

        # ====================================================
        # FIND MANUFACTURER
        # ====================================================

        manufacturer_user = find_manufacturer(
            request=request,
            db=db,
        )

        # ====================================================
        # NOT FOUND
        # ====================================================

        if not manufacturer_user:

            print(
                "MANUFACTURER NOT FOUND"
            )

            raise HTTPException(
                status_code=404,
                detail=(
                    "Registered manufacturer not found. "
                    "Please send a valid manufacturer_id "
                    "or registered manufacturer name/email."
                ),
            )

        # ====================================================
        # DEBUG
        # ====================================================

        print(
            "FOUND USER ID:",
            manufacturer_user.id,
        )

        print(
            "FOUND USER NAME:",
            manufacturer_user.full_name,
        )

        print(
            "FOUND USER ROLE:",
            manufacturer_user.role,
        )

        # ====================================================
        # ADMIN OR MANUFACTURER
        # ====================================================

        if not can_act_as_manufacturer(
            manufacturer_user
        ):

            raise HTTPException(
                status_code=400,
                detail=(
                    f"User "
                    f"'{manufacturer_user.full_name}' "
                    "is not allowed to act as a manufacturer. "
                    f"Current role: "
                    f"{manufacturer_user.role}"
                ),
            )

        # ====================================================
        # VALIDATE QUANTITY
        # ====================================================

        if request.quantity is None:

            raise HTTPException(
                status_code=400,
                detail="Quantity is required.",
            )

        if float(request.quantity) <= 0:

            raise HTTPException(
                status_code=400,
                detail=(
                    "Quantity must be greater than 0."
                ),
            )

        # ====================================================
        # VALIDATE PROGRESS
        # ====================================================

        progress = (
            request.progress
            if request.progress is not None
            else 0
        )

        if progress < 0 or progress > 100:

            raise HTTPException(
                status_code=400,
                detail=(
                    "Progress must be between 0 and 100."
                ),
            )

        # ====================================================
        # MACHINE
        #
        # IMPORTANT FIX:
        # If frontend does not send a machine,
        # automatically save "Recycling Machine".
        # ====================================================

        machine = (
            str(request.machine).strip()
            if request.machine
            else ""
        )

        if not machine:

            machine = "Recycling Machine"

        # ====================================================
        # CREATE REQUEST
        # ====================================================

        new_request = WasteRequest(

            manufacturer=(
                manufacturer_user.full_name
            ),

            recycler=request.recycler,

            material=request.material,

            quantity=request.quantity,

            unit=(
                request.unit
                or "Kg"
            ),

            status=(
                request.status
                or "Pending"
            ),

            machine=machine,

            progress=progress,

            notes=request.notes,
        )

        db.add(
            new_request
        )

        db.flush()

        print(
            "Waste Request ID:",
            new_request.id,
        )

        print(
            "Machine:",
            new_request.machine,
        )

        # ====================================================
        # NOTIFICATION TO MANUFACTURER / ADMIN
        # ====================================================

        notification = create_notification(

            db=db,

            user_id=manufacturer_user.id,

            title="New Recycling Request",

            message=(
                f"{request.recycler} has requested "
                f"{request.material} "
                f"({request.quantity} "
                f"{request.unit or 'Kg'}) "
                "from your available waste."
            ),

            notification_type="waste_request",
        )

        # ====================================================
        # COMMIT
        # ====================================================

        db.commit()

        db.refresh(
            new_request
        )

        db.refresh(
            notification
        )

        print(
            "Request saved successfully."
        )

        print(
            "Notification saved successfully."
        )

        print("=" * 60)
        print("SUCCESS")
        print("=" * 60)

        return new_request

    except HTTPException:

        db.rollback()

        raise

    except Exception as exc:

        db.rollback()

        print(
            "ERROR CREATING WASTE REQUEST:",
            repr(exc),
        )

        raise HTTPException(
            status_code=500,
            detail=(
                "Failed to create waste request "
                "and notification."
            ),
        ) from exc


# ============================================================
# GET ALL WASTE REQUESTS
#
# ADMIN CAN SEE EVERYTHING
# ============================================================

@router.get(
    "/",
    response_model=list[WasteRequestResponse],
)
def get_all_waste_requests(
    db: Session = Depends(get_db),
):

    return (
        db.query(WasteRequest)
        .order_by(
            WasteRequest.id.desc()
        )
        .all()
    )


# ============================================================
# GET REQUEST BY ID
# ============================================================

@router.get(
    "/{request_id}",
    response_model=WasteRequestResponse,
)
def get_waste_request(
    request_id: int,
    db: Session = Depends(get_db),
):

    waste_request = (
        db.query(WasteRequest)
        .filter(
            WasteRequest.id == request_id
        )
        .first()
    )

    if not waste_request:

        raise HTTPException(
            status_code=404,
            detail="Waste request not found.",
        )

    return waste_request


# ============================================================
# UPDATE STATUS
#
# ADMIN + MANUFACTURER
# ============================================================

@router.patch(
    "/{request_id}/status",
    response_model=WasteRequestResponse,
)
def update_waste_request_status(
    request_id: int,
    status_data: WasteRequestStatusUpdate,
    db: Session = Depends(get_db),
):

    request = (
        db.query(WasteRequest)
        .filter(
            WasteRequest.id == request_id
        )
        .first()
    )

    if not request:

        raise HTTPException(
            status_code=404,
            detail="Waste request not found.",
        )

    # ========================================================
    # ALLOWED STATUS
    # ========================================================

    allowed_statuses = {
        "Pending",
        "Approved",
        "Processing",
        "Completed",
        "Rejected",
    }

    if status_data.status not in allowed_statuses:

        raise HTTPException(
            status_code=400,
            detail=(
                "Invalid status. Allowed statuses: "
                + ", ".join(
                    sorted(allowed_statuses)
                )
            ),
        )

    old_status = request.status

    request.status = (
        status_data.status
    )

    # ========================================================
    # FIND RECYCLER
    # ========================================================

    recycler_user = (
        find_user_by_name_or_email(
            request.recycler,
            db,
        )
    )

    # ========================================================
    # NOTIFY RECYCLER
    # ========================================================

    if (
        recycler_user
        and old_status != status_data.status
    ):

        status_messages = {

            "Approved": (
                f"Your recycling request "
                f"#{request.id} for "
                f"{request.material} "
                "has been approved."
            ),

            "Rejected": (
                f"Your recycling request "
                f"#{request.id} for "
                f"{request.material} "
                "has been rejected."
            ),

            "Processing": (
                f"Your recycling request "
                f"#{request.id} for "
                f"{request.material} "
                "is now being processed."
            ),

            "Completed": (
                f"Your recycling request "
                f"#{request.id} for "
                f"{request.material} "
                "has been completed."
            ),

            "Pending": (
                f"Your recycling request "
                f"#{request.id} for "
                f"{request.material} "
                "is pending."
            ),
        }

        message = status_messages.get(
            status_data.status,
            (
                f"Your recycling request "
                f"#{request.id} status changed "
                f"to {status_data.status}."
            ),
        )

        create_notification(

            db=db,

            user_id=recycler_user.id,

            title=(
                f"Recycling Request "
                f"{status_data.status}"
            ),

            message=message,

            notification_type="request_status",
        )

    # ========================================================
    # SAVE
    # ========================================================

    try:

        db.commit()

        db.refresh(
            request
        )

    except Exception as exc:

        db.rollback()

        raise HTTPException(
            status_code=500,
            detail="Failed to update waste request.",
        ) from exc

    return request


# ============================================================
# UPDATE PROCESSING
#
# ADMIN + MANUFACTURER
# ============================================================

@router.patch(
    "/{request_id}/processing",
    response_model=WasteRequestResponse,
)
def update_processing(
    request_id: int,
    processing_data: WasteRequestProcessingUpdate,
    db: Session = Depends(get_db),
):

    request = (
        db.query(WasteRequest)
        .filter(
            WasteRequest.id == request_id
        )
        .first()
    )

    if not request:

        raise HTTPException(
            status_code=404,
            detail="Waste request not found.",
        )

    # ========================================================
    # VALIDATE PROGRESS
    # ========================================================

    if (
        processing_data.progress < 0
        or processing_data.progress > 100
    ):

        raise HTTPException(
            status_code=400,
            detail=(
                "Progress must be between 0 and 100."
            ),
        )

    # ========================================================
    # MACHINE
    #
    # IMPORTANT FIX:
    # Never leave machine empty.
    # ========================================================

    machine = (
        str(processing_data.machine).strip()
        if processing_data.machine
        else ""
    )

    if not machine:

        machine = "Recycling Machine"

    request.machine = machine

    # ========================================================
    # PROGRESS
    # ========================================================

    request.progress = (
        processing_data.progress
    )

    # ========================================================
    # UPDATE STATUS AUTOMATICALLY
    # ========================================================

    old_status = request.status

    if processing_data.progress == 100:

        request.status = "Completed"

    else:

        request.status = "Processing"

    # ========================================================
    # NOTIFY RECYCLER
    # ========================================================

    if old_status != request.status:

        recycler_user = (
            find_user_by_name_or_email(
                request.recycler,
                db,
            )
        )

        if recycler_user:

            if request.status == "Completed":

                title = (
                    "Waste Processing Completed"
                )

                message = (
                    f"Your waste request "
                    f"#{request.id} for "
                    f"{request.material} "
                    "has been completed."
                )

            else:

                title = (
                    "Waste Processing Started"
                )

                message = (
                    f"Your waste request "
                    f"#{request.id} for "
                    f"{request.material} "
                    "is now being processed."
                )

            create_notification(

                db=db,

                user_id=recycler_user.id,

                title=title,

                message=message,

                notification_type="processing",
            )

    # ========================================================
    # SAVE
    # ========================================================

    try:

        db.commit()

        db.refresh(
            request
        )

    except Exception as exc:

        db.rollback()

        raise HTTPException(
            status_code=500,
            detail=(
                "Failed to update processing "
                "information."
            ),
        ) from exc

    return request


# ============================================================
# DELETE REQUEST
#
# ADMIN CAN DELETE ANY REQUEST
# ============================================================

@router.delete(
    "/{request_id}"
)
def delete_waste_request(
    request_id: int,
    db: Session = Depends(get_db),
):

    request = (
        db.query(WasteRequest)
        .filter(
            WasteRequest.id == request_id
        )
        .first()
    )

    if not request:

        raise HTTPException(
            status_code=404,
            detail="Waste request not found.",
        )

    try:

        db.delete(
            request
        )

        db.commit()

    except Exception as exc:

        db.rollback()

        raise HTTPException(
            status_code=500,
            detail=(
                "Failed to delete waste request."
            ),
        ) from exc

    return {
        "success": True,
        "message": (
            "Waste request deleted successfully."
        ),
        "request_id": request_id,
    }