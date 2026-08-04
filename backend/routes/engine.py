"""
Engine Routes.

API endpoints for controlling the Detection Engine.
Uses lazy loading to avoid blocking server startup.
"""

from fastapi import APIRouter, Query, HTTPException

router = APIRouter(
    prefix="/engine",
    tags=["Engine"],
)


def _get_engine():
    """Lazy import to avoid blocking server startup."""
    from engine import engine
    return engine


@router.post("/start")
def start_engine(interface: str = Query(None, description="Network interface to capture on")):
    """Start the detection engine."""
    eng = _get_engine()
    eng.start(interface=interface)
    return {"status": "started", "interface": interface or "default"}


@router.post("/stop")
def stop_engine():
    """Stop the detection engine."""
    eng = _get_engine()
    eng.stop()
    return {"status": "stopped"}


@router.get("/status")
def engine_status():
    """Get engine status and statistics."""
    try:
        eng = _get_engine()
        return eng.statistics()
    except Exception as e:
        return {"status": "not_running", "error": str(e)}
