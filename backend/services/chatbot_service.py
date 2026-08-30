"""
Chatbot Service.

Orchestrates the FedSentry AI Assistant: retrieves relevant context from the
static RAG knowledge base and live FedSentry data, combines them, asks the LLM
for a grounded answer, and persists the exchange for audit/debugging.
"""

import logging
import re
from typing import List, Optional

from sqlalchemy import desc, or_
from sqlalchemy.orm import Session

from llm.explainer import generate_chat_response
from models.alert import Alert
from models.chat import Chat
from models.incident import Incident
from models.prediction import Prediction
from models.user import User
from rag.context_provider import get_context, get_sources

logger = logging.getLogger("services.chatbot_service")

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
    "recent",
    "latest",
    "last",
    "current",
    "currently",
    "now",
    "active",
    "summarize",
    "summary",
    "situation",
    "today",
)

_IP_PATTERN = re.compile(r"\b\d{1,3}(?:\.\d{1,3}){3}\b")
_MAX_LIVE_RECORDS = 5


def _short_id(value: object, length: int = 8) -> str:
    """Return a short printable identifier for UUIDs, strings, ints, etc."""
    if value is None:
        return "unknown"
    return str(value)[:length]


def _format_timestamp(value: object) -> str:
    if value is None:
        return "unknown time"
    formatter = getattr(value, "strftime", None)
    if callable(formatter):
        try:
            return formatter("%Y-%m-%d %H:%M UTC")
        except Exception:  # noqa: BLE001
            pass
    return str(value)


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
        """Pull relevant current FedSentry records without breaking chat.

        Database context is enrichment, not a hard dependency. Any malformed
        or unexpected record is skipped so RAG + LLM chat can still respond.
        """
        attack_type = ChatbotService._match_attack_type(message)
        source_ip = ChatbotService._extract_ip(message)
        wants_recent = ChatbotService._wants_recent(message)
        snippets: List[str] = []

        if attack_type or source_ip or wants_recent:
            try:
                alert_query = db.query(Alert).order_by(desc(Alert.created_at))
                if attack_type:
                    alert_query = alert_query.filter(Alert.attack_type == attack_type)
                if source_ip:
                    alert_query = alert_query.filter(
                        or_(Alert.source_ip == source_ip, Alert.destination_ip == source_ip)
                    )

                for alert in alert_query.limit(_MAX_LIVE_RECORDS).all():
                    try:
                        confidence = float(alert.confidence or 0)
                        snippets.append(
                            f"[Alert {_short_id(alert.id)}] {alert.attack_type} from "
                            f"{alert.source_ip} to {alert.destination_ip}:"
                            f"{alert.destination_port}/{alert.protocol} -- "
                            f"confidence {confidence:.0%}, severity "
                            f"{alert.severity}, risk score {alert.risk_score}, "
                            f"status {alert.status}, detected "
                            f"{_format_timestamp(alert.created_at)}."
                        )
                    except Exception as exc:  # noqa: BLE001
                        logger.warning("Skipping malformed alert context row: %s", exc)
            except Exception as exc:  # noqa: BLE001
                logger.warning("Could not retrieve live alert context: %s", exc)

        if attack_type or wants_recent or "incident" in message.lower():
            try:
                incident_query = db.query(Incident).order_by(desc(Incident.created_at))
                for incident in incident_query.limit(3).all():
                    try:
                        snippets.append(
                            f"[Incident {_short_id(incident.id)}] '{incident.title}' -- "
                            f"severity {incident.severity}, status {incident.status}, "
                            f"opened {_format_timestamp(incident.created_at)}."
                        )
                    except Exception as exc:  # noqa: BLE001
                        logger.warning("Skipping malformed incident context row: %s", exc)
            except Exception as exc:  # noqa: BLE001
                logger.warning("Could not retrieve live incident context: %s", exc)

        if wants_recent and not attack_type and not source_ip:
            try:
                prediction_query = db.query(Prediction).order_by(desc(Prediction.created_at))
                for prediction in prediction_query.limit(_MAX_LIVE_RECORDS).all():
                    try:
                        confidence = float(prediction.confidence or 0)
                        snippets.append(
                            f"[Prediction {_short_id(prediction.id)}] {prediction.predicted_class} "
                            f"({confidence:.0%} confidence) "
                            f"{prediction.source_ip} -> {prediction.destination_ip}, "
                            f"{_format_timestamp(prediction.created_at)}."
                        )
                    except Exception as exc:  # noqa: BLE001
                        logger.warning("Skipping malformed prediction context row: %s", exc)
            except Exception as exc:  # noqa: BLE001
                logger.warning("Could not retrieve live prediction context: %s", exc)

        return snippets

    @staticmethod
    def handle_chat(db: Session, user: User, message: str) -> dict:
        """Answer a SOC analyst question using live context + RAG + LLM."""
        live_context = ChatbotService.retrieve_live_context(db, message)
        kb_context = get_context(message, top_k=3)
        kb_sources = get_sources(message, top_k=3)

        combined_context = live_context + kb_context
        result = generate_chat_response(
            question=message,
            context_snippets=combined_context,
        )

        live_source_labels = [
            snippet.split("]", 1)[0].lstrip("[")
            for snippet in live_context
            if snippet.startswith("[") and "]" in snippet
        ]
        sources = live_source_labels + [source for source in kb_sources if source]

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
