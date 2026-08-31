"""
FedSentry Backend
Main Application
"""

from datetime import datetime, timezone

from fastapi import (
    FastAPI,
    WebSocket,
    WebSocketDisconnect,
)

from fastapi.middleware.cors import CORSMiddleware
from starlette.middleware.base import BaseHTTPMiddleware

from auth.routes import router as auth_router

from routes.health import router as health_router
from routes.chatbot import router as chatbot_router
from routes.predict import router as predict_router
from routes.analytics import router as analytics_router
from routes.alerts import router as alerts_router
from routes.audit import router as audit_router
from routes.engine import router as engine_router
from routes.incidents import router as incidents_router
from routes.predictions import router as predictions_router
from routes.reports import router as reports_router

from exceptions import register_exception_handlers
from middleware import LoggingMiddleware

from core.logger import logger
from core.security_headers import SecurityHeadersMiddleware

from database.init_db import init_database

from websocket.manager import manager


app = FastAPI(
    title="FedSentry",
    version="2.1.0",
    description=(
        "Enterprise Real-Time Federated Intrusion "
        "Detection System with Explainable AI"
    ),
)


# =========================================================
# Exception Handling
# =========================================================

register_exception_handlers(app)


# =========================================================
# Database
# =========================================================

init_database()

logger.info(
    "FedSentry Backend Started Successfully"
)


# =========================================================
# CORS
# =========================================================

origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://localhost:8000",
    "http://127.0.0.1:8000",
]


app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# =========================================================
# Security / Request Correlation
# =========================================================

app.add_middleware(SecurityHeadersMiddleware)


# =========================================================
# Request Logging
# =========================================================

app.add_middleware(
    BaseHTTPMiddleware,
    dispatch=LoggingMiddleware(),
)


# =========================================================
# Authentication
# =========================================================

app.include_router(
    auth_router,
    prefix="/auth",
    tags=["Authentication"],
)


# =========================================================
# Core APIs
# =========================================================

app.include_router(health_router)

app.include_router(predict_router)

app.include_router(chatbot_router)


# =========================================================
# Analytics
# =========================================================

app.include_router(analytics_router)


# =========================================================
# Alerts
# =========================================================

app.include_router(alerts_router)


# =========================================================
# Audit
# =========================================================

app.include_router(audit_router)


# =========================================================
# Detection Engine
# =========================================================

app.include_router(engine_router)


# =========================================================
# Incidents
# =========================================================

app.include_router(incidents_router)


# =========================================================
# Predictions
# =========================================================

app.include_router(predictions_router)


# =========================================================
# Reports / Exports
# =========================================================

app.include_router(reports_router)


# =========================================================
# WebSocket — Real-Time SOC Events
# =========================================================

@app.websocket("/ws/events")
async def websocket_events(
    websocket: WebSocket,
):
    """
    Real-time WebSocket endpoint.

    Frontend connects to:

        ws://127.0.0.1:8000/ws/events
    """

    await manager.connect(websocket)

    logger.info(
        "SOC WebSocket client connected | "
        f"Clients={manager.connection_count()}"
    )

    try:

        await websocket.send_json(
            {
                "event": "connection",
                "timestamp": datetime.now(
                    timezone.utc
                ).isoformat(),
                "data": {
                    "status": "connected",
                    "message": (
                        "FedSentry real-time "
                        "event stream connected."
                    ),
                },
            }
        )

        while True:

            await websocket.receive_text()

    except WebSocketDisconnect:

        manager.disconnect(websocket)

        logger.info(
            "SOC WebSocket client disconnected | "
            f"Clients={manager.connection_count()}"
        )

    except Exception as exc:

        manager.disconnect(websocket)

        logger.exception(
            f"WebSocket error: {exc}"
        )


# =========================================================
# Application Lifecycle
# =========================================================

@app.on_event("startup")
async def startup():

    logger.info(
        "FedSentry API Started"
    )


@app.on_event("shutdown")
async def shutdown():

    logger.info(
        "FedSentry API Stopped"
    )


# =========================================================
# Root
# =========================================================

@app.get("/")
def root():

    return {
        "project": "FedSentry",
        "status": "Running",
        "version": "2.1.0",
        "database": "Connected",
        "api": "Online",
        "websocket": "/ws/events",
    }
