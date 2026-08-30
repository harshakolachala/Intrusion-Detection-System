"""API endpoints for controlling the FedSentry detection engine."""

from fastapi import APIRouter, HTTPException, Query, status

router = APIRouter(prefix="/engine", tags=["Engine"])


def _get_engine():
    """Lazy import to avoid blocking server startup."""
    from engine import engine

    return engine


@router.post("/start")
def start_engine(
    interface: str | None = Query(
        default=None,
        description="Network interface to capture on",
    ),
):
    """Start packet capture and verify the processing worker is active."""
    eng = _get_engine()
    try:
        stats = eng.start(interface=interface)
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Unable to start detection engine: {exc}",
        ) from exc

    if not stats.get("running", False):
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Detection engine did not reach a running state.",
        )

    return {
        "status": "started",
        "verified": True,
        "interface": interface or "default",
        "engine": stats,
    }


@router.post("/stop")
def stop_engine():
    """Stop packet capture and verify analysis has fully stopped."""
    eng = _get_engine()
    try:
        stats = eng.stop()
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Unable to stop detection engine: {exc}",
        ) from exc

    capture_running = bool(stats.get("capture", {}).get("running", False))
    worker_alive = bool(stats.get("worker_alive", False))
    queue_size = int(stats.get("queue", {}).get("queue_size", 0) or 0)
    active_flows = int(stats.get("flows", {}).get("active_flows", 0) or 0)

    verified = not any(
        [
            bool(stats.get("running", False)),
            capture_running,
            worker_alive,
            queue_size > 0,
            active_flows > 0,
        ]
    )

    if not verified:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail={
                "message": "Detection engine stop could not be verified.",
                "engine": stats,
            },
        )

    return {
        "status": "stopped",
        "verified": True,
        "engine": stats,
    }


@router.get("/status")
def engine_status():
    """Return the actual capture, worker, queue, and flow state."""
    try:
        eng = _get_engine()
        return eng.statistics()
    except Exception as exc:
        return {
            "running": False,
            "status": "not_running",
            "error": str(exc),
        }
