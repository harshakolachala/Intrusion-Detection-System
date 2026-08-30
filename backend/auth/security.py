"""
Password hashing utilities for FedSentry.

Uses bcrypt through Passlib.
Bcrypt has a maximum input size of 72 bytes, so passwords are
validated before hashing/verification instead of being silently
truncated.
"""

from passlib.context import CryptContext


pwd_context = CryptContext(
    schemes=["bcrypt"],
    deprecated="auto",
)


MAX_PASSWORD_BYTES = 72


def validate_password_length(password: str) -> None:
    """
    Validate password size in bytes.

    Bcrypt supports a maximum of 72 bytes.
    We reject longer passwords rather than silently truncating them.
    """

    if not isinstance(password, str):
        raise ValueError("Password must be a string.")

    password_bytes = len(password.encode("utf-8"))

    if password_bytes > MAX_PASSWORD_BYTES:
        raise ValueError(
            "Password cannot be longer than 72 bytes."
        )


def hash_password(password: str) -> str:
    """
    Hash a plain-text password.
    """

    validate_password_length(password)

    return pwd_context.hash(password)


def verify_password(
    plain_password: str,
    hashed_password: str,
) -> bool:
    """
    Verify a password against its stored hash.
    """

    try:
        validate_password_length(plain_password)

        return pwd_context.verify(
            plain_password,
            hashed_password,
        )

    except ValueError:
        return False