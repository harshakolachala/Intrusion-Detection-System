"""FedSentry real-time detection engine.

Pipeline:
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
        self._state_lock = threading.RLock()

    def start(self, interface=None):
        with self._state_lock:
            if self.running:
                logger.warning("Detection engine already running.")
                return self.statistics()

            if interface:
                capture_engine.set_interface(interface)
                self.interface = interface

            # Never process packets left behind by a previous stopped session.
            packet_queue.clear()

            self.flow_generator = FlowGenerator(
                flow_timeout=10.0,
                max_packets_per_flow=500,
                on_flow_complete=self._on_flow_complete,
            )

            # Mark the engine running before capture begins so callbacks are valid.
            self.running = True

            try:
                capture_engine.start_capture()
            except Exception:
                self.running = False
                capture_engine.stop_capture()
                raise

            self.worker_thread = threading.Thread(
                target=self._processing_loop,
                daemon=True,
                name="fedsentry-detection-worker",
            )
            self.worker_thread.start()

        logger.info("=" * 60)
        logger.info("FedSentry Detection Engine Started")
        logger.info("Interface : %s", interface or self.interface or "default")
        logger.info("=" * 60)
        return self.statistics()

    def stop(self):
        """Stop capture and analysis, then verify no worker can continue processing."""
        logger.info("Stopping FedSentry Detection Engine...")

        with self._state_lock:
            self.running = False
            worker = self.worker_thread

        # This now stops the actual Scapy capture thread, not just a boolean flag.
        capture_engine.stop_capture()

        # Wait for any flow callback that was already executing to finish before
        # reporting the engine as stopped. The UI remains in its busy state while
        # this happens, so it cannot claim the engine is stopped prematurely.
        if (
            worker is not None
            and worker.is_alive()
            and worker is not threading.current_thread()
        ):
            worker.join()

        discarded_packets = packet_queue.size()
        packet_queue.clear()

        discarded_flows = 0
        flow_generator = self.flow_generator
        if flow_generator is not None:
            with flow_generator.lock:
                discarded_flows = len(flow_generator.flows)
                flow_generator.flows.clear()

        with self._state_lock:
            self.worker_thread = None

        logger.info(
            "Detection engine stop cleanup | queued_packets=%s active_flows=%s",
            discarded_packets,
            discarded_flows,
        )
        logger.info("=" * 60)
        logger.info("FedSentry Detection Engine Stopped")
        logger.info("=" * 60)
        return self.statistics()

    def _processing_loop(self):
        last_flush = time.time()

        while self.running:
            packet = packet_queue.dequeue()

            # stop() may be called immediately after dequeue(). Do not allow that
            # packet to enter a flow after the stop signal.
            if not self.running:
                break

            if packet:
                logger.debug("Packet dequeued | Queue=%s", packet_queue.size())
                if packet.get("src_ip") and packet.get("dst_ip"):
                    flow_generator = self.flow_generator
                    if flow_generator is not None and self.running:
                        flow_generator.add_packet(packet)
            else:
                time.sleep(0.001)

            if not self.running:
                break

            now = time.time()
            if now - last_flush >= 5:
                flow_generator = self.flow_generator
                if flow_generator is not None and self.running:
                    logger.info("Checking expired flows...")
                    completed = flow_generator.flush_expired_flows()
                    logger.info(
                        "Expired Flow Check Complete | Completed=%s",
                        completed,
                    )
                last_flush = now

    def _on_flow_complete(self, flow):
        # A completed flow callback can race with the Stop button. If stop has
        # been requested, the flow must not create a new prediction or alert.
        if not self.running:
            logger.info("Skipping completed flow because detection engine is stopping.")
            return

        logger.info("=" * 60)
        logger.info("FLOW COMPLETED")
        logger.info(
            "%s:%s -> %s:%s",
            flow.src_ip,
            flow.src_port,
            flow.dst_ip,
            flow.dst_port,
        )

        if not flow.src_ip or not flow.dst_ip:
            logger.warning("Flow missing IP address. Skipping.")
            return

        try:
            features = FeatureExtractor.extract(flow)
            logger.info("Feature Extraction Successful (%s features)", len(features))
            features = Preprocessor.handle_missing_values(features)

            if not self.running:
                logger.info("Prediction cancelled because detection engine is stopping.")
                return

            if self.predictor is None:
                logger.info("Loading Federated Global Model...")
                self.predictor = Predictor()

            if not self.running:
                logger.info("Prediction cancelled because detection engine is stopping.")
                return

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

            logger.info("Prediction : %s", result["prediction"])
            logger.info("Confidence : %.4f", result["confidence"])
            logger.info("Latency : %s ms", result["latency_ms"])

            if result["alert_created"]:
                logger.warning("=" * 60)
                logger.warning("INTRUSION DETECTED")
                logger.warning("Attack Type : %s", result["prediction"])
                logger.warning("Confidence  : %.4f", result["confidence"])
                logger.warning("Severity    : Check Dashboard")
                logger.warning("Source      : %s:%s", flow.src_ip, flow.src_port)
                logger.warning("Destination : %s:%s", flow.dst_ip, flow.dst_port)
                logger.warning("Alert ID    : %s", result["alert_id"])
                logger.warning("=" * 60)
            else:
                logger.info("Traffic classified as BENIGN.")

            logger.info("=" * 60)

        except Exception as exc:
            logger.exception("Engine Error : %s", exc)

    def statistics(self):
        capture_stats = capture_engine.statistics()
        flow_stats = (
            self.flow_generator.statistics()
            if self.flow_generator
            else {}
        )
        worker_alive = bool(self.worker_thread and self.worker_thread.is_alive())

        # Engine is only truly running when capture and the processing worker are
        # both alive. This prevents the frontend from showing a false green state.
        effective_running = bool(
            self.running
            and capture_stats.get("running", False)
            and worker_alive
        )

        return {
            "running": effective_running,
            "capture": capture_stats,
            "flows": flow_stats,
            "queue": {"queue_size": packet_queue.size()},
            "worker_alive": worker_alive,
        }


engine = DetectionEngine()
