"""
Prediction History Routes.
"""

from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from database.session import get_db
from services.prediction_history_service import PredictionHistoryService

router = APIRouter(
    prefix="/predictions",
    tags=["Predictions"],
)


@router.get("/")
def get_predictions(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
):

    return PredictionHistoryService.get_all(
        db=db,
        skip=skip,
        limit=limit,
    )


@router.get("/statistics")
def get_statistics(
    db: Session = Depends(get_db),
):

    return PredictionHistoryService.statistics(db)


@router.get("/attack/{attack_type}")
def get_predictions_by_attack(
    attack_type: str,
    db: Session = Depends(get_db),
):

    return PredictionHistoryService.get_by_attack(
        db,
        attack_type,
    )


@router.get("/source/{source_ip}")
def get_predictions_by_source(
    source_ip: str,
    db: Session = Depends(get_db),
):

    return PredictionHistoryService.get_by_source_ip(
        db,
        source_ip,
    )


@router.get("/{prediction_id}")
def get_prediction(
    prediction_id: UUID,
    db: Session = Depends(get_db),
):

    prediction = PredictionHistoryService.get_by_id(
        db,
        prediction_id,
    )

    if prediction is None:

        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Prediction not found.",
        )

    return prediction