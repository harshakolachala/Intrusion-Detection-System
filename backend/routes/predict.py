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


# -------------------------------------------------------
# Lazy Predictor
# -------------------------------------------------------
#
# The model is intentionally NOT loaded when this module
# is imported.
#
# This is important for:
#   - CI/CD
#   - backend startup
#   - testing
#
# The actual trained model is loaded only when a prediction
# request is made.
# -------------------------------------------------------

_predictor = None


def get_predictor():
    """
    Load the federated model only when prediction is requested.
    """

    global _predictor

    if _predictor is None:

        try:

            _predictor = Predictor()

        except FileNotFoundError as error:

            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail=(
                    "Federated prediction model is not available. "
                    "Train the federated model before using the "
                    "prediction endpoint."
                ),
            ) from error

        except Exception as error:

            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail=(
                    "Federated prediction service could not be "
                    "initialized."
                ),
            ) from error

    return _predictor


# -------------------------------------------------------
# Prediction Endpoint
# -------------------------------------------------------

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

    # ---------------------------------------------------
    # Validate feature count
    # ---------------------------------------------------

    if len(request.features) != INPUT_SIZE:

        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=(
                f"Expected {INPUT_SIZE} features, "
                f"received {len(request.features)}."
            ),
        )

    # ---------------------------------------------------
    # Load predictor only when actually needed
    # ---------------------------------------------------

    predictor = get_predictor()

    # ---------------------------------------------------
    # Run prediction
    # ---------------------------------------------------

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

    # ---------------------------------------------------
    # Audit prediction
    # ---------------------------------------------------

    AuditService.log(

        db=db,

        user_id=current_user.id,

        action="Prediction",

        resource="Intrusion Detection",

        details=f"Prediction: {result['prediction']}",

    )

    return result