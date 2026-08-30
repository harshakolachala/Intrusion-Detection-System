"""Authentication and authenticated profile routes."""

from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session

from auth.dependencies import get_current_user as get_authenticated_user
from auth.schemas import (
    TokenResponse,
    UserProfileResponse,
    UserProfileUpdate,
    UserRegister,
    UserResponse,
)
from auth.service import AuthService
from database.session import get_db
from models.user import User
from models.user_profile import UserProfile

router = APIRouter(tags=["Authentication"])


@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
def register(request: UserRegister, db: Session = Depends(get_db)):
    try:
        return AuthService.register(
            db=db,
            username=request.username,
            email=request.email,
            password=request.password,
        )
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc))


@router.post("/login", response_model=TokenResponse)
def login(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db),
):
    result = AuthService.authenticate(
        db=db,
        username=form_data.username,
        password=form_data.password,
    )
    if result is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid username or password.",
        )
    return {"access_token": result["access_token"], "token_type": result["token_type"]}


@router.get("/me", response_model=UserResponse)
def get_me(current_user: User = Depends(get_authenticated_user)):
    return current_user


def _profile_payload(user: User, profile: UserProfile | None) -> dict:
    return {
        "user_id": user.id,
        "username": user.username,
        "email": user.email,
        "role": user.role,
        "created_at": user.created_at,
        "last_login": user.last_login,
        "full_name": profile.full_name if profile else None,
        "organization": profile.organization if profile else None,
        "department": profile.department if profile else None,
        "job_title": profile.job_title if profile else None,
        "phone": profile.phone if profile else None,
        "location": profile.location if profile else None,
        "bio": profile.bio if profile else None,
        "updated_at": profile.updated_at if profile else None,
    }


@router.get("/profile", response_model=UserProfileResponse)
def get_profile(
    current_user: User = Depends(get_authenticated_user),
    db: Session = Depends(get_db),
):
    profile = db.query(UserProfile).filter(UserProfile.user_id == current_user.id).first()
    return _profile_payload(current_user, profile)


@router.patch("/profile", response_model=UserProfileResponse)
def update_profile(
    request: UserProfileUpdate,
    current_user: User = Depends(get_authenticated_user),
    db: Session = Depends(get_db),
):
    profile = db.query(UserProfile).filter(UserProfile.user_id == current_user.id).first()
    if profile is None:
        profile = UserProfile(user_id=current_user.id)
        db.add(profile)

    for field, value in request.model_dump().items():
        if isinstance(value, str):
            value = value.strip() or None
        setattr(profile, field, value)

    profile.updated_at = datetime.now(timezone.utc)
    db.commit()
    db.refresh(profile)
    return _profile_payload(current_user, profile)
