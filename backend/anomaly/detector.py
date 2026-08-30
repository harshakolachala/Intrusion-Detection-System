"""Anomaly detector layered on top of supervised IDS predictions."""

from dataclasses import dataclass, asdict
from typing import Iterable

from anomaly.scorer import anomaly_score


@dataclass(frozen=True)
class AnomalyResult:
    is_anomaly: bool
    score: float
    threshold: float
    reason: str

    def to_dict(self):
        return asdict(self)


class AnomalyDetector:
    def __init__(self, threshold: float = 55.0):
        self.threshold = min(100.0, max(0.0, float(threshold)))

    def detect(self, confidence: float, probabilities: Iterable[float] | None = None) -> AnomalyResult:
        score = anomaly_score(confidence, probabilities)
        flagged = score >= self.threshold
        reason = "high_model_uncertainty" if flagged else "within_expected_confidence"
        return AnomalyResult(flagged, score, self.threshold, reason)
