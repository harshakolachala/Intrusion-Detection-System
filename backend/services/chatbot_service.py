"""
Chatbot Service.

Orchestrates the SentinelAI AI Assistant: retrieves relevant context
from two sources -- the static RAG knowledge base (rag/documents) and
live SentinelAI data (recent alerts/incidents/predictions) -- combines
them, asks the LLM for a grounded answer, and persists the exchange to
chat_history for audit/debugging.

This is intentionally the ONLY place that builds the "what does the
assistant currently know" context, so /chatbot/chat stays a thin route.
"""

import re
import logging
from typing import List, Optional

from sqlalchemy import desc, or_
from sqlalchemy.orm import Session

from models.alert import Alert
from models.incident import Incident
from models.prediction import Prediction
from models.chat import Chat
from models.user import User

from rag.context_provider import get_context, get_sources
from llm.explainer import generate_chat_response

logger = logging.getLogger("services.chatbot_service")

# Attack labels the IDS actually predicts (see ATTACK_SEVERITY in
# prediction_service.py) -- used to detect which attack, if any, the
# analyst is asking about so live records can be filtered by it.
KNOWN_ATTACK_TYPES = [
    "DDoS",
    "PortScan",
    "Bot",
    "DoS Hulk",
    "DoS GoldenEye",
    "DoS Slowhttptest",
    "DoS slowloris",
    "FTP-Patator",
    "SSH-Patator",
    "Heartbleed",
    "Infiltration",
    "Web Attack_Brute Force",
    "Web Attack_Sql Injection",
    "Web Attack_XSS",
    "BENIGN",
]

_RECENCY_KEYWORDS = (
    "recent", "latest", "last", "current", "currently", "now",
    "active", "summarize", "summary", "situation", "today",
)

_IP_PATTERN = re.compile(r"\b\d{1,3}(?:\.\d{1,3}){3}\b")

# Live records are summarised to only the fields useful for analysis --
# never raw DB rows -- to avoid leaking anything unrelated to the question.
_MAX_LIVE_RECORDS = 5


class ChatbotService:

    @staticmethod
    def _match_attack_type(message: str) -> Optional[str]:
        lowered = message.lower()
        for attack in KNOWN_ATTACK_TYPES:
            if attack.lower() in lowered:
                return attack
        return None

    @staticmethod
    def _extract_ip(message: str) -> Optional[str]:
        match = _IP_PATTERN.search(message)
        return match.group(0) if match else None

    @staticmethod
    def _wants_recent(message: str) -> bool:
        lowered = message.lower()
        return any(keyword in lowered for keyword in _RECENCY_KEYWORDS)

    @staticmethod
    def retrieve_live_context(db: Session, message: str) -> List[str]:
        """Pull relevant, *current* SentinelAI records for grounding.

        Filters by attack type / IP mentioned in the question when
        possible; otherwise falls back to "recent activity" only when the
        question actually asks about it, so unrelated questions (e.g.
        "what is a DDoS attack?") don't pull in noisy live data.
        """

        attack_type = ChatbotService._match_attack_type(message)
        source_ip = ChatbotService._extract_ip(message)
        wants_recent = ChatbotService._wants_recent(message)

        snippets: List[str] = []

        if attack_type or source_ip or wants_recent:
            alert_query = db.query(Alert).order_by(desc(Alert.created_at))

            if attack_type:
                alert_query = alert_query.filter(Alert.attack_type == attack_type)

            if source_ip:
                alert_query = alert_query.filter(
                    or_(Alert.source_ip == source_ip, Alert.destination_ip == source_ip)
                )

            for alert in alert_query.limit(_MAX_LIVE_RECORDS).all():
                snippets.append(
                    f"[Alert {alert.id[:8]}] {alert.attack_type} from "
                    f"{alert.source_ip} to {alert.destination_ip}:"
                    f"{alert.destination_port}/{alert.protocol} -- "
                    f"confidence {alert.confidence:.0%}, severity "
                    f"{alert.severity}, risk score {alert.risk_score}, "
                    f"status {alert.status}, detected "
                    f"{alert.created_at.strftime('%Y-%m-%d %H:%M UTC')}."
                )

        if attack_type or wants_recent or "incident" in message.lower():
            incident_query = db.query(Incident).order_by(desc(Incident.created_at))

            for incident in incident_query.limit(3).all():
                snippets.append(
                    f"[Incident {incident.id[:8]}] '{incident.title}' -- "
                    f"severity {incident.severity}, status {incident.status}, "
                    f"opened {incident.created_at.strftime('%Y-%m-%d %H:%M UTC')}."
                )

        if wants_recent and not attack_type and not source_ip:
            prediction_query = db.query(Prediction).order_by(desc(Prediction.created_at))

            for prediction in prediction_query.limit(_MAX_LIVE_RECORDS).all():
                snippets.append(
                    f"[Prediction {prediction.id[:8]}] {prediction.predicted_class} "
                    f"({prediction.confidence:.0%} confidence) "
                    f"{prediction.source_ip} -> {prediction.destination_ip}, "
                    f"{prediction.created_at.strftime('%Y-%m-%d %H:%M UTC')}."
                )

        return snippets

    @staticmethod
    def handle_chat(db: Session, user: User, message: str) -> dict:
        """Answer a SOC analyst's question, grounded in KB + live data.

        Returns {"response": str, "provider": str, "sources": List[str]}.
        """

        live_context = ChatbotService.retrieve_live_context(db, message)
        kb_context = get_context(message, top_k=3)
        kb_sources = get_sources(message, top_k=3)

        combined_context = live_context + kb_context

        result = generate_chat_response(
            question=message,
            context_snippets=combined_context,
        )

        # Live records cite themselves (e.g. "Alert 3f9a1c2b"); knowledge
        # base snippets cite their source markdown file.
        live_source_labels = [s.split("]", 1)[0].lstrip("[") for s in live_context]
        sources = live_source_labels + [s for s in kb_sources if s]

        ChatbotService._persist(
            db=db,
            user=user,
            message=message,
            response=result["response"],
            provider=result["provider"],
            context=combined_context,
        )

        return {
            "response": result["response"],
            "provider": result["provider"],
            "sources": sources,
        }

    @staticmethod
    def _persist(
        db: Session,
        user: User,
        message: str,
        response: str,
        provider: str,
        context: List[str],
    ) -> None:
        """Best-effort chat history logging. Never breaks the chat reply."""

        try:
            chat = Chat(
                user_id=user.id,
                question=message,
                response=response,
                llm_provider=provider,
                retrieved_context="\n".join(context) if context else None,
            )
            db.add(chat)
            db.commit()
        except Exception:
            logger.exception("Failed to persist chat history.")
            db.rollback()
