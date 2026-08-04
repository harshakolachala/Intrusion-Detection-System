"""
Incident Routes.
"""

from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from database.session import get_db
from schemas.incident import (
    IncidentCreate,
    IncidentUpdate,
)
from services.incident_service import IncidentService

router = APIRouter(
    prefix="/incidents",
    tags=["Incidents"],
)


@router.get("/")
def get_incidents(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
):

    return IncidentService.get_all(
        db=db,
        skip=skip,
        limit=limit,
    )


@router.get("/statistics")
def get_statistics(
    db: Session = Depends(get_db),
):

    return IncidentService.statistics(db)


@router.get("/{incident_id}")
def get_incident(
    incident_id: UUID,
    db: Session = Depends(get_db),
):

    incident = IncidentService.get_by_id(
        db,
        incident_id,
    )

    if incident is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Incident not found.",
        )

    return incident


@router.post("/")
def create_incident(
    request: IncidentCreate,
    db: Session = Depends(get_db),
):

    return IncidentService.create(
        db=db,
        **request.model_dump(),
    )


@router.patch("/{incident_id}")
def update_incident(
    incident_id: UUID,
    request: IncidentUpdate,
    db: Session = Depends(get_db),
):

    incident = IncidentService.update(
        db,
        incident_id,
        request.model_dump(exclude_unset=True),
    )

    if incident is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Incident not found.",
        )

    return incident


@router.patch("/{incident_id}/close")
def close_incident(
    incident_id: UUID,
    resolution: str,
    db: Session = Depends(get_db),
):

    incident = IncidentService.close(
        db,
        incident_id,
        resolution,
    )

    if incident is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Incident not found.",
        )

    return incident


@router.delete("/{incident_id}")
def delete_incident(
    incident_id: UUID,
    db: Session = Depends(get_db),
):

    deleted = IncidentService.delete(
        db,
        incident_id,
    )

    if not deleted:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Incident not found.",
        )

    return {
        "message": "Incident deleted successfully."
    }