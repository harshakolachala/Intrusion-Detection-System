"""FedSentry packet capture engine.

Captures live packets using Scapy and sends parsed packets to the
thread-safe packet queue. AsyncSniffer is used so capture can be
stopped immediately from the API instead of waiting for sniff() to end.
"""

import threading

from scapy.all import AsyncSniffer, get_if_list

from capture.config import capture_config
from capture.logger import logger
from capture.parser import PacketParser
from capture.queue_manager import packet_queue


class PacketCapture:
    def __init__(self):
        self.interface = capture_config.interface
        self.running = False
        self.sniffer = None
        self.packet_count = 0
        self.error_count = 0
        self._lock = threading.RLock()
        self._started_event = threading.Event()

    def get_interfaces(self):
        return get_if_list()

    def set_interface(self, interface):
        with self._lock:
            if self.running:
                raise RuntimeError("Cannot change capture interface while capture is running.")
            self.interface = interface

    def _mark_started(self):
        self.running = True
        self._started_event.set()
        logger.info("Capture Started")

    def packet_handler(self, packet):
        # A packet can arrive while AsyncSniffer is shutting down. Never enqueue
        # anything after stop_capture() has marked the capture as stopped.
        if not self.running:
            return

        try:
            parsed_packet = PacketParser.parse(packet)
            if not self.running:
                return
            packet_queue.enqueue(parsed_packet)
            self.packet_count += 1
        except Exception as exc:
            self.error_count += 1
            logger.exception(exc)

    def start_capture(self):
        with self._lock:
            if self.running or (self.sniffer is not None and getattr(self.sniffer, "running", False)):
                logger.warning("Capture already running.")
                return True

            self._started_event.clear()
            self.sniffer = AsyncSniffer(
                iface=self.interface,
                prn=self.packet_handler,
                filter=capture_config.bpf_filter,
                store=capture_config.store_packets,
                timeout=capture_config.timeout,
                started_callback=self._mark_started,
            )
            sniffer = self.sniffer
            sniffer.start()

        # Wait until Scapy has opened the capture socket. This also prevents the
        # start endpoint from claiming success when capture could not start.
        if not self._started_event.wait(timeout=3.0):
            self.running = False
            try:
                if getattr(sniffer, "running", False):
                    sniffer.stop(join=True)
            except Exception:
                logger.exception("Unable to clean up failed packet capture start.")
            with self._lock:
                if self.sniffer is sniffer:
                    self.sniffer = None
            raise RuntimeError("Packet capture did not start. Check interface and capture permissions.")

        return True

    def stop_capture(self):
        """Stop the underlying Scapy capture thread and wait for it to exit."""
        with self._lock:
            sniffer = self.sniffer
            self.running = False

        if sniffer is not None:
            try:
                if getattr(sniffer, "running", False):
                    sniffer.stop(join=True)
                else:
                    # If startup/teardown raced, wait briefly for the worker to settle.
                    sniffer.join(timeout=1.0)
            except Exception as exc:
                logger.warning("Packet capture stop returned an error: %s", exc)

        with self._lock:
            if self.sniffer is sniffer:
                self.sniffer = None
            self._started_event.clear()

        logger.info("Capture Stopped")
        return not self.is_running()

    def is_running(self):
        with self._lock:
            sniffer_running = bool(
                self.sniffer is not None and getattr(self.sniffer, "running", False)
            )
            return bool(self.running and sniffer_running)

    def statistics(self):
        return {
            "running": self.is_running(),
            "captured_packets": self.packet_count,
            "queue_size": packet_queue.size(),
            "errors": self.error_count,
        }


capture_engine = PacketCapture()
