from sqlalchemy.orm import Session

from app.models.activity import Activity


def create_activity(
    db: Session,
    username: str,
    action: str,
    status: str,
    role: str = "user",
    company_name: str | None = None,
    company_code: str | None = None
):
    activity = Activity(
        username=username,
        role=role,
        company_name=company_name,
        company_code=company_code,
        action=action,
        status=status,
        
    )

    db.add(activity)
    db.commit()
    db.refresh(activity)

    return activity


def get_recent_activities(db: Session, limit: int = 10):
    return (
        db.query(Activity)
        .order_by(Activity.created_at.desc())
        .limit(limit)
        .all()
    )