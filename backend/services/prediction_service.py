"""
Prediction Service.

Enterprise business logic for intrusion prediction.
"""

from time import perf_counter

from sqlalchemy.orm import Session

from models.alert import Alert
from models.prediction import Prediction


ATTACK_SEVERITY = {
    "BENIGN": "None",
    "PortScan": "Medium",
    "Bot": "High",
    "DDoS": "Critical",
    "DoS Hulk": "Critical",
    "DoS GoldenEye": "High",
    "DoS Slowhttptest": "High",
    "DoS slowloris": "High",
    "FTP-Patator": "High",
    "SSH-Patator": "High",
    "Heartbleed": "Critical",
    "Infiltration": "Critical",
    "Web Attack_Brute Force": "High",
    "Web Attack_Sql Injection": "Critical",
    "Web Attack_XSS": "High",
}


ATTACK_RISK = {
    "BENIGN": 0,
    "PortScan": 55,
    "Bot": 70,
    "DDoS": 100,
    "DoS Hulk": 100,
    "DoS GoldenEye": 90,
    "DoS Slowhttptest": 90,
    "DoS slowloris": 90,
    "FTP-Patator": 80,
    "SSH-Patator": 80,
    "Heartbleed": 100,
    "Infiltration": 95,
    "Web Attack_Brute Force": 90,
    "Web Attack_Sql Injection": 100,
    "Web Attack_XSS": 85,
}


class PredictionService:

    @staticmethod
    def calculate_severity(
        attack_type: str,
        confidence: float,
    ) -> str:

        return ATTACK_SEVERITY.get(
            attack_type,
            "Low",
        )

    @staticmethod
    def calculate_risk_score(
        attack_type: str,
        confidence: float,
    ) -> int:

        return ATTACK_RISK.get(
            attack_type,
            min(100, int(confidence * 100)),
        )

    @staticmethod
    def create_alert(

        db: Session,

        source_ip: str,

        destination_ip: str,

        source_port: int,

        destination_port: int,

        protocol: str,

        attack_type: str,

        confidence: float,

    ) -> Alert:

        alert = Alert(

            source_ip=source_ip,

            destination_ip=destination_ip,

            source_port=source_port,

            destination_port=destination_port,

            protocol=protocol,

            attack_type=attack_type,

            confidence=confidence,

            severity=PredictionService.calculate_severity(
                attack_type,
                confidence,
            ),

            risk_score=PredictionService.calculate_risk_score(
                attack_type,
                confidence,
            ),

            status="Open",

        )

        db.add(alert)

        db.flush()

        return alert

    @staticmethod
    def save_prediction(

        db: Session,

        model_version: str,

        source_ip: str,

        destination_ip: str,

        predicted_class: str,

        confidence: float,

        latency_ms: float,

        alert_id=None,

    ) -> Prediction:

        prediction = Prediction(

            model_version=model_version,

            source_ip=source_ip,

            destination_ip=destination_ip,

            predicted_class=predicted_class,

            confidence=confidence,

            latency_ms=latency_ms,

            alert_id=alert_id,

        )

        db.add(prediction)

        db.flush()

        return prediction

    @staticmethod
    def predict(

        db: Session,

        predictor,

        features,

        source_ip: str,

        destination_ip: str,

        source_port: int,

        destination_port: int,

        protocol: str,

        model_version="v2.0",

    ):

        try:

            start = perf_counter()

            result = predictor.predict(features)

            latency = (perf_counter() - start) * 1000

            predicted_class = result["prediction"]

            confidence = result["confidence"]

            alert = None

            if predicted_class != "BENIGN":

                alert = PredictionService.create_alert(

                    db=db,

                    source_ip=source_ip,

                    destination_ip=destination_ip,

                    source_port=source_port,

                    destination_port=destination_port,

                    protocol=protocol,

                    attack_type=predicted_class,

                    confidence=confidence,

                )

            prediction = PredictionService.save_prediction(

                db=db,

                model_version=model_version,

                source_ip=source_ip,

                destination_ip=destination_ip,

                predicted_class=predicted_class,

                confidence=confidence,

                latency_ms=latency,

                alert_id=alert.id if alert else None,

            )

            db.commit()

            db.refresh(prediction)

            if alert:
                db.refresh(alert)

            return {

                "prediction_id": str(prediction.id),

                "prediction": predicted_class,

                "confidence": confidence,

                "latency_ms": round(latency, 2),

                "alert_created": alert is not None,

                "alert_id": str(alert.id) if alert else None,

            }

        except Exception:

            db.rollback()

            raise