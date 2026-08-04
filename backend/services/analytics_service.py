"""
Analytics Service.

Provides dashboard analytics and statistics.
"""

from sqlalchemy import func
from sqlalchemy.orm import Session

from models.alert import Alert
from models.prediction import Prediction


class AnalyticsService:

    @staticmethod
    def dashboard_summary(db: Session):

        total_predictions = db.query(Prediction).count()

        total_alerts = db.query(Alert).count()

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

        malicious_predictions = (
            db.query(Prediction)
            .filter(Prediction.predicted_class != "Benign")
            .count()
        )

        benign_predictions = (
            db.query(Prediction)
            .filter(Prediction.predicted_class == "Benign")
            .count()
        )

        average_confidence = (
            db.query(func.avg(Prediction.confidence))
            .scalar()
            or 0
        )

        average_latency_ms = (
            db.query(func.avg(Prediction.latency_ms))
            .scalar()
            or 0
        )

        return {
            "total_predictions": total_predictions,
            "total_alerts": total_alerts,
            "open_alerts": open_alerts,
            "closed_alerts": closed_alerts,
            "malicious_predictions": malicious_predictions,
            "benign_predictions": benign_predictions,
            "average_confidence": round(average_confidence, 2),
            "average_latency_ms": round(average_latency_ms, 2),
        }

    @staticmethod
    def attack_distribution(db: Session):

        result = (
            db.query(
                Alert.attack_type,
                func.count(Alert.id)
            )
            .group_by(Alert.attack_type)
            .all()
        )

        return [
            {
                "attack_type": attack_type,
                "count": count,
            }
            for attack_type, count in result
        ]

    @staticmethod
    def severity_distribution(db: Session):

        result = (
            db.query(
                Alert.severity,
                func.count(Alert.id)
            )
            .group_by(Alert.severity)
            .all()
        )

        return [
            {
                "severity": severity,
                "count": count,
            }
            for severity, count in result
        ]

    @staticmethod
    def confidence_statistics(db: Session):

        minimum = (
            db.query(func.min(Prediction.confidence))
            .scalar()
            or 0
        )

        maximum = (
            db.query(func.max(Prediction.confidence))
            .scalar()
            or 0
        )

        average = (
            db.query(func.avg(Prediction.confidence))
            .scalar()
            or 0
        )

        return {
            "minimum": round(minimum, 2),
            "maximum": round(maximum, 2),
            "average": round(average, 2),
        }

    @staticmethod
    def get_dashboard(db: Session):

        return {
            "summary": AnalyticsService.dashboard_summary(db),
            "attack_distribution": AnalyticsService.attack_distribution(db),
            "severity_distribution": AnalyticsService.severity_distribution(db),
            "confidence": AnalyticsService.confidence_statistics(db),
            "timeline": [],
        }