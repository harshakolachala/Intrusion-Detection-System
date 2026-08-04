"""
Alert Schemas.
"""

from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, ConfigDict


class AlertCreate(BaseModel):

    source_ip: str
    destination_ip: str

    source_port: int
    destination_port: int

    protocol: str

    attack_type: str

    confidence: float

    severity: str = "Medium"

    risk_score: int = 50


class AlertUpdate(BaseModel):

    status: str


class AlertResponse(BaseModel):

    model_config = ConfigDict(from_attributes=True)

    id: UUID

    source_ip: str
    destination_ip: str

    source_port: int
    destination_port: int

    protocol: str

    attack_type: str

    confidence: float

    severity: str

    risk_score: int

    status: str

    mitre_attack: str | None

    llm_summary: str | None

    created_at: datetime

    updated_at: datetime


class AlertStatistics(BaseModel):

    total: int

    open: int

    closed: int

    critical: int

    high: int

    medium: int

    low: int