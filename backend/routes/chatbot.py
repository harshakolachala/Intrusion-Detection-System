"""
Chatbot routes.

Uses RAG + LLM to explain IDS predictions.
"""

import logging
from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field

from auth.dependencies import get_current_user
from models.user import User

from rag.context_provider import get_context
from llm.explainer import generate_explanation

logger = logging.getLogger("routes.chatbot")

router = APIRouter(
    prefix="/chatbot",
    tags=["Chatbot"],
)

# Temporary mock detections
MOCK_DETECTIONS = {
    "a1": {
        "attackType": "DDoS",
        "confidence": 0.94,
        "sourceIp": "192.168.1.14",
    },
    "a2": {
        "attackType": "PortScan",
        "confidence": 0.81,
        "sourceIp": "10.0.0.22",
    },
    "a3": {
        "attackType": "FTP-Patator",
        "confidence": 0.88,
        "sourceIp": "172.16.0.5",
    },
    "a4": {
        "attackType": "Bot",
        "confidence": 0.62,
        "sourceIp": "192.168.1.30",
    },
}


class FeatureContribution(BaseModel):
    name: str
    value: str


class ExplainRequest(BaseModel):
    attack_type: str = Field(...)
    confidence: float = Field(..., ge=0, le=1)
    top_features: Optional[List[FeatureContribution]] = None
    top_k_context: int = Field(3, ge=1, le=10)


class ExplainResponse(BaseModel):
    detection_id: Optional[str] = None
    attack_type: str
    confidence: float
    explanation: str
    llm_provider: str
    sources: List[str]


class ChatRequest(BaseModel):
    message: str = Field(..., min_length=1, max_length=500)


class ChatResponse(BaseModel):
    response: str
    sources: List[str]
    llm_provider: str


def _build_response(
    detection_id: Optional[str],
    attack_type: str,
    confidence: float,
    top_features: Optional[List[dict]],
    top_k_context: int = 3,
):

    sources = get_context(
        attack_type,
        top_k=top_k_context,
    )

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


@router.post(
    "/chat",
    response_model=ChatResponse,
)
def chat(
    request: ChatRequest,
    current_user: User = Depends(get_current_user),
):
    """
    Chat with the RAG-powered cybersecurity assistant.
    """

    logger.info(
        "User %s sent chat message: %s",
        current_user.username,
        request.message[:50],
    )

    # Get context from RAG knowledge base
    sources = get_context("security", top_k=3)

    # Generate explanation using the LLM
    result = generate_explanation(
        attack_type="general",
        confidence=1.0,
        context_snippets=sources,
        top_features=None,
    )

    return ChatResponse(
        response=result["explanation"],
        sources=sources,
        llm_provider=result["provider"],
    )


@router.get(
    "/explain/{detection_id}",
    response_model=ExplainResponse,
)
def explain_detection(
    detection_id: str,
    current_user: User = Depends(get_current_user),
):
    """
    Explain an existing detection.
    """

    detection = MOCK_DETECTIONS.get(detection_id)

    if detection is None:
        raise HTTPException(
            status_code=404,
            detail="Detection not found.",
        )

    logger.info(
        "User %s requested explanation for %s",
        current_user.username,
        detection_id,
    )

    return _build_response(
        detection_id=detection_id,
        attack_type=detection["attackType"],
        confidence=detection["confidence"],
        top_features=None,
    )


@router.post(
    "/explain",
    response_model=ExplainResponse,
)
def explain_manual(
    payload: ExplainRequest,
    current_user: User = Depends(get_current_user),
):
    """
    Explain a prediction that has not yet been saved.
    """

    logger.info(
        "User %s requested manual explanation.",
        current_user.username,
    )

    top_features = (
        [feature.model_dump() for feature in payload.top_features]
        if payload.top_features
        else None
    )

    return _build_response(
        detection_id=None,
        attack_type=payload.attack_type,
        confidence=payload.confidence,
        top_features=top_features,
        top_k_context=payload.top_k_context,
    )
