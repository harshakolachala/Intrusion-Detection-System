"""
Prediction History Service.
"""

from sqlalchemy import desc
from sqlalchemy.orm import Session

from models.prediction import Prediction


class PredictionHistoryService:

    @staticmethod
    def get_all(
        db: Session,
        skip: int = 0,
        limit: int = 100,
    ):

        return (
            db.query(Prediction)
            .order_by(desc(Prediction.created_at))
            .offset(skip)
            .limit(limit)
            .all()
        )

    @staticmethod
    def get_by_id(
        db: Session,
        prediction_id,
    ):

        return (
            db.query(Prediction)
            .filter(Prediction.id == prediction_id)
            .first()
        )

    @staticmethod
    def get_by_attack(
        db: Session,
        attack_type: str,
    ):

        return (
            db.query(Prediction)
            .filter(Prediction.predicted_class == attack_type)
            .order_by(desc(Prediction.created_at))
            .all()
        )

    @staticmethod
    def get_by_source_ip(
        db: Session,
        source_ip: str,
    ):

        return (
            db.query(Prediction)
            .filter(Prediction.source_ip == source_ip)
            .order_by(desc(Prediction.created_at))
            .all()
        )

    @staticmethod
    def statistics(
        db: Session,
    ):

        total = db.query(Prediction).count()

        malicious = (
            db.query(Prediction)
            .filter(Prediction.predicted_class != "Benign")
            .count()
        )

        benign = (
            db.query(Prediction)
            .filter(Prediction.predicted_class == "Benign")
            .count()
        )

        return {
            "total": total,
            "malicious": malicious,
            "benign": benign,
        }