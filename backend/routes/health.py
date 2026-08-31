from datetime import datetime, timezone

from fastapi import APIRouter, Response, status
from sqlalchemy import text

from database.session import SessionLocal

router = APIRouter(tags=["Health"])


@router.get("/health")
def health():
    return {
        "status": "healthy",
        "service": "FedSentry API",
        "timestamp": datetime.now(timezone.utc).isoformat(),
    }


@router.get("/health/live")
def liveness():
    """Process-level liveness probe for containers/orchestrators."""
    return {
        "status": "alive",
        "timestamp": datetime.now(timezone.utc).isoformat(),
    }


@router.get("/health/ready")
def readiness(response: Response):
    """Readiness probe that verifies the database is reachable."""
    database_ready = False
    error = None
    db = SessionLocal()
    try:
        db.execute(text("SELECT 1"))
        database_ready = True
    except Exception as exc:  # noqa: BLE001
        error = str(exc)
        response.status_code = status.HTTP_503_SERVICE_UNAVAILABLE
    finally:
        db.close()

    payload = {
        "status": "ready" if database_ready else "not_ready",
        "database": "ready" if database_ready else "unavailable",
        "timestamp": datetime.now(timezone.utc).isoformat(),
    }
    if error:
        payload["error"] = error
    return payload
