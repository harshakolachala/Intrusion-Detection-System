"""
Alert Service.

Enterprise business logic for alert management.
"""

from sqlalchemy import desc
from sqlalchemy.orm import Session

from models.alert import Alert


class AlertService:

    @staticmethod
    def create(
        db: Session,
        **kwargs,
    ) -> Alert:

        alert = Alert(**kwargs)

        db.add(alert)

        db.commit()

        db.refresh(alert)

        return alert

    @staticmethod
    def get_by_id(
        db: Session,
        alert_id,
    ):

        return (
            db.query(Alert)
            .filter(Alert.id == alert_id)
            .first()
        )

    @staticmethod
    def get_all(
        db: Session,
        skip: int = 0,
        limit: int = 100,
    ):

        return (
            db.query(Alert)
            .order_by(desc(Alert.created_at))
            .offset(skip)
            .limit(limit)
            .all()
        )

    @staticmethod
    def update_status(
        db: Session,
        alert_id,
        status: str,
    ):

        alert = AlertService.get_by_id(db, alert_id)

        if alert is None:
            return None

        alert.status = status

        db.commit()

        db.refresh(alert)

        return alert

    @staticmethod
    def delete(
        db: Session,
        alert_id,
    ):

        alert = AlertService.get_by_id(db, alert_id)

        if alert is None:
            return False

        db.delete(alert)

        db.commit()

        return True

    @staticmethod
    def filter_by_severity(
        db: Session,
        severity: str,
    ):

        return (
            db.query(Alert)
            .filter(Alert.severity == severity)
            .order_by(desc(Alert.created_at))
            .all()
        )

    @staticmethod
    def filter_by_status(
        db: Session,
        status: str,
    ):

        return (
            db.query(Alert)
            .filter(Alert.status == status)
            .order_by(desc(Alert.created_at))
            .all()
        )

    @staticmethod
    def filter_by_attack(
        db: Session,
        attack_type: str,
    ):

        return (
            db.query(Alert)
            .filter(Alert.attack_type == attack_type)
            .order_by(desc(Alert.created_at))
            .all()
        )

    @staticmethod
    def statistics(
        db: Session,
    ):

        total = db.query(Alert).count()

        open_alerts = (
            db.query(Alert)
            .filter(Alert.status == "Open")
            .count()
        )

        closed_alerts = (
            db.query(Alert)
            .filter(Alert.status == "Closed")
            .count()
        )

        critical = (
            db.query(Alert)
            .filter(Alert.severity == "Critical")
            .count()
        )

        high = (
            db.query(Alert)
            .filter(Alert.severity == "High")
            .count()
        )

        medium = (
            db.query(Alert)
            .filter(Alert.severity == "Medium")
            .count()
        )

        low = (
            db.query(Alert)
            .filter(Alert.severity == "Low")
            .count()
        )

        return {

            "total": total,

            "open": open_alerts,

            "closed": closed_alerts,

            "critical": critical,

            "high": high,

            "medium": medium,

            "low": low,

        }