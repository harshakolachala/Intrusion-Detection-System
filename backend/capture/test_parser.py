from scapy.layers.inet import IP, TCP
from scapy.packet import Raw

from parser import PacketParser


packet = (

    IP(src="192.168.1.10", dst="8.8.8.8")
    /
    TCP(sport=55555, dport=443)
    /
    Raw(load="Hello SentinelAI")

)

parsed = PacketParser.parse(packet)

for key, value in parsed.items():
    print(f"{key:15} : {value}")