"""
Authentication routes.
"""

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session

from auth.dependencies import get_current_user as get_authenticated_user
from auth.schemas import (
    UserRegister,
    UserResponse,
    TokenResponse,
)
from auth.service import AuthService
from database.session import get_db
from models.user import User

router = APIRouter(
    tags=["Authentication"],
)


@router.post(
    "/register",
    response_model=UserResponse,
    status_code=status.HTTP_201_CREATED,
)
def register(
    request: UserRegister,
    db: Session = Depends(get_db),
):
    try:
        user = AuthService.register(
            db=db,
            username=request.username,
            email=request.email,
            password=request.password,
        )

        return user

    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e),
        )


@router.post(
    "/login",
    response_model=TokenResponse,
)
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

    return {
        "access_token": result["access_token"],
        "token_type": result["token_type"],
    }


@router.get(
    "/me",
    response_model=UserResponse,
)
def get_me(
    current_user: User = Depends(get_authenticated_user),
):
    """
    Returns the currently authenticated user.
    """
    return current_user