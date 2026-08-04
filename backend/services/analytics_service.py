"""
Analytics Service.
"""

from sqlalchemy import func
from sqlalchemy.orm import Session

from models.alert import Alert
from models.prediction import Prediction


class AnalyticsService:

    @staticmethod
    def dashboard(db: Session):

        total_predictions = db.query(Prediction).count()

        total_alerts = db.query(Alert).count()

        benign = (
            db.query(Prediction)
            .filter(Prediction.predicted_class == "Benign")
            .count()
        )

        malicious = total_predictions - benign

        average_confidence = (
            db.query(func.avg(Prediction.confidence))
            .scalar()
            or 0
        )

        average_latency = (
            db.query(func.avg(Prediction.latency_ms))
            .scalar()
            or 0
        )

        return {

            "total_predictions": total_predictions,

            "total_alerts": total_alerts,

            "benign_predictions": benign,

            "malicious_predictions": malicious,

            "average_confidence": round(float(average_confidence), 4),

            "average_latency_ms": round(float(average_latency), 2),

        }

    @staticmethod
    def attack_distribution(db: Session):

        result = (

            db.query(

                Prediction.predicted_class,

                func.count(Prediction.id)

            )

            .group_by(Prediction.predicted_class)

            .all()

        )

        return {

            attack: count

            for attack, count in result

        }

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

        return {

            severity: count

            for severity, count in result

        }

    @staticmethod
    def top_source_ips(db: Session):

        result = (

            db.query(

                Alert.source_ip,

                func.count(Alert.id)

            )

            .group_by(Alert.source_ip)

            .order_by(func.count(Alert.id).desc())

            .limit(10)

            .all()

        )

        return [

            {

                "source_ip": ip,

                "count": count

            }

            for ip, count in result

        ]