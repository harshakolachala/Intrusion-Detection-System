"""FedSentry distributed network sensor.

Run this module on a monitored machine or network sensor host. It captures
packets locally, constructs flows, extracts the same 78 CICIDS-style features,
and sends only the resulting flow vector and metadata to the central FedSentry
API. Raw packets are not uploaded.

Example:
    python -m agent.sensor --api-url https://api.example.com \
        --agent-id lab-pc-01 --interface "Wi-Fi"

Environment variables can also be used:
    FEDSENTRY_API_URL
    FEDSENTRY_AGENT_ID
    FEDSENTRY_AGENT_KEY
    FEDSENTRY_INTERFACE
"""

from __future__ import annotations

import argparse
import os
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
        timeout: float = 15.0,
    ):
        self.api_url = api_url.rstrip("/")
        self.agent_id = agent_id
        self.agent_key = agent_key
        self.interface = interface
        self.timeout = timeout
        self.running = False
        self.worker_thread: threading.Thread | None = None
        self.flow_generator: FlowGenerator | None = None
        self.client = httpx.Client(timeout=timeout)
        self.sent_flows = 0
        self.failed_flows = 0

    def verify_gateway(self) -> None:
        response = self.client.get(
            f"{self.api_url}/agents/health",
            headers={"X-Agent-Key": self.agent_key},
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
            name="fedsentry-remote-sensor",
        )
        self.worker_thread.start()

        logger.info("=" * 60)
        logger.info("FedSentry Remote Sensor Started")
        logger.info("Agent ID  : %s", self.agent_id)
        logger.info("Cloud API : %s", self.api_url)
        logger.info("Interface : %s", self.interface or "default")
        logger.info("Raw packet upload: disabled")
        logger.info("=" * 60)

    def stop(self) -> None:
        self.running = False
        capture_engine.stop_capture()

        if (
            self.worker_thread
            and self.worker_thread.is_alive()
            and self.worker_thread is not threading.current_thread()
        ):
            self.worker_thread.join()

        if self.flow_generator is not None:
            try:
                self.flow_generator.flush_expired_flows()
            except Exception:
                logger.exception("Unable to flush final sensor flows")

        packet_queue.clear()
        self.client.close()

        logger.info(
            "FedSentry Remote Sensor Stopped | sent=%s failed=%s",
            self.sent_flows,
            self.failed_flows,
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

    def _on_flow_complete(self, flow) -> None:
        if not self.running:
            return

        try:
            features = FeatureExtractor.extract(flow)
            features = Preprocessor.handle_missing_values(features)

            payload = {
                "agent_id": self.agent_id,
                "features": [float(value) for value in features],
                "source_ip": flow.src_ip,
                "destination_ip": flow.dst_ip,
                "source_port": int(flow.src_port or 0),
                "destination_port": int(flow.dst_port or 0),
                "protocol": str(flow.protocol),
            }

            response = self.client.post(
                f"{self.api_url}/agents/ingest",
                json=payload,
                headers={"X-Agent-Key": self.agent_key},
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

        except Exception as exc:
            self.failed_flows += 1
            logger.error("Remote sensor flow delivery failed: %s", exc)


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
