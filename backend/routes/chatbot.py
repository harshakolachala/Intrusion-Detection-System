"""
/chatbot routes: turns a model prediction into a natural-language explanation
by combining retrieved reference context (rag/context_provider.py) with an
LLM call (llm/explainer.py).

NOTE on detection lookup: there is no shared detections DB yet (that lands
with Harsha's/Hasini's alerts + /predict work). Until then, GET below reads
from a small in-memory mock store that mirrors the frontend's Alerts.tsx
mock rows (a1-a4), so the whole path -> retrieval -> LLM -> response works
end-to-end today. Swap MOCK_DETECTIONS for a real lookup (DB call or shared
in-memory store from routes/alerts.py) once that piece exists -- the rest of
this file does not need to change.
"""

import logging
from typing import List, Optional

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

from rag.context_provider import get_context
from llm.explainer import generate_explanation

logger = logging.getLogger("routes.chatbot")

router = APIRouter(prefix="/chatbot", tags=["chatbot"])

# --- temporary mock detections store (mirrors frontend/src/pages/Alerts.tsx) ---
MOCK_DETECTIONS = {
    "a1": {"attackType": "DDoS", "confidence": 0.94, "sourceIp": "192.168.1.14"},
    "a2": {"attackType": "PortScan", "confidence": 0.81, "sourceIp": "10.0.0.22"},
    "a3": {"attackType": "FTP-Patator", "confidence": 0.88, "sourceIp": "172.16.0.5"},
    "a4": {"attackType": "Bot", "confidence": 0.62, "sourceIp": "192.168.1.30"},
}


class FeatureContribution(BaseModel):
    name: str
    value: str


class ExplainRequest(BaseModel):
    """Payload for direct/manual explanation requests (e.g. once /predict
    returns a prediction that hasn't been persisted as a detection_id yet)."""

    attack_type: str = Field(..., description="Predicted class name, e.g. 'DDoS'")
    confidence: float = Field(..., ge=0, le=1, description="Model confidence, 0-1")
    top_features: Optional[List[FeatureContribution]] = None
    top_k_context: int = Field(3, ge=1, le=10)


class ExplainResponse(BaseModel):
    detection_id: Optional[str] = None
    attack_type: str
    confidence: float
    explanation: str
    llm_provider: str
    sources: List[str]


def _build_response(
    detection_id: Optional[str],
    attack_type: str,
    confidence: float,
    top_features: Optional[List[dict]],
    top_k_context: int = 3,
) -> ExplainResponse:
    sources = get_context(attack_type, top_k=top_k_context)
    result = generate_explanation(
        attack_type=attack_type,
        confidence=confidence,
        context_snippets=sources,
        top_features=top_features,
    )
    return ExplainResponse(
        detection_id=detection_id,
        attack_type=attack_type,
        confidence=confidence,
        explanation=result["explanation"],
        llm_provider=result["provider"],
        sources=sources,
    )


@router.get("/explain/{detection_id}", response_model=ExplainResponse)
def explain_detection(detection_id: str):
    """Matches frontend/src/services/api.ts -> getExplanation(detectionId)."""
    detection = MOCK_DETECTIONS.get(detection_id)
    if detection is None:
        raise HTTPException(status_code=404, detail=f"Unknown detection_id '{detection_id}'")

    return _build_response(
        detection_id=detection_id,
        attack_type=detection["attackType"],
        confidence=detection["confidence"],
        top_features=None,
    )


@router.post("/explain", response_model=ExplainResponse)
def explain_manual(payload: ExplainRequest):
    """Direct explanation endpoint for testing, and for wiring straight to
    /predict's output once that endpoint exists (Hasini's part)."""
    top_features = [f.model_dump() for f in payload.top_features] if payload.top_features else None

    return _build_response(
        detection_id=None,
        attack_type=payload.attack_type,
        confidence=payload.confidence,
        top_features=top_features,
        top_k_context=payload.top_k_context,
    )
