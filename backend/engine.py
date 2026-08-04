"""
Detection Engine for SentinelAI.

Main entry point for real-time intrusion detection.
Runs the complete pipeline:
  Capture -> Queue -> Flow Generator -> Feature Extractor -> Preprocessor -> Predict -> Alert
"""

import threading
import time

from capture.packet_capture import capture_engine
from capture.queue_manager import packet_queue
from capture.logger import logger
from flow.flow_generator import FlowGenerator
from flow.feature_extractor import FeatureExtractor
from flow.preprocessor import Preprocessor
from federated.predict import Predictor
from services.prediction_service import PredictionService
from database.session import get_db


class DetectionEngine:
    """Runs the continuous detection pipeline."""

    def __init__(self, interface=None ):
        self.running = False
        self.interface = interface
        self.predictor = None
        self.flow_generator = None
        self.worker_thread = None

    def start(self, interface=None):
        if interface:
            capture_engine.set_interface(interface)

        self.flow_generator = FlowGenerator(
            flow_timeout=10.0,
            max_packets_per_flow=500,
            on_flow_complete=self._on_flow_complete,
        )

        capture_engine.start_capture()
        self.running = True

        logger.info("=== Detection Engine Started ===")
        logger.info(f"Interface: {interface or 'default'}")

        self.worker_thread = threading.Thread(
            target=self._processing_loop,
            daemon=True,
        )
        self.worker_thread.start()

        logger.info("Processing worker thread started.")

    def stop(self):
        self.running = False
        capture_engine.stop_capture()
        logger.info("=== Detection Engine Stopped ===")

    def _processing_loop(self):
        last_flush = time.time()

        while self.running:
            packet = packet_queue.dequeue()
            if packet:
                # Only process packets that have valid IP addresses
                if packet.get("src_ip") and packet.get("dst_ip"):
                    self.flow_generator.add_packet(packet)
            else:
                time.sleep(0.001)

            now = time.time()
            if now - last_flush >= 5.0:
                completed = self.flow_generator.flush_expired_flows()
                if completed:
                    logger.info(f"Flushed {completed} expired flows")
                last_flush = now

    def _on_flow_complete(self, flow):
        # Skip flows without valid IPs
        if not flow.src_ip or not flow.dst_ip:
            return

        logger.info(
            f"Processing completed flow: {flow.src_ip}:{flow.src_port} -> "
            f"{flow.dst_ip}:{flow.dst_port}"
        )

        try:
            features = FeatureExtractor.extract(flow)
            logger.info(f"Features extracted: {len(features)} features")

            features = Preprocessor.handle_missing_values(features)

            if self.predictor is None:
                self.predictor = Predictor()

            result = self.predictor.predict(features)

            prediction = result["prediction"]
            confidence = result["confidence"]

            logger.info(f"Prediction: {prediction} | Confidence: {confidence}")

            # Only create alert for Attack predictions
            if prediction.lower() == "attack":
                logger.warning(
                    f"ALERT: Attack detected from {flow.src_ip} -> {flow.dst_ip}"
                )

                try:
                    db = next(get_db())
                    try:
                        alert = PredictionService.create_alert(
                            db=db,
                            source_ip=flow.src_ip,
                            destination_ip=flow.dst_ip,
                            source_port=flow.src_port,
                            destination_port=flow.dst_port,
                            protocol=str(flow.protocol),
                            attack_type=prediction,
                            confidence=confidence,
                        )
                        logger.info(f"Alert created: {alert.id}")
                        db.commit()
                    finally:
                        db.close()
                except Exception as e:
                    logger.error(f"Error creating alert: {e}")

        except Exception as e:
            logger.error(f"Error processing flow: {e}")

    def statistics(self) -> dict:
        capture_stats = capture_engine.statistics()
        flow_stats = self.flow_generator.statistics() if self.flow_generator else {}
        queue_stats = {"queue_size": packet_queue.size()}

        return {
            "running": self.running,
            "capture": capture_stats,
            "flows": flow_stats,
            "queue": queue_stats,
        }


engine = DetectionEngine()
