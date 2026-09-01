"""Packet parser for FedSentry live network capture."""

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
            "header_length": None,
            "ttl": None,
            "tcp_flags": None,
            "tcp_window": None,
            "payload_size": 0,
        }

        if packet.haslayer(Ether):
            eth = packet[Ether]
            data["src_mac"] = eth.src
            data["dst_mac"] = eth.dst

        ip_header_length = 0
        if packet.haslayer(IP):
            ip = packet[IP]
            data["src_ip"] = ip.src
            data["dst_ip"] = ip.dst
            data["ttl"] = ip.ttl
            data["protocol"] = ip.proto
            if getattr(ip, "ihl", None):
                ip_header_length = int(ip.ihl) * 4

        if packet.haslayer(TCP):
            tcp = packet[TCP]
            data["protocol"] = "TCP"
            data["src_port"] = int(tcp.sport)
            data["dst_port"] = int(tcp.dport)
            data["tcp_flags"] = str(tcp.flags)
            data["tcp_window"] = int(tcp.window)
            tcp_header_length = int(tcp.dataofs or 5) * 4
            data["header_length"] = ip_header_length + tcp_header_length
            if tcp.payload:
                data["payload_size"] = len(bytes(tcp.payload))

        elif packet.haslayer(UDP):
            udp = packet[UDP]
            data["protocol"] = "UDP"
            data["src_port"] = int(udp.sport)
            data["dst_port"] = int(udp.dport)
            data["header_length"] = ip_header_length + 8
            if udp.payload:
                data["payload_size"] = len(bytes(udp.payload))

        elif packet.haslayer(ICMP):
            data["protocol"] = "ICMP"
            data["header_length"] = ip_header_length + 8

        return data
