"""
Incident Service.

Enterprise business logic for incident management.
"""

from datetime import datetime, timezone

from sqlalchemy import desc
from sqlalchemy.orm import Session

from models.incident import Incident


class IncidentService:

    @staticmethod
    def create(db: Session, **kwargs) -> Incident:

        incident = Incident(**kwargs)

        db.add(incident)
        db.commit()
        db.refresh(incident)

        return incident

    @staticmethod
    def get_all(
        db: Session,
        skip: int = 0,
        limit: int = 100,
    ):

        return (
            db.query(Incident)
            .order_by(desc(Incident.created_at))
            .offset(skip)
            .limit(limit)
            .all()
        )

    @staticmethod
    def get_by_id(
        db: Session,
        incident_id,
    ):

        return (
            db.query(Incident)
            .filter(Incident.id == incident_id)
            .first()
        )

    @staticmethod
    def update(
        db: Session,
        incident_id,
        data: dict,
    ):

        incident = IncidentService.get_by_id(
            db,
            incident_id,
        )

        if incident is None:
            return None

        for key, value in data.items():

            if value is not None:
                setattr(incident, key, value)

        incident.updated_at = datetime.now(timezone.utc)

        db.commit()
        db.refresh(incident)

        return incident

    @staticmethod
    def close(
        db: Session,
        incident_id,
        resolution: str,
    ):

        incident = IncidentService.get_by_id(
            db,
            incident_id,
        )

        if incident is None:
            return None

        incident.status = "Closed"
        incident.resolution = resolution
        incident.closed_at = datetime.now(timezone.utc)

        db.commit()
        db.refresh(incident)

        return incident

    @staticmethod
    def delete(
        db: Session,
        incident_id,
    ):

        incident = IncidentService.get_by_id(
            db,
            incident_id,
        )

        if incident is None:
            return False

        db.delete(incident)
        db.commit()

        return True

    @staticmethod
    def statistics(
        db: Session,
    ):

        total = db.query(Incident).count()

        open_incidents = (
            db.query(Incident)
            .filter(Incident.status == "Open")
            .count()
        )

        closed_incidents = (
            db.query(Incident)
            .filter(Incident.status == "Closed")
            .count()
        )

        return {
            "total": total,
            "open": open_incidents,
            "closed": closed_incidents,
        }