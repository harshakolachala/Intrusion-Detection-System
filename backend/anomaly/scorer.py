"""Generic anomaly scoring utilities for IDS confidence outputs."""

from math import log
from typing import Iterable


def normalized_entropy(probabilities: Iterable[float]) -> float:
    values = [max(0.0, float(p)) for p in probabilities]
    total = sum(values)
    if total <= 0 or len(values) <= 1:
        return 0.0
    values = [p / total for p in values]
    entropy = -sum(p * log(p) for p in values if p > 0)
    return entropy / log(len(values))


def anomaly_score(confidence: float, probabilities: Iterable[float] | None = None) -> float:
    """Return a 0-100 uncertainty/anomaly score.

    Low model confidence and high predictive entropy increase the score. This
    complements the supervised IDS without changing its trained model.
    """
    confidence = min(1.0, max(0.0, float(confidence)))
    uncertainty = 1.0 - confidence
    entropy = normalized_entropy(probabilities) if probabilities is not None else uncertainty
    score = (0.6 * uncertainty) + (0.4 * entropy)
    return round(min(100.0, max(0.0, score * 100.0)), 2)
