"""
Prediction Schemas.
"""

from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, ConfigDict


class PredictionRequest(BaseModel):

    features: list[float]

    source_ip: str

    destination_ip: str

    source_port: int

    destination_port: int

    protocol: str


class PredictionResponse(BaseModel):

    prediction_id: UUID

    prediction: str

    confidence: float

    latency_ms: float

    alert_created: bool

    alert_id: UUID | None = None


class PredictionHistory(BaseModel):

    model_config = ConfigDict(from_attributes=True)

    id: UUID

    model_version: str

    source_ip: str

    destination_ip: str

    predicted_class: str

    confidence: float

    latency_ms: float

    alert_id: UUID | None

    created_at: datetime


class PredictionStatistics(BaseModel):

    total_predictions: int

    malicious_predictions: int

    benign_predictions: int

    average_confidence: float

    average_latency_ms: float