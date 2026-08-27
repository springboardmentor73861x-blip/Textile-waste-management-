from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session

from app.core.security import verify_token
from app.db.session import get_db
from app.models.user import User

security = HTTPBearer()


def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db),
):
    print("=" * 60)
    print("AUTH HEADER:")
    print(credentials)
    print("=" * 60)

    token = credentials.credentials

    print("TOKEN:")
    print(token)

    payload = verify_token(token)

    print("PAYLOAD:")
    print(payload)

    if payload is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token",
        )

    email = payload.get("sub")

    user = (
        db.query(User)
        .filter(User.email == email)
        .first()
    )

    print("USER:", user)

    if user is None:
        raise HTTPException(
            status_code=404,
            detail="User not found",
        )

    return user