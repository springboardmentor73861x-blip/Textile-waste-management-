from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from passlib.context import CryptContext

from app.database import get_db
from app.models.user import User
from app.schemas.user import UserRegister, UserLogin


# ============================================================
# ROUTER
# ============================================================

router = APIRouter(
    prefix="/auth",
    tags=["Authentication"],
)


# ============================================================
# PASSWORD CONTEXT
# ============================================================
#
# IMPORTANT:
#
# We use bcrypt because your existing database passwords
# are bcrypt hashes.
#
# bcrypt has a maximum password length of 72 BYTES.
#
# We explicitly validate the password before hashing so
# bcrypt never receives an oversized password.
# ============================================================

pwd_context = CryptContext(
    schemes=["bcrypt"],
    deprecated="auto",
)


# ============================================================
# PASSWORD HELPERS
# ============================================================

def validate_password(password: str) -> None:
    """
    Validate password before sending it to bcrypt.
    """

    if password is None:
        raise HTTPException(
            status_code=400,
            detail="Password cannot be empty.",
        )

    if not password:
        raise HTTPException(
            status_code=400,
            detail="Password cannot be empty.",
        )

    # IMPORTANT:
    # bcrypt limit is BYTES, not characters.
    password_bytes = password.encode("utf-8")

    if len(password_bytes) > 72:
        raise HTTPException(
            status_code=400,
            detail=(
                "Password is too long. "
                "Please use a password of 72 bytes or fewer."
            ),
        )


def hash_password(password: str) -> str:
    """
    Hash a password using bcrypt.
    """

    validate_password(password)

    try:

        hashed = pwd_context.hash(password)

        return hashed

    except Exception as exc:

        print()
        print("=" * 70)
        print("PASSWORD HASHING ERROR")
        print("=" * 70)
        print("Error type:", type(exc).__name__)
        print("Error:", str(exc))
        print("=" * 70)

        raise HTTPException(
            status_code=500,
            detail="Password hashing failed.",
        ) from exc


def verify_password(
    plain_password: str,
    hashed_password: str,
) -> bool:
    """
    Verify a plain password against a stored bcrypt hash.
    """

    validate_password(plain_password)

    if not hashed_password:
        return False

    try:

        return pwd_context.verify(
            plain_password,
            hashed_password,
        )

    except Exception as exc:

        print()
        print("=" * 70)
        print("PASSWORD VERIFICATION ERROR")
        print("=" * 70)
        print("Error type:", type(exc).__name__)
        print("Error:", str(exc))
        print("=" * 70)

        return False


# ============================================================
# REGISTER
# ============================================================

@router.post("/register")
def register(
    user: UserRegister,
    db: Session = Depends(get_db),
):
    """
    Register a new user.
    """

    # --------------------------------------------------------
    # NORMALIZE EMAIL
    # --------------------------------------------------------

    email = user.email.strip().lower()

    # --------------------------------------------------------
    # VALIDATE NAME
    # --------------------------------------------------------

    full_name = user.full_name.strip()

    if not full_name:

        raise HTTPException(
            status_code=400,
            detail="Full name cannot be empty.",
        )

    # --------------------------------------------------------
    # VALIDATE EMAIL
    # --------------------------------------------------------

    if not email:

        raise HTTPException(
            status_code=400,
            detail="Email cannot be empty.",
        )

    # --------------------------------------------------------
    # VALIDATE PASSWORD
    # --------------------------------------------------------

    validate_password(user.password)

    # --------------------------------------------------------
    # DEBUG
    # --------------------------------------------------------

    password_bytes = user.password.encode("utf-8")

    print()
    print("=" * 70)
    print("REGISTER DEBUG")
    print("=" * 70)
    print("Name:", full_name)
    print("Email:", email)
    print("Password byte length:", len(password_bytes))
    print("Role:", user.role)
    print("=" * 70)

    # --------------------------------------------------------
    # CHECK EXISTING USER
    # --------------------------------------------------------

    existing_user = (
        db.query(User)
        .filter(User.email == email)
        .first()
    )

    if existing_user:

        raise HTTPException(
            status_code=400,
            detail="Email already registered.",
        )

    # --------------------------------------------------------
    # HASH PASSWORD
    # --------------------------------------------------------

    hashed_password = hash_password(
        user.password
    )

    # --------------------------------------------------------
    # CREATE USER
    # --------------------------------------------------------

    new_user = User(
        full_name=full_name,
        email=email,
        password=hashed_password,
        role=user.role,
    )

    # --------------------------------------------------------
    # DATABASE INSERT
    # --------------------------------------------------------

    try:

        db.add(new_user)

        db.commit()

        db.refresh(new_user)

    except Exception as exc:

        db.rollback()

        print()
        print("=" * 70)
        print("USER REGISTRATION DATABASE ERROR")
        print("=" * 70)
        print("Error type:", type(exc).__name__)
        print("Error:", str(exc))
        print("=" * 70)

        raise HTTPException(
            status_code=500,
            detail="Failed to create user.",
        ) from exc

    # --------------------------------------------------------
    # SUCCESS
    # --------------------------------------------------------

    print()
    print("✅ USER REGISTERED SUCCESSFULLY")
    print("ID:", new_user.id)
    print("Email:", new_user.email)
    print("Role:", new_user.role)

    return {
        "success": True,
        "message": "User registered successfully!",
        "user": {
            "id": new_user.id,
            "full_name": new_user.full_name,
            "email": new_user.email,
            "role": new_user.role,
        },
    }


# ============================================================
# LOGIN
# ============================================================

@router.post("/login")
def login(
    user: UserLogin,
    db: Session = Depends(get_db),
):
    """
    Authenticate an existing user.
    """

    # --------------------------------------------------------
    # NORMALIZE EMAIL
    # --------------------------------------------------------

    email = user.email.strip().lower()

    # --------------------------------------------------------
    # VALIDATE PASSWORD
    # --------------------------------------------------------

    validate_password(user.password)

    # --------------------------------------------------------
    # FIND USER
    # --------------------------------------------------------

    existing_user = (
        db.query(User)
        .filter(User.email == email)
        .first()
    )

    if not existing_user:

        print()
        print("❌ LOGIN FAILED")
        print("Reason: User not found")
        print("Email:", email)

        raise HTTPException(
            status_code=401,
            detail="Invalid email or password",
        )

    # --------------------------------------------------------
    # DEBUG
    # --------------------------------------------------------

    password_bytes = user.password.encode("utf-8")

    print()
    print("=" * 70)
    print("LOGIN DEBUG")
    print("=" * 70)
    print("Email:", email)
    print("Password byte length:", len(password_bytes))
    print(
        "Stored hash prefix:",
        existing_user.password[:20]
        if existing_user.password
        else "EMPTY",
    )
    print(
        "Stored hash type:",
        existing_user.password[:7]
        if existing_user.password
        else "EMPTY",
    )
    print("=" * 70)

    # --------------------------------------------------------
    # VERIFY PASSWORD
    # --------------------------------------------------------

    match = verify_password(
        user.password,
        existing_user.password,
    )

    # --------------------------------------------------------
    # PASSWORD WRONG
    # --------------------------------------------------------

    if not match:

        print("❌ PASSWORD MISMATCH")

        raise HTTPException(
            status_code=401,
            detail="Invalid email or password",
        )

    # --------------------------------------------------------
    # LOGIN SUCCESS
    # --------------------------------------------------------

    print()
    print("✅ PASSWORD MATCH")
    print("✅ LOGIN SUCCESSFUL")
    print("User:", existing_user.email)
    print("Role:", existing_user.role)

    # --------------------------------------------------------
    # RESPONSE
    # --------------------------------------------------------

    return {
        "success": True,
        "message": "Login successful",

        "user": {
            "id": existing_user.id,
            "full_name": existing_user.full_name,
            "email": existing_user.email,
            "role": existing_user.role,
        },

        # JWT can be added later.
        "access_token": None,
        "token_type": "bearer",
    }