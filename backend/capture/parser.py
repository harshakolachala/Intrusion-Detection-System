"""
Packet parser for SentinelAI.

Converts raw Scapy packets into structured dictionaries
used by the Flow Engine.
"""

from datetime import datetime

from scapy.layers.inet import IP, TCP, UDP, ICMP
from scapy.layers.l2 import Ether


class PacketParser:

    @staticmethod
    def parse(packet):

        data = {
            "timestamp": datetime.utcnow().isoformat(),
            "src_mac": None,
            "dst_mac": None,
            "src_ip": None,
            "dst_ip": None,
            "src_port": None,
            "dst_port": None,
            "protocol": None,
            "packet_length": len(packet),
            "ttl": None,
            "tcp_flags": None,
            "payload_size": 0,
        }

        # Ethernet Layer
        if packet.haslayer(Ether):
            eth = packet[Ether]
            data["src_mac"] = eth.src
            data["dst_mac"] = eth.dst

        # IPv4 Layer
        if packet.haslayer(IP):
            ip = packet[IP]

            data["src_ip"] = ip.src
            data["dst_ip"] = ip.dst
            data["ttl"] = ip.ttl
            data["protocol"] = ip.proto

        # TCP
        if packet.haslayer(TCP):

            tcp = packet[TCP]

            data["protocol"] = "TCP"
            data["src_port"] = tcp.sport
            data["dst_port"] = tcp.dport
            data["tcp_flags"] = str(tcp.flags)

            if tcp.payload:
                data["payload_size"] = len(bytes(tcp.payload))

        # UDP
        elif packet.haslayer(UDP):

            udp = packet[UDP]

            data["protocol"] = "UDP"
            data["src_port"] = udp.sport
            data["dst_port"] = udp.dport

            if udp.payload:
                data["payload_size"] = len(bytes(udp.payload))

        # ICMP
        elif packet.haslayer(ICMP):

            data["protocol"] = "ICMP"

        return data