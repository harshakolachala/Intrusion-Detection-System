"""
Capture engine configuration.
"""

from dataclasses import dataclass


@dataclass
class CaptureConfig:
    # Network interface (None = use default)
    interface: str | None = None

    # BPF filter
    bpf_filter: str = ""

    # Number of packets to capture (0 = unlimited)
    packet_count: int = 0

    # Capture timeout (seconds)
    timeout: int | None = None

    # Packet queue size
    queue_size: int = 10000

    # Capture buffer size
    buffer_size: int = 65535

    # Enable promiscuous mode
    promiscuous: bool = True

    # Store packets in Scapy memory
    store_packets: bool = False


capture_config = CaptureConfig()