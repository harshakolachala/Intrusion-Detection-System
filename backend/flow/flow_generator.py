"""
Flow Generator for SentinelAI.
"""

import threading
from datetime import datetime
from typing import Any, Callable, Dict, List, Optional

from capture.logger import logger


class Flow:
    """Represents a single network flow."""

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
        if self.first_seen and self.last_seen:
            return (self.last_seen - self.first_seen).total_seconds()
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
            and packet.get("src_port") == self.src_port
            and packet.get("dst_ip") == self.dst_ip
            and packet.get("dst_port") == self.dst_port
        )


class FlowGenerator:
    """Accumulates packets into flows."""

    def __init__(
        self,
        flow_timeout: float = 10.0,
        max_packets_per_flow: int = 500,
        on_flow_complete: Optional[Callable] = None,
    ):
        self.flow_timeout = flow_timeout
        self.max_packets_per_flow = max_packets_per_flow
        self.on_flow_complete = on_flow_complete

        self.lock = threading.Lock()
        self.flows: Dict[tuple, Flow] = {}
        self.total_flows_created = 0
        self.total_flows_completed = 0

    def get_flow_key(self, packet: Dict) -> tuple:
        return (
            packet.get("src_ip", "0.0.0.0"),
            packet.get("dst_ip", "0.0.0.0"),
            packet.get("src_port") or 0,
            packet.get("dst_port") or 0,
            packet.get("protocol", "OTHER"),
        )

    def add_packet(self, packet: Dict[str, Any]):
        key = self.get_flow_key(packet)

        with self.lock:
            if key not in self.flows:
                self.flows[key] = Flow(
                    src_ip=key[0],
                    dst_ip=key[1],
                    src_port=key[2],
                    dst_port=key[3],
                    protocol=key[4],
                )
                self.total_flows_created += 1
                logger.info(
                    f"Flow Created: {key[0]}:{key[2]} -> "
                    f"{key[1]}:{key[3]} [{key[4]}]"
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
                f"Flow Completed: {flow.src_ip}:{flow.src_port} -> "
                f"{flow.dst_ip}:{flow.dst_port} "
                f"[{len(flow.packets)} packets, "
                f"{flow.duration:.2f}s]"
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
