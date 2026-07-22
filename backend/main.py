from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routes.health import router as health_router
from routes.chatbot import router as chatbot_router
from routes import analytics

app = FastAPI(
    title="Intrusion Detection System",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(health_router)
app.include_router(chatbot_router)
app.include_router(analytics.router)



@app.get("/")
def root():
    return {
        "project": "Intrusion Detection System",
        "status": "Running"
    }