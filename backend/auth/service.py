"""
Authentication service.

Contains the business logic for user registration
and authentication.
"""

from datetime import datetime, timezone

from sqlalchemy.orm import Session

from auth.jwt import create_access_token
from auth.security import hash_password, verify_password
from models.user import User


class AuthService:

    @staticmethod
    def register(
        db: Session,
        username: str,
        email: str,
        password: str,
    ) -> User:

        existing_user = (
            db.query(User)
            .filter(User.username == username)
            .first()
        )

        if existing_user:
            raise ValueError("Username already exists.")

        existing_email = (
            db.query(User)
            .filter(User.email == email)
            .first()
        )

        if existing_email:
            raise ValueError("Email already exists.")

        user = User(
            username=username,
            email=email,
            password_hash=hash_password(password),
        )

        db.add(user)
        db.commit()
        db.refresh(user)

        return user

    @staticmethod
    def authenticate(
        db: Session,
        username: str,
        password: str,
    ):

        user = (
            db.query(User)
            .filter(User.username == username)
            .first()
        )

        if user is None:
            return None

        if not verify_password(
            password,
            user.password_hash,
        ):
            return None

        user.last_login = datetime.now(timezone.utc)

        db.commit()

        token = create_access_token(
            {
                "sub": user.username,
                "role": user.role,
                "user_id": str(user.id),
            }
        )

        return {
            "user": user,
            "access_token": token,
            "token_type": "bearer",
        }

    @staticmethod
    def get_user(
        db: Session,
        username: str,
    ):

        return (
            db.query(User)
            .filter(User.username == username)
            .first()
        )