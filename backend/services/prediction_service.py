"""
Prediction Service.

Enterprise business logic for intrusion prediction.

Pipeline:
    Model Inference
        ↓
    Prediction Persistence
        ↓
    Alert Creation
        ↓
    WebSocket Event Publishing
        ↓
    Live SOC Dashboard
"""

from time import perf_counter

from sqlalchemy.orm import Session

from models.alert import Alert
from models.prediction import Prediction

from websocket.events import (
    publish_prediction_from_thread,
    publish_alert_from_thread,
)


# =========================================================
# ATTACK SEVERITY
# =========================================================

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


# =========================================================
# ATTACK RISK
# =========================================================

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

    # =====================================================
    # SEVERITY
    # =====================================================

    @staticmethod
    def calculate_severity(
        attack_type: str,
        confidence: float,
    ) -> str:
        """
        Calculate severity for a predicted attack.

        Severity is primarily determined by the attack class.
        Confidence is retained for future dynamic risk logic.
        """

        return ATTACK_SEVERITY.get(
            attack_type.strip(),
            "Low",
        )

    # =====================================================
    # RISK SCORE
    # =====================================================

    @staticmethod
    def calculate_risk_score(
        attack_type: str,
        confidence: float,
    ) -> int:
        """
        Calculate normalized risk score from 0-100.
        """

        return ATTACK_RISK.get(
            attack_type.strip(),
            min(
                100,
                int(confidence * 100),
            ),
        )

    # =====================================================
    # CREATE ALERT
    # =====================================================

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
        """
        Create and stage an intrusion alert.
        """

        severity = (
            PredictionService.calculate_severity(
                attack_type,
                confidence,
            )
        )

        risk_score = (
            PredictionService.calculate_risk_score(
                attack_type,
                confidence,
            )
        )

        alert = Alert(
            source_ip=source_ip,
            destination_ip=destination_ip,
            source_port=source_port,
            destination_port=destination_port,
            protocol=protocol,
            attack_type=attack_type,
            confidence=confidence,
            severity=severity,
            risk_score=risk_score,
            status="Open",
        )

        db.add(alert)

        # Flush so the alert ID is available before commit.
        db.flush()

        return alert

    # =====================================================
    # SAVE PREDICTION
    # =====================================================

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
        """
        Save model prediction to the database.
        """

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

        # Flush so the prediction ID becomes available.
        db.flush()

        return prediction

    # =====================================================
    # REAL-TIME WEBSOCKET EVENTS
    # =====================================================

    @staticmethod
    def _publish_websocket_events(
        prediction_id: str,
        predicted_class: str,
        confidence: float,
        latency_ms: float,
        source_ip: str,
        destination_ip: str,
        source_port: int,
        destination_port: int,
        protocol: str,
        alert: Alert | None,
    ) -> None:
        """
        Publish prediction and alert events to connected
        SOC dashboard clients.

        IMPORTANT:

        The detection engine runs in a background thread.
        Therefore this method uses the thread-safe WebSocket
        publishers instead of directly awaiting async methods.

        WebSocket failures must never break the IDS prediction
        or database pipeline.
        """

        try:

            # -------------------------------------------------
            # Prediction Event
            # -------------------------------------------------

            publish_prediction_from_thread(
                prediction_id=prediction_id,

                prediction=predicted_class,

                confidence=confidence,

                latency_ms=latency_ms,

                source_ip=source_ip,

                destination_ip=destination_ip,

                source_port=source_port,

                destination_port=destination_port,

                protocol=protocol,

                alert_created=(
                    alert is not None
                ),

                alert_id=(
                    str(alert.id)
                    if alert
                    else None
                ),

                severity=(
                    alert.severity
                    if alert
                    else "None"
                ),

                risk_score=(
                    alert.risk_score
                    if alert
                    else 0
                ),
            )

            # -------------------------------------------------
            # Alert Event
            # -------------------------------------------------

            if alert:

                publish_alert_from_thread(
                    alert_id=str(
                        alert.id
                    ),

                    attack_type=predicted_class,

                    confidence=confidence,

                    severity=alert.severity,

                    risk_score=alert.risk_score,

                    source_ip=source_ip,

                    destination_ip=destination_ip,

                    source_port=source_port,

                    destination_port=destination_port,

                    protocol=protocol,
                )

        except Exception as websocket_error:

            # WebSocket problems must NOT interrupt
            # prediction processing.

            print(
                "[SentinelAI] WebSocket publish warning: "
                f"{websocket_error}"
            )

    # =====================================================
    # MAIN PREDICTION PIPELINE
    # =====================================================

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
        model_version="v3.0",
    ):
        """
        Execute complete enterprise prediction pipeline.

        Steps:

        1. Run federated model inference
        2. Measure inference latency
        3. Determine predicted class
        4. Create alert if attack detected
        5. Save prediction
        6. Commit database transaction
        7. Publish real-time WebSocket events
        8. Return API response
        """

        try:

            # =================================================
            # 1. MODEL INFERENCE
            # =================================================

            start = perf_counter()

            result = predictor.predict(
                features
            )

            latency = (
                perf_counter() - start
            ) * 1000

            # =================================================
            # 2. EXTRACT MODEL RESULT
            # =================================================

            predicted_class = (
                result["prediction"]
            )

            confidence = float(
                result["confidence"]
            )

            # =================================================
            # 3. CREATE ALERT FOR ATTACK
            # =================================================

            alert = None

            if (
                predicted_class.upper()
                != "BENIGN"
            ):

                alert = (
                    PredictionService.create_alert(
                        db=db,

                        source_ip=source_ip,

                        destination_ip=destination_ip,

                        source_port=source_port,

                        destination_port=destination_port,

                        protocol=protocol,

                        attack_type=predicted_class,

                        confidence=confidence,
                    )
                )

            # =================================================
            # 4. SAVE PREDICTION
            # =================================================

            prediction = (
                PredictionService.save_prediction(
                    db=db,

                    model_version=model_version,

                    source_ip=source_ip,

                    destination_ip=destination_ip,

                    predicted_class=predicted_class,

                    confidence=confidence,

                    latency_ms=latency,

                    alert_id=(
                        alert.id
                        if alert
                        else None
                    ),
                )
            )

            # =================================================
            # 5. DATABASE COMMIT
            # =================================================

            db.commit()

            # Refresh database objects so all generated fields
            # are available.

            db.refresh(
                prediction
            )

            if alert:

                db.refresh(
                    alert
                )

            # =================================================
            # 6. REAL-TIME WEBSOCKET
            # =================================================

            PredictionService._publish_websocket_events(
                prediction_id=str(
                    prediction.id
                ),

                predicted_class=predicted_class,

                confidence=round(
                    confidence,
                    4,
                ),

                latency_ms=round(
                    latency,
                    2,
                ),

                source_ip=source_ip,

                destination_ip=destination_ip,

                source_port=source_port,

                destination_port=destination_port,

                protocol=protocol,

                alert=alert,
            )

            # =================================================
            # 7. API RESPONSE
            # =================================================

            return {
                "prediction_id": str(
                    prediction.id
                ),

                "prediction": predicted_class,

                "confidence": round(
                    confidence,
                    4,
                ),

                "latency_ms": round(
                    latency,
                    2,
                ),

                "alert_created": (
                    alert is not None
                ),

                "alert_id": (
                    str(alert.id)
                    if alert
                    else None
                ),
            }

        # =====================================================
        # DATABASE ROLLBACK
        # =====================================================

        except Exception:

            db.rollback()

            raise