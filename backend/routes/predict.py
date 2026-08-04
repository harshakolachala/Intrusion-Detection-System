"""
Prediction Routes.
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from auth.dependencies import get_current_user
from database.session import get_db
from federated.config import INPUT_SIZE
from federated.predict import Predictor
from models.user import User
from schemas.prediction import (
    PredictionRequest,
    PredictionResponse,
)
from services.audit_service import AuditService
from services.prediction_service import PredictionService

router = APIRouter(
    prefix="/predict",
    tags=["Prediction"],
)

predictor = Predictor()


@router.post(
    "/",
    response_model=PredictionResponse,
)
def predict(
    request: PredictionRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Predict whether the given network flow is normal or malicious.

    Requires authentication.
    """

    if len(request.features) != INPUT_SIZE:

        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Expected {INPUT_SIZE} features, received {len(request.features)}.",
        )

    result = PredictionService.predict(

        db=db,

        predictor=predictor,

        features=request.features,

        source_ip=request.source_ip,

        destination_ip=request.destination_ip,

        source_port=request.source_port,

        destination_port=request.destination_port,

        protocol=request.protocol,

    )

    AuditService.log(

        db=db,

        user_id=current_user.id,

        action="Prediction",

        resource="Intrusion Detection",

        details=f"Prediction: {result['prediction']}",

    )

    return result