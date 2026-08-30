"""
Chatbot routes.

Uses RAG + LLM to power the SentinelAI AI Assistant:
  - POST /chatbot/chat        -> free-form Q&A, grounded in the security
                                  knowledge base AND live SentinelAI data.
  - GET  /chatbot/explain/{id} -> explain an existing alert.
  - POST /chatbot/explain      -> explain a prediction that hasn't been
                                   saved yet (used by the Predict page).
"""

import logging
from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session

from auth.dependencies import get_current_user
from database.session import get_db
from models.user import User

from rag.context_provider import get_context
from llm.explainer import generate_explanation
from services.alert_service import AlertService
from services.chatbot_service import ChatbotService

logger = logging.getLogger("routes.chatbot")

router = APIRouter(
    prefix="/chatbot",
    tags=["Chatbot"],
)


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
    context_used: bool


def _build_explanation(
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
    db: Session = Depends(get_db),
):
    """
    Chat with the RAG-powered SentinelAI security assistant.

    Grounds answers in the static security knowledge base AND live
    SentinelAI data (recent alerts/incidents/predictions relevant to
    the question), so analysts can ask about the system's current
    state as well as general cybersecurity topics.
    """

    logger.info(
        "User %s sent chat message: %s",
        current_user.username,
        request.message[:50],
    )

    result = ChatbotService.handle_chat(
        db=db,
        user=current_user,
        message=request.message,
    )

    return ChatResponse(
        response=result["response"],
        sources=result["sources"],
        llm_provider=result["provider"],
        context_used=bool(result["sources"]),
    )


@router.get(
    "/explain/{detection_id}",
    response_model=ExplainResponse,
)
def explain_detection(
    detection_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Explain an existing detection using its real alert record.
    """

    alert = AlertService.get_by_id(db, detection_id)

    if alert is None:
        raise HTTPException(
            status_code=404,
            detail="Detection not found.",
        )

    logger.info(
        "User %s requested explanation for %s",
        current_user.username,
        detection_id,
    )

    return _build_explanation(
        detection_id=detection_id,
        attack_type=alert.attack_type,
        confidence=alert.confidence,
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

    return _build_explanation(
        detection_id=None,
        attack_type=payload.attack_type,
        confidence=payload.confidence,
        top_features=top_features,
        top_k_context=payload.top_k_context,
    )
