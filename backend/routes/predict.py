from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel

from auth.dependencies import get_current_user
from federated.config import INPUT_SIZE
from federated.predict import Predictor
from models.user import User

router = APIRouter(
    prefix="/predict",
    tags=["Prediction"],
)

predictor = Predictor()


class PredictionRequest(BaseModel):
    features: list[float]


@router.post("/")
def predict(
    request: PredictionRequest,
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

    result = predictor.predict(request.features)

    return {
        "user": current_user.username,
        "prediction": result["prediction"],
        "confidence": result["confidence"],
    }