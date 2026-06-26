from fastapi import FastAPI

app = FastAPI(title="Intrusion Detection System")

@app.get("/")
def home():
    return {
        "message": "Backend Running"
    }