from sqlalchemy.orm import Session

from app.models.notification import Notification


# ==========================================================
# CREATE NOTIFICATION
# ==========================================================

def create_notification(
    db: Session,
    user_id: int,
    title: str,
    message: str,
    notification_type: str = "info",
):

    notification = Notification(

        user_id=user_id,

        title=title,

        message=message,

        notification_type=notification_type,

        is_read=False,
    )

    db.add(notification)

    db.commit()

    db.refresh(notification)

    return notification


# ==========================================================
# GET USER NOTIFICATIONS
# ==========================================================

def get_user_notifications(
    db: Session,
    user_id: int,
):

    return (
        db.query(Notification)
        .filter(
            Notification.user_id == user_id
        )
        .order_by(
            Notification.created_at.desc()
        )
        .all()
    )


# ==========================================================
# GET UNREAD NOTIFICATIONS COUNT
# ==========================================================

def get_unread_count(
    db: Session,
    user_id: int,
):

    return (
        db.query(Notification)
        .filter(
            Notification.user_id == user_id,
            Notification.is_read == False
        )
        .count()
    )


# ==========================================================
# GET SINGLE NOTIFICATION
# ==========================================================

def get_notification_by_id(
    db: Session,
    notification_id: int,
    user_id: int,
):

    return (
        db.query(Notification)
        .filter(
            Notification.id == notification_id,
            Notification.user_id == user_id
        )
        .first()
    )


# ==========================================================
# MARK NOTIFICATION AS READ
# ==========================================================

def mark_notification_as_read(
    db: Session,
    notification: Notification,
):

    notification.is_read = True

    db.commit()

    db.refresh(notification)

    return notification


# ==========================================================
# MARK ALL NOTIFICATIONS AS READ
# ==========================================================

def mark_all_notifications_as_read(
    db: Session,
    user_id: int,
):

    (
        db.query(Notification)
        .filter(
            Notification.user_id == user_id,
            Notification.is_read == False
        )
        .update(
            {"is_read": True},
            synchronize_session=False
        )
    )

    db.commit()


# ==========================================================
# DELETE NOTIFICATION
# ==========================================================

def delete_notification(
    db: Session,
    notification: Notification,
):

    db.delete(notification)

    db.commit()