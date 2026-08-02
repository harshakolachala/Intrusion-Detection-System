from fastapi import APIRouter
from pydantic import BaseModel

from federated.predict import Predictor
from federated.config import INPUT_SIZE

router = APIRouter(
    prefix="/predict",
    tags=["Prediction"]
)

predictor = Predictor()


class PredictionRequest(BaseModel):
    features: list[float]


@router.post("/")
def predict(request: PredictionRequest):

    if len(request.features) != INPUT_SIZE:
        return {
            "error": f"Expected {INPUT_SIZE} features."
        }

    result = predictor.predict(request.features)

    return result