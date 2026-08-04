"""
Alert Routes.
"""

from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from database.session import get_db

from schemas.alert import (
    AlertResponse,
    AlertStatistics,
    AlertUpdate,
)

from services.alert_service import AlertService

router = APIRouter(
    prefix="/alerts",
    tags=["Alerts"],
)


@router.get(
    "/",
    response_model=list[AlertResponse],
)
def get_alerts(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
):

    return AlertService.get_all(
        db=db,
        skip=skip,
        limit=limit,
    )


@router.get(
    "/statistics",
    response_model=AlertStatistics,
)
def get_statistics(
    db: Session = Depends(get_db),
):

    return AlertService.statistics(db)


@router.get(
    "/{alert_id}",
    response_model=AlertResponse,
)
def get_alert(
    alert_id: UUID,
    db: Session = Depends(get_db),
):

    alert = AlertService.get_by_id(
        db,
        alert_id,
    )

    if alert is None:

        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Alert not found.",
        )

    return alert


@router.patch(
    "/{alert_id}/status",
    response_model=AlertResponse,
)
def update_alert_status(
    alert_id: UUID,
    request: AlertUpdate,
    db: Session = Depends(get_db),
):

    alert = AlertService.update_status(
        db,
        alert_id,
        request.status,
    )

    if alert is None:

        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Alert not found.",
        )

    return alert


@router.delete(
    "/{alert_id}",
)
def delete_alert(
    alert_id: UUID,
    db: Session = Depends(get_db),
):

    deleted = AlertService.delete(
        db,
        alert_id,
    )

    if not deleted:

        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Alert not found.",
        )

    return {
        "message": "Alert deleted successfully."
    }