"""
Prediction History Schemas.
"""

from datetime import datetime
from uuid import UUID

from pydantic import BaseModel


class PredictionResponse(BaseModel):
    id: UUID
    model_version: str
    source_ip: str
    destination_ip: str
    predicted_class: str
    confidence: float
    latency_ms: float
    alert_id: UUID | None
    created_at: datetime

    class Config:
        from_attributes = True