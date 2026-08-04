"""
Analytics Schemas.
"""

from pydantic import BaseModel


class DashboardSummary(BaseModel):

    total_predictions: int

    total_alerts: int

    open_alerts: int

    closed_alerts: int

    malicious_predictions: int

    benign_predictions: int

    average_confidence: float

    average_latency_ms: float


class AttackDistribution(BaseModel):

    attack_type: str

    count: int


class SeverityDistribution(BaseModel):

    severity: str

    count: int


class ConfidenceStatistics(BaseModel):

    minimum: float

    maximum: float

    average: float


class TimelineStatistics(BaseModel):

    date: str

    predictions: int

    alerts: int


class AnalyticsResponse(BaseModel):

    summary: DashboardSummary

    attack_distribution: list[AttackDistribution]

    severity_distribution: list[SeverityDistribution]

    confidence: ConfidenceStatistics

    timeline: list[TimelineStatistics]