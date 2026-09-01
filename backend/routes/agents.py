"""Remote FedSentry sensor ingestion routes.

A lightweight sensor can run on a monitored endpoint/network, extract the
same 78 CICIDS-style flow features locally, and forward only flow metadata and
features to the central FedSentry backend. Raw packets never need to leave the
sensor host.
"""

import hmac
import os

from fastapi import APIRouter, Depends, Header, HTTPException, status
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session

from database.session import get_db
from federated.config import INPUT_SIZE
from routes.predict import get_predictor
from services.prediction_service import PredictionService


router = APIRouter(prefix="/agents", tags=["Remote Sensors"])


class AgentFlowRequest(BaseModel):
    agent_id: str = Field(min_length=1, max_length=128)
    features: list[float]
    source_ip: str
    destination_ip: str
    source_port: int = Field(ge=0, le=65535)
    destination_port: int = Field(ge=0, le=65535)
    protocol: str = Field(min_length=1, max_length=32)


class AgentFlowResponse(BaseModel):
    agent_id: str
    prediction_id: str
    prediction: str
    confidence: float
    latency_ms: float
    alert_created: bool
    alert_id: str | None


def _require_agent_key(x_agent_key: str | None = Header(default=None)) -> None:
    expected = os.getenv("AGENT_API_KEY", "").strip()

    if not expected:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Remote sensor ingestion is not configured.",
        )

    if not x_agent_key or not hmac.compare_digest(x_agent_key, expected):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid sensor credentials.",
        )


@router.get("/health")
def agent_health(_: None = Depends(_require_agent_key)):
    return {
        "service": "FedSentry Remote Sensor Gateway",
        "status": "ready",
        "expected_features": INPUT_SIZE,
    }


@router.post("/ingest", response_model=AgentFlowResponse)
def ingest_agent_flow(
    request: AgentFlowRequest,
    _: None = Depends(_require_agent_key),
    db: Session = Depends(get_db),
):
    """Score a locally extracted sensor flow in the central IDS pipeline."""

    if len(request.features) != INPUT_SIZE:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=(
                f"Expected {INPUT_SIZE} features, "
                f"received {len(request.features)}."
            ),
        )

    predictor = get_predictor()
    result = PredictionService.predict(
        db=db,
        predictor=predictor,
        features=request.features,
        source_ip=request.source_ip,
        destination_ip=request.destination_ip,
        source_port=request.source_port,
        destination_port=request.destination_port,
        protocol=request.protocol,
        model_version=f"remote-agent:{request.agent_id}",
    )

    return {
        "agent_id": request.agent_id,
        **result,
    }
