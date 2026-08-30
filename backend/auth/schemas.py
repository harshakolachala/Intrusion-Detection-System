"""
Authentication schemas.

Pydantic models for request and response validation.
"""

from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, ConfigDict, EmailStr, Field, field_validator


MAX_PASSWORD_BYTES = 72


def validate_password_bytes(value: str) -> str:
    """Validate password against bcrypt's 72-byte limitation."""
    if len(value.encode("utf-8")) > MAX_PASSWORD_BYTES:
        raise ValueError("Password cannot be longer than 72 bytes.")
    return value


class UserRegister(BaseModel):
    username: str = Field(min_length=3, max_length=50)
    email: EmailStr
    password: str = Field(min_length=8, max_length=72)

    @field_validator("password")
    @classmethod
    def validate_password(cls, value: str) -> str:
        return validate_password_bytes(value)


class UserLogin(BaseModel):
    username: str = Field(min_length=1, max_length=50)
    password: str = Field(min_length=1, max_length=72)

    @field_validator("password")
    @classmethod
    def validate_password(cls, value: str) -> str:
        return validate_password_bytes(value)


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"


class UserResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    username: str
    email: EmailStr
    role: str
    is_active: bool
    is_verified: bool
    created_at: datetime
    last_login: datetime | None


class UserProfileUpdate(BaseModel):
    full_name: str | None = Field(default=None, max_length=120)
    organization: str | None = Field(default=None, max_length=120)
    department: str | None = Field(default=None, max_length=120)
    job_title: str | None = Field(default=None, max_length=120)
    phone: str | None = Field(default=None, max_length=40)
    location: str | None = Field(default=None, max_length=120)
    bio: str | None = Field(default=None, max_length=1000)


class UserProfileResponse(UserProfileUpdate):
    user_id: UUID
    username: str
    email: EmailStr
    role: str
    created_at: datetime
    last_login: datetime | None
    updated_at: datetime | None = None
