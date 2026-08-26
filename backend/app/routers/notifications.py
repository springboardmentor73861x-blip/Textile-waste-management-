from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db

from app.models.notification import Notification
from app.models.user import User


# ============================================================
# ROUTER
# ============================================================

router = APIRouter(
    prefix="/notifications",
    tags=["Notifications"],
)


# ============================================================
# GET USER NOTIFICATIONS
# ============================================================

@router.get("/")
def get_notifications(
    user_id: int,
    db: Session = Depends(get_db),
):

    user = (

        db.query(User)

        .filter(
            User.id == user_id
        )

        .first()

    )

    if not user:

        raise HTTPException(

            status_code=404,

            detail="User not found.",

        )

    notifications = (

        db.query(Notification)

        .filter(
            Notification.user_id == user_id
        )

        .order_by(
            Notification.created_at.desc()
        )

        .all()

    )

    return {

        "success": True,

        "count": len(notifications),

        "notifications": [

            {

                "id":
                    notification.id,

                "user_id":
                    notification.user_id,

                "title":
                    notification.title,

                "message":
                    notification.message,

                "notification_type":
                    notification.notification_type,

                "is_read":
                    notification.is_read,

                "created_at":
                    notification.created_at,

            }

            for notification in notifications

        ],

    }


# ============================================================
# MARK ONE READ
# ============================================================

@router.put(
    "/{notification_id}/read"
)
def mark_notification_as_read(
    notification_id: int,
    db: Session = Depends(get_db),
):

    notification = (

        db.query(Notification)

        .filter(
            Notification.id == notification_id
        )

        .first()

    )

    if not notification:

        raise HTTPException(

            status_code=404,

            detail="Notification not found.",

        )

    notification.is_read = True

    try:

        db.commit()

        db.refresh(notification)

    except Exception as exc:

        db.rollback()

        raise HTTPException(

            status_code=500,

            detail=(
                "Failed to mark notification as read."
            ),

        ) from exc

    return {

        "success": True,

        "message":
            "Notification marked as read.",

    }


# ============================================================
# MARK ALL READ
# ============================================================

@router.put(
    "/read-all"
)
def mark_all_notifications_as_read(
    user_id: int,
    db: Session = Depends(get_db),
):

    user = (

        db.query(User)

        .filter(
            User.id == user_id
        )

        .first()

    )

    if not user:

        raise HTTPException(

            status_code=404,

            detail="User not found.",

        )

    notifications = (

        db.query(Notification)

        .filter(

            Notification.user_id == user_id,

            Notification.is_read == False,

        )

        .all()

    )

    for notification in notifications:

        notification.is_read = True

    try:

        db.commit()

    except Exception as exc:

        db.rollback()

        raise HTTPException(

            status_code=500,

            detail=(
                "Failed to mark all "
                "notifications as read."
            ),

        ) from exc

    return {

        "success": True,

        "message":
            "All notifications marked as read.",

        "updated_count":
            len(notifications),

    }


# ============================================================
# TEST NOTIFICATION
# ============================================================

@router.post(
    "/test"
)
def create_test_notification(
    user_id: int,
    db: Session = Depends(get_db),
):

    user = (

        db.query(User)

        .filter(
            User.id == user_id
        )

        .first()

    )

    if not user:

        raise HTTPException(

            status_code=404,

            detail="User not found.",

        )

    notification = Notification(

        user_id=user_id,

        title="Test Notification",

        message=(
            "Your notification system "
            "is working successfully."
        ),

        notification_type="system",

        is_read=False,

    )

    try:

        db.add(notification)

        db.commit()

        db.refresh(notification)

    except Exception as exc:

        db.rollback()

        raise HTTPException(

            status_code=500,

            detail=(
                "Failed to create notification."
            ),

        ) from exc

    return {

        "success": True,

        "message":
            "Test notification created.",

        "notification": {

            "id":
                notification.id,

            "user_id":
                notification.user_id,

            "title":
                notification.title,

            "message":
                notification.message,

            "notification_type":
                notification.notification_type,

            "is_read":
                notification.is_read,

            "created_at":
                notification.created_at,

        },

    }