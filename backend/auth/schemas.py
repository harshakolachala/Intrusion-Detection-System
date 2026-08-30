"""
Authentication schemas.

Pydantic models for request and response validation.
"""

from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, ConfigDict, EmailStr, Field, field_validator


MAX_PASSWORD_BYTES = 72


def validate_password_bytes(value: str) -> str:
    """
    Validate password against bcrypt's 72-byte limitation.
    """

    if len(value.encode("utf-8")) > MAX_PASSWORD_BYTES:
        raise ValueError(
            "Password cannot be longer than 72 bytes."
        )

    return value


class UserRegister(BaseModel):
    username: str = Field(
        min_length=3,
        max_length=50,
    )

    email: EmailStr

    password: str = Field(
        min_length=8,
        max_length=72,
    )

    @field_validator("password")
    @classmethod
    def validate_password(cls, value: str) -> str:
        return validate_password_bytes(value)


class UserLogin(BaseModel):
    username: str = Field(
        min_length=1,
        max_length=50,
    )

    password: str = Field(
        min_length=1,
        max_length=72,
    )

    @field_validator("password")
    @classmethod
    def validate_password(cls, value: str) -> str:
        return validate_password_bytes(value)


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"


class UserResponse(BaseModel):
    model_config = ConfigDict(
        from_attributes=True
    )

    id: UUID

    username: str

    email: EmailStr

    role: str

    is_active: bool

    is_verified: bool

    created_at: datetime

    last_login: datetime | None