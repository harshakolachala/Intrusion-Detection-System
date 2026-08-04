"""
Enterprise Packet Capture Engine

Captures live packets using Scapy and sends them
to the Packet Queue after parsing.
"""

import threading

from scapy.all import sniff, get_if_list

from capture.config import capture_config
from capture.logger import logger
from capture.parser import PacketParser
from capture.queue_manager import packet_queue


class PacketCapture:

    def __init__(self):

        self.interface = capture_config.interface
        self.running = False
        self.capture_thread = None

        self.packet_count = 0
        self.error_count = 0

    # -------------------------

    def get_interfaces(self):

        return get_if_list()

    # -------------------------

    def set_interface(self, interface):

        self.interface = interface

    # -------------------------

    def packet_handler(self, packet):

        try:

            parsed_packet = PacketParser.parse(packet)

            packet_queue.enqueue(parsed_packet)

            self.packet_count += 1

        except Exception as e:

            self.error_count += 1

            logger.exception(e)

    # -------------------------

    def _capture(self):

        logger.info("Capture Started")

        self.running = True

        sniff(

            iface=self.interface,

            prn=self.packet_handler,

            filter=capture_config.bpf_filter,

            store=capture_config.store_packets,

            timeout=capture_config.timeout,

        )

        self.running = False

        logger.info("Capture Stopped")

    # -------------------------

    def start_capture(self):

        if self.running:

            logger.warning("Capture already running.")

            return

        self.capture_thread = threading.Thread(

            target=self._capture,

            daemon=True,

        )

        self.capture_thread.start()

    # -------------------------

    def stop_capture(self):

        self.running = False

    # -------------------------

    def statistics(self):

        return {

            "running": self.running,

            "captured_packets": self.packet_count,

            "queue_size": packet_queue.size(),

            "errors": self.error_count,

        }


capture_engine = PacketCapture()