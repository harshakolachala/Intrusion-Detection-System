"""FedSentry chatbot routes.

Uses RAG + LLM for the AI Assistant:
  - GET  /chatbot/status       -> safe readiness information
  - POST /chatbot/chat         -> grounded security Q&A
  - GET  /chatbot/explain/{id} -> explain an existing alert
  - POST /chatbot/explain      -> explain an unsaved prediction
"""

import logging
from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session

from auth.dependencies import get_current_user
from database.session import get_db
from models.user import User
from rag.context_provider import get_context, get_rag_status
from llm.explainer import generate_explanation, get_llm_status
from services.alert_service import AlertService
from services.chatbot_service import ChatbotService

logger = logging.getLogger("routes.chatbot")

router = APIRouter(prefix="/chatbot", tags=["Chatbot"])


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


class ChatbotStatusResponse(BaseModel):
    ready: bool
    llm: dict
    rag: dict


@router.get("/status", response_model=ChatbotStatusResponse)
def chatbot_status(current_user: User = Depends(get_current_user)):
    """Return chatbot readiness without exposing credentials."""
    _ = current_user
    llm = get_llm_status()
    rag = get_rag_status()
    rag_ready = int(rag.get("documents", 0) or 0) > 0
    return ChatbotStatusResponse(
        ready=bool(llm.get("ready")) and rag_ready,
        llm=llm,
        rag=rag,
    )


def _build_explanation(
    detection_id: Optional[str],
    attack_type: str,
    confidence: float,
    top_features: Optional[List[dict]],
    top_k_context: int = 3,
):
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


@router.post("/chat", response_model=ChatResponse)
def chat(
    request: ChatRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Chat with the RAG-powered FedSentry security assistant."""
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


@router.get("/explain/{detection_id}", response_model=ExplainResponse)
def explain_detection(
    detection_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    alert = AlertService.get_by_id(db, detection_id)
    if alert is None:
        raise HTTPException(status_code=404, detail="Detection not found.")

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


@router.post("/explain", response_model=ExplainResponse)
def explain_manual(
    payload: ExplainRequest,
    current_user: User = Depends(get_current_user),
):
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
