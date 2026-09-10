from collections import Counter

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.core.roles import require_role
from app.models.user import User

from app.crud.textile import get_all_textiles
from app.crud.user import get_all_users

from app.services.analytics import (
    calculate_circular_economy_analytics,
)


router = APIRouter(
    prefix="/dashboard",
    tags=["Dashboard"],
)


# ==========================================================
# ADMIN DASHBOARD — PLATFORM-WIDE ANALYTICS
# ==========================================================

@router.get("/admin")
def admin_dashboard(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("admin")),
):

    # ------------------------------------------------------
    # Platform-wide textile analytics
    # (reuses your existing Milestone 3 analytics engine)
    # ------------------------------------------------------

    all_textiles = get_all_textiles(db)

    analytics = calculate_circular_economy_analytics(
        all_textiles
    )

    # ------------------------------------------------------
    # Users breakdown
    # ------------------------------------------------------

    all_users = get_all_users(db)

    role_counter = Counter(
        user.role for user in all_users
    )

    # ------------------------------------------------------
    # Uploads per user (leaderboard-style, top 5)
    # ------------------------------------------------------

    uploads_per_user = Counter(
        textile.user_id for textile in all_textiles
    )

    user_lookup = {
        user.id: user.full_name for user in all_users
    }

    top_contributors = [
        {
            "user_id": user_id,
            "full_name": user_lookup.get(
                user_id, "Unknown"
            ),
            "upload_count": count,
        }
        for user_id, count in uploads_per_user.most_common(5)
    ]

    return {
        "success": True,
        "data": {
            "total_users": len(all_users),
            "total_textiles": len(all_textiles),
            "users_by_role": dict(role_counter),
            "top_contributors": top_contributors,
            "platform_analytics": analytics,
        },
    }


# ==========================================================
# ADMIN — LIST ALL USERS
# ==========================================================

@router.get("/admin/users")
def list_users(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("admin")),
):

    users = get_all_users(db)

    return {
        "success": True,
        "count": len(users),
        "data": [
            {
                "id": u.id,
                "full_name": u.full_name,
                "email": u.email,
                "role": u.role,
            }
            for u in users
        ],
    }
    
from app.crud.user import get_user_by_id, update_user_role
from pydantic import BaseModel

class RoleUpdate(BaseModel):
    role: str

@router.put("/admin/users/{user_id}/role")
def update_user_role_route(
    user_id: int,
    data: RoleUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("admin")),
):
    allowed_roles = [
        "recycling_operator",
        "sustainability_manager",
        "manufacturer",
        "admin",
    ]

    if data.role not in allowed_roles:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid role. Must be one of: {allowed_roles}",
        )

    user = get_user_by_id(db, user_id)

    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    if user.id == current_user.id:
        raise HTTPException(
            status_code=400,
            detail="You cannot change your own role.",
        )

    updated = update_user_role(db, user, data.role)

    return {
        "success": True,
        "message": f"Role updated to {updated.role}",
        "data": {
            "id": updated.id,
            "full_name": updated.full_name,
            "email": updated.email,
            "role": updated.role,
        },
    }    