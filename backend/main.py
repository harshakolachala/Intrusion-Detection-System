"""
SentinelAI Backend
Main Application
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from auth.routes import router as auth_router

from routes.health import router as health_router
from routes.chatbot import router as chatbot_router
from routes.predict import router as predict_router
from routes.analytics import router as analytics_router
from routes.alerts import router as alerts_router
from routes.audit import router as audit_router
from routes.engine import router as engine_router
from exceptions import register_exception_handlers
from middleware import LoggingMiddleware
from starlette.middleware.base import BaseHTTPMiddleware

from database.init_db import init_database

app = FastAPI(
    title="SentinelAI",
    version="2.0.0",
    description="Enterprise Real-Time Federated Intrusion Detection System with Explainable AI",
)

register_exception_handlers(app)

# Initialize Database
init_database()

# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Request Logging
app.add_middleware(
    BaseHTTPMiddleware,
    dispatch=LoggingMiddleware(),
)

# Authentication
app.include_router(auth_router)

# Core APIs
app.include_router(health_router)
app.include_router(predict_router)
app.include_router(chatbot_router)

# Analytics
app.include_router(analytics_router)

# Alert Management
app.include_router(alerts_router)

# Audit Logs
app.include_router(audit_router)
app.include_router(engine_router)


@app.get("/")
def root():

    return {
        "project": "SentinelAI",
        "status": "Running",
        "version": "2.0.0",
        "database": "Connected",
        "api": "Online",
    }