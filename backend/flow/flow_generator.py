"""Flow generation for FedSentry live traffic analysis."""

import threading
from datetime import datetime
from typing import Any, Callable, Dict, List, Optional

from capture.logger import logger


class Flow:
    """Represents one bidirectional network flow.

    The first packet defines the forward direction. Reverse packets are stored
    in ``_backward_packets`` so directional CICIDS features are meaningful.
    """

    def __init__(self, src_ip, dst_ip, src_port, dst_port, protocol):
        self.src_ip = src_ip
        self.dst_ip = dst_ip
        self.src_port = src_port
        self.dst_port = dst_port
        self.protocol = protocol

        self.packets: List[Dict[str, Any]] = []
        self.first_seen: Optional[datetime] = None
        self.last_seen: Optional[datetime] = None

        self._forward_packets: List[Dict] = []
        self._backward_packets: List[Dict] = []

    @property
    def duration(self) -> float:
        """Flow duration in seconds for timeout/rate calculations."""
        if self.first_seen and self.last_seen:
            return max(0.0, (self.last_seen - self.first_seen).total_seconds())
        return 0.0

    def add_packet(self, packet: Dict[str, Any]):
        ts = packet.get("timestamp")
        if isinstance(ts, str):
            try:
                ts = datetime.fromisoformat(ts)
            except (ValueError, TypeError):
                ts = datetime.utcnow()

        if self.first_seen is None:
            self.first_seen = ts
        self.last_seen = ts

        self.packets.append(packet)

        if self._is_forward(packet):
            self._forward_packets.append(packet)
        else:
            self._backward_packets.append(packet)

    def _is_forward(self, packet: Dict) -> bool:
        return (
            packet.get("src_ip") == self.src_ip
            and (packet.get("src_port") or 0) == self.src_port
            and packet.get("dst_ip") == self.dst_ip
            and (packet.get("dst_port") or 0) == self.dst_port
        )


class FlowGenerator:
    """Accumulates packets into bidirectional flows."""

    def __init__(
        self,
        flow_timeout: float = 10.0,
        max_packets_per_flow: int = 500,
        on_flow_complete: Optional[Callable] = None,
    ):
        self.flow_timeout = flow_timeout
        self.max_packets_per_flow = max_packets_per_flow
        self.on_flow_complete = on_flow_complete

        self.lock = threading.RLock()
        self.flows: Dict[tuple, Flow] = {}
        self.total_flows_created = 0
        self.total_flows_completed = 0

    @staticmethod
    def _endpoint(ip: str, port: int) -> tuple:
        return (str(ip or "0.0.0.0"), int(port or 0))

    def get_flow_key(self, packet: Dict) -> tuple:
        """Return a direction-independent five-tuple key.

        Earlier code keyed A->B and B->A separately. That made every live flow
        effectively one-way, forcing backward-packet CICIDS features to zero.
        Canonicalizing the endpoint pair keeps both directions in one flow while
        Flow itself preserves which direction arrived first.
        """
        src = self._endpoint(packet.get("src_ip"), packet.get("src_port"))
        dst = self._endpoint(packet.get("dst_ip"), packet.get("dst_port"))
        first, second = sorted((src, dst))
        return (first, second, str(packet.get("protocol", "OTHER")))

    def add_packet(self, packet: Dict[str, Any]):
        key = self.get_flow_key(packet)

        with self.lock:
            if key not in self.flows:
                self.flows[key] = Flow(
                    src_ip=packet.get("src_ip", "0.0.0.0"),
                    dst_ip=packet.get("dst_ip", "0.0.0.0"),
                    src_port=packet.get("src_port") or 0,
                    dst_port=packet.get("dst_port") or 0,
                    protocol=packet.get("protocol", "OTHER"),
                )
                self.total_flows_created += 1
                logger.info(
                    "Flow Created: %s:%s -> %s:%s [%s]",
                    self.flows[key].src_ip,
                    self.flows[key].src_port,
                    self.flows[key].dst_ip,
                    self.flows[key].dst_port,
                    self.flows[key].protocol,
                )

            flow = self.flows[key]
            flow.add_packet(packet)

            if (
                len(flow.packets) >= self.max_packets_per_flow
                or flow.duration >= self.flow_timeout
            ):
                self._complete_flow(key)

    def _complete_flow(self, key: tuple):
        if key in self.flows:
            flow = self.flows.pop(key)
            self.total_flows_completed += 1
            logger.info(
                "Flow Completed: %s:%s -> %s:%s [%s packets, %.2fs]",
                flow.src_ip,
                flow.src_port,
                flow.dst_ip,
                flow.dst_port,
                len(flow.packets),
                flow.duration,
            )
            if self.on_flow_complete:
                self.on_flow_complete(flow)

    def flush_expired_flows(self):
        now = datetime.utcnow()
        completed_keys = []

        with self.lock:
            for key, flow in list(self.flows.items()):
                if flow.last_seen is None:
                    continue
                idle_seconds = (now - flow.last_seen).total_seconds()
                if idle_seconds >= self.flow_timeout:
                    completed_keys.append(key)

            for key in completed_keys:
                self._complete_flow(key)

        return len(completed_keys)

    def get_active_flows(self) -> int:
        with self.lock:
            return len(self.flows)

    def statistics(self) -> Dict[str, Any]:
        with self.lock:
            return {
                "active_flows": len(self.flows),
                "total_flows_created": self.total_flows_created,
                "total_flows_completed": self.total_flows_completed,
            }


flow_generator = FlowGenerator()
