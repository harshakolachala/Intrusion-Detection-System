"""
Detection Engine for SentinelAI.

Main entry point for real-time intrusion detection.
Runs the complete pipeline:
Capture -> Queue -> Flow Generator -> Feature Extractor ->
Preprocessor -> Federated Prediction -> Alert
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
    """Runs the continuous real-time detection pipeline."""

    def __init__(self, interface=None):

        self.running = False
        self.interface = interface

        self.predictor = None
        self.flow_generator = None
        self.worker_thread = None

    # ---------------------------------------------------------
    # Start Engine
    # ---------------------------------------------------------

    def start(self, interface=None):

        if self.running:
            logger.warning("Detection engine already running.")
            return

        if interface:
            capture_engine.set_interface(interface)

        self.flow_generator = FlowGenerator(
            flow_timeout=10.0,
            max_packets_per_flow=500,
            on_flow_complete=self._on_flow_complete,
        )

        capture_engine.start_capture()

        self.running = True

        logger.info("=" * 60)
        logger.info("SentinelAI Detection Engine Started")
        logger.info(f"Interface : {interface or 'default'}")
        logger.info("=" * 60)

        self.worker_thread = threading.Thread(
            target=self._processing_loop,
            daemon=True,
        )

        self.worker_thread.start()

    # ---------------------------------------------------------
    # Stop Engine
    # ---------------------------------------------------------

    def stop(self):

        logger.info("Stopping Detection Engine...")

        self.running = False

        capture_engine.stop_capture()

        if self.flow_generator:

            completed = self.flow_generator.flush_expired_flows()

            logger.info(
                f"Final Flush Completed Flows : {completed}"
            )

        logger.info("=" * 60)
        logger.info("Detection Engine Stopped")
        logger.info("=" * 60)

    # ---------------------------------------------------------
    # Packet Processing Loop
    # ---------------------------------------------------------

    def _processing_loop(self):

        last_flush = time.time()

        while self.running:

            packet = packet_queue.dequeue()

            if packet:

                logger.debug(
                    f"Packet dequeued | Queue={packet_queue.size()}"
                )

                if packet.get("src_ip") and packet.get("dst_ip"):
                    self.flow_generator.add_packet(packet)

            else:
                time.sleep(0.001)

            now = time.time()

            if now - last_flush >= 5:

                logger.info("Checking expired flows...")

                completed = (
                    self.flow_generator.flush_expired_flows()
                )

                logger.info(
                    f"Expired Flow Check Complete | "
                    f"Completed={completed}"
                )

                last_flush = now

    # ---------------------------------------------------------
    # Flow Completed
    # ---------------------------------------------------------

    def _on_flow_complete(self, flow):

        logger.info("=" * 60)
        logger.info("FLOW COMPLETED")

        logger.info(
            f"{flow.src_ip}:{flow.src_port} -> "
            f"{flow.dst_ip}:{flow.dst_port}"
        )

        if not flow.src_ip or not flow.dst_ip:

            logger.warning(
                "Flow missing IP address. Skipping."
            )

            return

        try:

            features = FeatureExtractor.extract(flow)

            logger.info(
                f"Feature Extraction Successful "
                f"({len(features)} features)"
            )

            features = (
                Preprocessor.handle_missing_values(
                    features
                )
            )

            if self.predictor is None:

                logger.info(
                    "Loading Federated Global Model..."
                )

                self.predictor = Predictor()

            db = next(get_db())

            try:

                result = PredictionService.predict(

                    db=db,

                    predictor=self.predictor,

                    features=features,

                    source_ip=flow.src_ip,

                    destination_ip=flow.dst_ip,

                    source_port=flow.src_port,

                    destination_port=flow.dst_port,

                    protocol=str(flow.protocol),

                )

            finally:

                db.close()

            logger.info(
                f"Prediction : {result['prediction']}"
            )

            logger.info(
                f"Confidence : {result['confidence']:.4f}"
            )

            logger.info(
                f"Latency : {result['latency_ms']} ms"
            )

            if result["alert_created"]:

                logger.warning("=" * 60)
                logger.warning("INTRUSION DETECTED")
                logger.warning(f"Attack Type : {result['prediction']}")
                logger.warning(f"Confidence  : {result['confidence']:.4f}")
                logger.warning(f"Severity    : Check Dashboard")
                logger.warning(f"Source      : {flow.src_ip}:{flow.src_port}")
                logger.warning(f"Destination : {flow.dst_ip}:{flow.dst_port}")
                logger.warning(f"Alert ID    : {result['alert_id']}")
                logger.warning("=" * 60)



            else:

                logger.info(
                    "Traffic classified as BENIGN."
                )

            logger.info("=" * 60)

        except Exception as e:

            logger.exception(f"Engine Error : {e}")

    # ---------------------------------------------------------
    # Statistics
    # ---------------------------------------------------------

    def statistics(self):

        capture_stats = capture_engine.statistics()

        flow_stats = (
            self.flow_generator.statistics()
            if self.flow_generator
            else {}
        )

        return {

            "running": self.running,

            "capture": capture_stats,

            "flows": flow_stats,

            "queue": {

                "queue_size": packet_queue.size()

            },

        }


engine = DetectionEngine()