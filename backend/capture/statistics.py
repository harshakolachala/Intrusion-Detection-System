"""
Capture statistics.
"""

from dataclasses import dataclass
from datetime import datetime


@dataclass
class CaptureStatistics:

    start_time: datetime | None = None

    packets_received: int = 0

    tcp_packets: int = 0

    udp_packets: int = 0

    icmp_packets: int = 0

    other_packets: int = 0

    dropped_packets: int = 0

    parser_errors: int = 0

    queue_errors: int = 0

    def reset(self):

        self.start_time = datetime.utcnow()

        self.packets_received = 0

        self.tcp_packets = 0

        self.udp_packets = 0

        self.icmp_packets = 0

        self.other_packets = 0

        self.dropped_packets = 0

        self.parser_errors = 0

        self.queue_errors = 0


statistics = CaptureStatistics()