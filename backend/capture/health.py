"""
Capture engine health.
"""

from dataclasses import dataclass


@dataclass
class CaptureHealth:

    capture_running: bool = False

    interface_name: str | None = None

    interface_connected: bool = False

    queue_size: int = 0

    parser_running: bool = False

    healthy: bool = True


health = CaptureHealth()