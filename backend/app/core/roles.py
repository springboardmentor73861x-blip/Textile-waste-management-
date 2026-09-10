from fastapi import Depends, HTTPException

from app.core.auth import get_current_user
from app.models.user import User


def require_role(*allowed_roles: str):
    """
    Usage:
        @router.get("/admin-only")
        def route(user: User = Depends(require_role("admin"))):
            ...
    """

    def dependency(
        current_user: User = Depends(get_current_user),
    ) -> User:

        if current_user.role not in allowed_roles:

            raise HTTPException(
                status_code=403,
                detail="You do not have permission to access this resource.",
            )

        return current_user

    return dependency