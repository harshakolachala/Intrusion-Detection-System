"""
SentinelAI WebSocket Events.

Centralized event publishing functions used by the
real-time detection engine and SOC dashboard.
"""

from datetime import datetime, timezone

from websocket.manager import manager


def _timestamp():
    """Return UTC ISO timestamp."""

    return datetime.now(
        timezone.utc
    ).isoformat()


# =========================================================
# ASYNC PUBLISHERS
# Used directly from FastAPI async code.
# =========================================================

async def publish_prediction(
    prediction_id=None,
    prediction=None,
    confidence=None,
    latency_ms=None,
    source_ip=None,
    destination_ip=None,
    source_port=None,
    destination_port=None,
    protocol=None,
    alert_created=False,
    alert_id=None,
    severity=None,
    risk_score=None,
):
    """Publish a prediction event to connected SOC clients."""

    event = {
        "event": "prediction",
        "timestamp": _timestamp(),
        "data": {
            "prediction_id": prediction_id,
            "prediction": prediction,
            "confidence": confidence,
            "latency_ms": latency_ms,
            "source_ip": source_ip,
            "destination_ip": destination_ip,
            "source_port": source_port,
            "destination_port": destination_port,
            "protocol": protocol,
            "alert_created": alert_created,
            "alert_id": alert_id,
            "severity": severity,
            "risk_score": risk_score,
        },
    }

    await manager.broadcast(event)


async def publish_alert(
    alert_id=None,
    attack_type=None,
    confidence=None,
    severity=None,
    risk_score=None,
    source_ip=None,
    destination_ip=None,
    source_port=None,
    destination_port=None,
    protocol=None,
):
    """Publish an intrusion alert event."""

    event = {
        "event": "alert",
        "timestamp": _timestamp(),
        "data": {
            "alert_id": alert_id,
            "attack_type": attack_type,
            "confidence": confidence,
            "severity": severity,
            "risk_score": risk_score,
            "source_ip": source_ip,
            "destination_ip": destination_ip,
            "source_port": source_port,
            "destination_port": destination_port,
            "protocol": protocol,
        },
    }

    await manager.broadcast(event)


async def publish_engine_status(
    running: bool,
    interface=None,
):
    """Publish detection-engine status."""

    event = {
        "event": "engine_status",
        "timestamp": _timestamp(),
        "data": {
            "running": running,
            "interface": interface,
            "connections": manager.connection_count(),
        },
    }

    await manager.broadcast(event)


# =========================================================
# THREAD-SAFE PUBLISHERS
#
# Used by the real-time DetectionEngine / PredictionService.
#
# The detection engine is running in a normal Python thread,
# therefore it must NOT directly await the async functions.
# =========================================================

def publish_prediction_from_thread(
    prediction_id=None,
    prediction=None,
    confidence=None,
    latency_ms=None,
    source_ip=None,
    destination_ip=None,
    source_port=None,
    destination_port=None,
    protocol=None,
    alert_created=False,
    alert_id=None,
    severity=None,
    risk_score=None,
):
    """
    Publish prediction event from a background thread.
    """

    event = {
        "event": "prediction",
        "timestamp": _timestamp(),
        "data": {
            "prediction_id": prediction_id,
            "prediction": prediction,
            "confidence": confidence,
            "latency_ms": latency_ms,
            "source_ip": source_ip,
            "destination_ip": destination_ip,
            "source_port": source_port,
            "destination_port": destination_port,
            "protocol": protocol,
            "alert_created": alert_created,
            "alert_id": alert_id,
            "severity": severity,
            "risk_score": risk_score,
        },
    }

    manager.broadcast_from_thread(event)


def publish_alert_from_thread(
    alert_id=None,
    attack_type=None,
    confidence=None,
    severity=None,
    risk_score=None,
    source_ip=None,
    destination_ip=None,
    source_port=None,
    destination_port=None,
    protocol=None,
):
    """
    Publish intrusion alert from a background thread.
    """

    event = {
        "event": "alert",
        "timestamp": _timestamp(),
        "data": {
            "alert_id": alert_id,
            "attack_type": attack_type,
            "confidence": confidence,
            "severity": severity,
            "risk_score": risk_score,
            "source_ip": source_ip,
            "destination_ip": destination_ip,
            "source_port": source_port,
            "destination_port": destination_port,
            "protocol": protocol,
        },
    }

    manager.broadcast_from_thread(event)


def publish_engine_status_from_thread(
    running: bool,
    interface=None,
):
    """
    Publish engine status from a background thread.
    """

    event = {
        "event": "engine_status",
        "timestamp": _timestamp(),
        "data": {
            "running": running,
            "interface": interface,
            "connections": manager.connection_count(),
        },
    }

    manager.broadcast_from_thread(event)