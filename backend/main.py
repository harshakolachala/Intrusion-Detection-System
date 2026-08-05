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
from routes.incidents import router as incidents_router
from routes.predictions import router as predictions_router
from core.logger import logger

from database.init_db import init_database

app = FastAPI(
    title="SentinelAI",
    version="2.0.0",
    description="Enterprise Real-Time Federated Intrusion Detection System with Explainable AI",
)

register_exception_handlers(app)

# Initialize Database
init_database()
logger.info("SentinelAI Backend Started Successfully")

# CORS Configuration
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

# Request Logging
app.add_middleware(
    BaseHTTPMiddleware,
    dispatch=LoggingMiddleware(),
)

# Authentication
app.include_router(auth_router, prefix="/auth", tags=["Authentication"])

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

# Incident Management
app.include_router(incidents_router)

# Prediction Management
app.include_router(predictions_router)


@app.on_event("startup")
async def startup():
    logger.info("SentinelAI API Started")


@app.on_event("shutdown")
async def shutdown():
    logger.info("SentinelAI API Stopped")


@app.get("/")
def root():
    return {
        "project": "SentinelAI",
        "status": "Running",
        "version": "2.0.0",
        "database": "Connected",
        "api": "Online",
    }