"""Downloadable CSV and PDF reporting endpoints for FedSentry."""

from datetime import datetime, timezone
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import Response
from sqlalchemy import func
from sqlalchemy.orm import Session

from database.session import get_db
from models.alert import Alert
from models.incident import Incident
from models.prediction import Prediction
from reports.csv_export import export_alerts, export_incidents, export_predictions
from reports.incident_report import build_incident_pdf
from reports.pdf_report import build_security_summary_pdf

router = APIRouter(prefix="/reports", tags=["Reports"])


def _filename(prefix: str, extension: str) -> str:
    stamp = datetime.now(timezone.utc).strftime("%Y%m%d-%H%M%S")
    return f"{prefix}-{stamp}.{extension}"


def _download_response(content: bytes | str, media_type: str, filename: str) -> Response:
    return Response(
        content=content,
        media_type=media_type,
        headers={
            "Content-Disposition": f'attachment; filename="{filename}"',
            "Cache-Control": "no-store",
        },
    )


@router.get("/alerts.csv")
def download_alerts_csv(db: Session = Depends(get_db)):
    records = db.query(Alert).order_by(Alert.created_at.desc()).all()
    return _download_response(
        export_alerts(records),
        "text/csv; charset=utf-8",
        _filename("fedsentry-alerts", "csv"),
    )


@router.get("/incidents.csv")
def download_incidents_csv(db: Session = Depends(get_db)):
    records = db.query(Incident).order_by(Incident.created_at.desc()).all()
    return _download_response(
        export_incidents(records),
        "text/csv; charset=utf-8",
        _filename("fedsentry-incidents", "csv"),
    )


@router.get("/predictions.csv")
def download_predictions_csv(db: Session = Depends(get_db)):
    records = db.query(Prediction).order_by(Prediction.created_at.desc()).all()
    return _download_response(
        export_predictions(records),
        "text/csv; charset=utf-8",
        _filename("fedsentry-predictions", "csv"),
    )


@router.get("/security-summary.pdf")
def download_security_summary_pdf(db: Session = Depends(get_db)):
    total_predictions = db.query(func.count(Prediction.id)).scalar() or 0
    benign_predictions = (
        db.query(func.count(Prediction.id))
        .filter(func.upper(Prediction.predicted_class) == "BENIGN")
        .scalar()
        or 0
    )
    malicious_predictions = max(0, total_predictions - benign_predictions)
    average_confidence = db.query(func.avg(Prediction.confidence)).scalar() or 0.0
    total_alerts = db.query(func.count(Alert.id)).scalar() or 0
    total_incidents = db.query(func.count(Incident.id)).scalar() or 0
    open_incidents = (
        db.query(func.count(Incident.id))
        .filter(func.upper(Incident.status).notin_(["RESOLVED", "CLOSED"]))
        .scalar()
        or 0
    )

    summary = {
        "total_predictions": total_predictions,
        "benign_predictions": benign_predictions,
        "malicious_predictions": malicious_predictions,
        "average_confidence": float(average_confidence),
        "total_alerts": total_alerts,
        "total_incidents": total_incidents,
        "open_incidents": open_incidents,
    }

    recent_alerts = (
        db.query(Alert)
        .order_by(Alert.created_at.desc())
        .limit(12)
        .all()
    )
    recent_incidents = (
        db.query(Incident)
        .order_by(Incident.created_at.desc())
        .limit(12)
        .all()
    )

    content = build_security_summary_pdf(summary, recent_alerts, recent_incidents)
    return _download_response(
        content,
        "application/pdf",
        _filename("fedsentry-security-summary", "pdf"),
    )


@router.get("/incidents/{incident_id}.pdf")
def download_incident_pdf(
    incident_id: UUID,
    db: Session = Depends(get_db),
):
    incident = (
        db.query(Incident)
        .filter(Incident.id == str(incident_id))
        .first()
    )
    if incident is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Incident not found.",
        )

    content = build_incident_pdf(incident)
    return _download_response(
        content,
        "application/pdf",
        f"fedsentry-incident-{incident.id}.pdf",
    )
