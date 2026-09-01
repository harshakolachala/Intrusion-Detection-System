"""FedSentry distributed network sensor.

Captures packets locally, builds bidirectional flows, extracts the same 78
CICIDS-style features used by the backend model, and forwards only flow
metadata/features to the central FedSentry API. Raw packets are never uploaded.
"""

from __future__ import annotations

import argparse
import math
import os
import queue
import signal
import threading
import time

import httpx

from capture.logger import logger
from capture.packet_capture import capture_engine
from capture.queue_manager import packet_queue
from flow.feature_extractor import FeatureExtractor
from flow.flow_generator import FlowGenerator
from flow.preprocessor import Preprocessor


class RemoteSensor:
    def __init__(
        self,
        api_url: str,
        agent_id: str,
        agent_key: str,
        interface: str | None = None,
        timeout: float = 60.0,
        retries: int = 2,
        diagnostic: bool = False,
    ):
        self.api_url = api_url.rstrip("/")
        self.agent_id = agent_id
        self.agent_key = agent_key
        self.interface = interface
        self.timeout = timeout
        self.retries = max(0, retries)
        self.diagnostic = diagnostic
        self.running = False
        self.worker_thread: threading.Thread | None = None
        self.sender_thread: threading.Thread | None = None
        self.flow_generator: FlowGenerator | None = None
        self.delivery_queue: queue.Queue[dict] = queue.Queue(maxsize=1000)
        self.client = httpx.Client(
            timeout=httpx.Timeout(timeout, connect=min(10.0, timeout))
        )
        self.sent_flows = 0
        self.failed_flows = 0
        self.dropped_flows = 0

    @property
    def headers(self) -> dict[str, str]:
        return {"X-Agent-Key": self.agent_key}

    def verify_gateway(self) -> None:
        response = self.client.get(
            f"{self.api_url}/agents/health",
            headers=self.headers,
        )
        response.raise_for_status()
        payload = response.json()
        logger.info(
            "Remote sensor gateway ready | expected_features=%s",
            payload.get("expected_features"),
        )

    def start(self) -> None:
        if self.running:
            return

        self.verify_gateway()
        packet_queue.clear()

        self.flow_generator = FlowGenerator(
            flow_timeout=10.0,
            max_packets_per_flow=500,
            on_flow_complete=self._on_flow_complete,
        )

        if self.interface:
            capture_engine.set_interface(self.interface)

        self.running = True
        capture_engine.start_capture()

        self.worker_thread = threading.Thread(
            target=self._processing_loop,
            daemon=True,
            name="fedsentry-remote-sensor-capture",
        )
        self.sender_thread = threading.Thread(
            target=self._delivery_loop,
            daemon=True,
            name="fedsentry-remote-sensor-delivery",
        )
        self.worker_thread.start()
        self.sender_thread.start()

        logger.info("=" * 60)
        logger.info("FedSentry Remote Sensor Started")
        logger.info("Agent ID  : %s", self.agent_id)
        logger.info("Cloud API : %s", self.api_url)
        logger.info("Interface : %s", self.interface or "default")
        logger.info("HTTP timeout: %.0fs | retries=%s", self.timeout, self.retries)
        logger.info("Raw packet upload: disabled")
        logger.info("Diagnostic mode: %s", "enabled" if self.diagnostic else "disabled")
        logger.info("=" * 60)

    def stop(self) -> None:
        self.running = False
        capture_engine.stop_capture()

        if self.worker_thread and self.worker_thread.is_alive():
            if self.worker_thread is not threading.current_thread():
                self.worker_thread.join(timeout=5.0)

        if self.flow_generator is not None:
            try:
                self.flow_generator.flush_expired_flows()
            except Exception:
                logger.exception("Unable to flush final sensor flows")

        if self.sender_thread and self.sender_thread.is_alive():
            if self.sender_thread is not threading.current_thread():
                self.sender_thread.join(timeout=min(self.timeout, 10.0))

        packet_queue.clear()
        self.client.close()

        logger.info(
            "FedSentry Remote Sensor Stopped | sent=%s failed=%s dropped=%s pending=%s",
            self.sent_flows,
            self.failed_flows,
            self.dropped_flows,
            self.delivery_queue.qsize(),
        )

    def _processing_loop(self) -> None:
        last_flush = time.time()

        while self.running:
            packet = packet_queue.dequeue()
            if packet and self.flow_generator is not None:
                if packet.get("src_ip") and packet.get("dst_ip"):
                    self.flow_generator.add_packet(packet)
            else:
                time.sleep(0.001)

            now = time.time()
            if now - last_flush >= 5 and self.flow_generator is not None:
                self.flow_generator.flush_expired_flows()
                last_flush = now

    @staticmethod
    def _validate_features(features) -> list[float]:
        values = Preprocessor.validate(features)
        clean = [float(value) for value in values]
        if not all(math.isfinite(value) for value in clean):
            raise ValueError("Feature vector contains non-finite values after preprocessing")
        return clean

    def _on_flow_complete(self, flow) -> None:
        """Extract and enqueue quickly; never block packet processing on HTTP."""
        if not self.running:
            return

        try:
            features = self._validate_features(FeatureExtractor.extract(flow))
            payload = {
                "agent_id": self.agent_id,
                "features": features,
                "source_ip": flow.src_ip,
                "destination_ip": flow.dst_ip,
                "source_port": int(flow.src_port or 0),
                "destination_port": int(flow.dst_port or 0),
                "protocol": str(flow.protocol),
            }

            if self.diagnostic:
                nonzero = sum(1 for value in features if value != 0.0)
                logger.info(
                    "Feature diagnostic | count=%s nonzero=%s min=%.4f max=%.4f "
                    "fwd_packets=%s bwd_packets=%s duration_us=%.0f",
                    len(features),
                    nonzero,
                    min(features),
                    max(features),
                    len(flow._forward_packets),
                    len(flow._backward_packets),
                    features[1],
                )

            try:
                self.delivery_queue.put_nowait(payload)
            except queue.Full:
                self.dropped_flows += 1
                logger.warning(
                    "Remote sensor delivery queue full; dropping completed flow | dropped=%s",
                    self.dropped_flows,
                )

        except Exception as exc:
            self.failed_flows += 1
            logger.error("Remote sensor feature extraction failed: %s", exc)

    def _delivery_loop(self) -> None:
        while self.running or not self.delivery_queue.empty():
            try:
                payload = self.delivery_queue.get(timeout=0.25)
            except queue.Empty:
                continue

            try:
                self._deliver(payload)
            finally:
                self.delivery_queue.task_done()

    def _deliver(self, payload: dict) -> None:
        last_error: Exception | None = None

        for attempt in range(self.retries + 1):
            try:
                response = self.client.post(
                    f"{self.api_url}/agents/ingest",
                    json=payload,
                    headers=self.headers,
                )
                response.raise_for_status()
                result = response.json()
                self.sent_flows += 1

                logger.info(
                    "Remote prediction | agent=%s class=%s confidence=%.4f latency=%sms",
                    self.agent_id,
                    result.get("prediction"),
                    float(result.get("confidence", 0.0)),
                    result.get("latency_ms"),
                )

                if result.get("alert_created"):
                    logger.warning(
                        "Remote intrusion detected | class=%s alert_id=%s",
                        result.get("prediction"),
                        result.get("alert_id"),
                    )
                return

            except (httpx.TimeoutException, httpx.TransportError) as exc:
                last_error = exc
                if attempt < self.retries:
                    delay = 0.5 * (2 ** attempt)
                    logger.warning(
                        "Remote delivery retry %s/%s in %.1fs: %s",
                        attempt + 1,
                        self.retries,
                        delay,
                        exc,
                    )
                    time.sleep(delay)
                    continue
                break
            except Exception as exc:
                last_error = exc
                break

        self.failed_flows += 1
        logger.error("Remote sensor flow delivery failed: %s", last_error)


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="FedSentry Remote Sensor")
    parser.add_argument(
        "--api-url",
        default=os.getenv("FEDSENTRY_API_URL", "http://127.0.0.1:8000"),
    )
    parser.add_argument(
        "--agent-id",
        default=os.getenv("FEDSENTRY_AGENT_ID", "sensor-01"),
    )
    parser.add_argument(
        "--agent-key",
        default=os.getenv("FEDSENTRY_AGENT_KEY", ""),
    )
    parser.add_argument(
        "--interface",
        default=os.getenv("FEDSENTRY_INTERFACE") or None,
    )
    parser.add_argument(
        "--timeout",
        type=float,
        default=float(os.getenv("FEDSENTRY_SENSOR_TIMEOUT", "60")),
    )
    parser.add_argument(
        "--retries",
        type=int,
        default=int(os.getenv("FEDSENTRY_SENSOR_RETRIES", "2")),
    )
    parser.add_argument(
        "--diagnostic",
        action="store_true",
        default=os.getenv("FEDSENTRY_SENSOR_DIAGNOSTIC", "").lower() in {"1", "true", "yes"},
    )
    return parser.parse_args()


def main() -> None:
    args = parse_args()

    if not args.agent_key:
        raise SystemExit(
            "FEDSENTRY_AGENT_KEY or --agent-key is required. "
            "Use the same value as backend AGENT_API_KEY."
        )

    sensor = RemoteSensor(
        api_url=args.api_url,
        agent_id=args.agent_id,
        agent_key=args.agent_key,
        interface=args.interface,
        timeout=args.timeout,
        retries=args.retries,
        diagnostic=args.diagnostic,
    )

    stopping = threading.Event()

    def request_stop(*_args):
        stopping.set()

    signal.signal(signal.SIGINT, request_stop)
    if hasattr(signal, "SIGTERM"):
        signal.signal(signal.SIGTERM, request_stop)

    sensor.start()
    try:
        while not stopping.is_set():
            time.sleep(0.5)
    finally:
        sensor.stop()


if __name__ == "__main__":
    main()
