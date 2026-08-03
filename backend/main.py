from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from auth.routes import router as auth_router

from routes.health import router as health_router
from routes.chatbot import router as chatbot_router
from routes.predict import router as predict_router
from routes.analytics import router as analytics_router

from database.init_db import init_database

app = FastAPI(
    title="SentinelAI",
    version="2.0.0",
)

init_database()

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router)
app.include_router(health_router)
app.include_router(chatbot_router)
app.include_router(predict_router)
app.include_router(analytics_router)


@app.get("/")
def root():

    return {
        "project": "SentinelAI",
        "status": "Running",
        "version": "2.0.0",
    }