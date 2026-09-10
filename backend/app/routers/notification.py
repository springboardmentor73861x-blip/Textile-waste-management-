from fastapi import (
    APIRouter,
    Depends,
    HTTPException,
)

from sqlalchemy.orm import Session

from app.database import get_db
from app.core.auth import get_current_user
from app.models.user import User

from app.crud.notification import (
    get_user_notifications,
    get_unread_count,
    get_notification_by_id,
    mark_notification_as_read,
    mark_all_notifications_as_read,
    delete_notification,
)


# ==========================================================
# ROUTER
# ==========================================================

router = APIRouter(
    prefix="/notifications",
    tags=["Notifications"],
)


# ==========================================================
# GET ALL USER NOTIFICATIONS
# ==========================================================

@router.get("/")
def get_notifications(

    db: Session = Depends(get_db),

    current_user: User = Depends(
        get_current_user
    ),
):

    notifications = get_user_notifications(

        db=db,

        user_id=current_user.id,
    )

    return {

        "success": True,

        "count": len(notifications),

        "data": notifications,
    }


# ==========================================================
# GET UNREAD COUNT
# ==========================================================

@router.get("/unread-count")
def unread_notification_count(

    db: Session = Depends(get_db),

    current_user: User = Depends(
        get_current_user
    ),
):

    count = get_unread_count(

        db=db,

        user_id=current_user.id,
    )

    return {

        "success": True,

        "count": count,
    }


# ==========================================================
# MARK ALL NOTIFICATIONS AS READ
# IMPORTANT: This must come BEFORE /{notification_id}
# ==========================================================

@router.put("/mark-all-read")
def mark_all_read(

    db: Session = Depends(get_db),

    current_user: User = Depends(
        get_current_user
    ),
):

    mark_all_notifications_as_read(

        db=db,

        user_id=current_user.id,
    )

    return {

        "success": True,

        "message":
            "All notifications marked as read",
    }


# ==========================================================
# MARK SINGLE NOTIFICATION AS READ
# ==========================================================

@router.put("/{notification_id}/read")
def mark_as_read(

    notification_id: int,

    db: Session = Depends(get_db),

    current_user: User = Depends(
        get_current_user
    ),
):

    notification = get_notification_by_id(

        db=db,

        notification_id=notification_id,

        user_id=current_user.id,
    )

    if notification is None:

        raise HTTPException(
            status_code=404,
            detail="Notification not found",
        )

    updated_notification = (
        mark_notification_as_read(

            db=db,

            notification=notification,
        )
    )

    return {

        "success": True,

        "data": updated_notification,
    }


# ==========================================================
# DELETE NOTIFICATION
# ==========================================================

@router.delete("/{notification_id}")
def delete_notification_route(

    notification_id: int,

    db: Session = Depends(get_db),

    current_user: User = Depends(
        get_current_user
    ),
):

    notification = get_notification_by_id(

        db=db,

        notification_id=notification_id,

        user_id=current_user.id,
    )

    if notification is None:

        raise HTTPException(
            status_code=404,
            detail="Notification not found",
        )

    delete_notification(

        db=db,

        notification=notification,
    )

    return {

        "success": True,

        "message":
            "Notification deleted successfully",
    }