"""
Feature Extractor for SentinelAI.

Extracts the 78 CIC-IDS2017 features from a completed Flow object.
The feature order matches the training dataset exactly.
"""

from datetime import datetime
from typing import Dict, List, Optional

from capture.logger import logger


def _safe_std(values: List[float], mean: float ) -> float:
    if len(values) < 2:
        return 0.0
    variance = sum((x - mean) ** 2 for x in values) / len(values)
    return variance ** 0.5


def _parse_iat(packets: List[Dict]) -> List[float]:
    iats = []
    for i in range(1, len(packets)):
        ts1 = packets[i - 1].get("timestamp")
        ts2 = packets[i].get("timestamp")
        if isinstance(ts1, str):
            try:
                ts1 = datetime.fromisoformat(ts1)
            except (ValueError, TypeError):
                continue
        if isinstance(ts2, str):
            try:
                ts2 = datetime.fromisoformat(ts2)
            except (ValueError, TypeError):
                continue
        iat = abs((ts2 - ts1).total_seconds() * 1000)
        iats.append(iat)
    return iats


def _count_flags(packets_list: List[Dict], flag_char: str) -> int:
    count = 0
    for p in packets_list:
        flags = p.get("tcp_flags", "") or ""
        if flag_char in str(flags):
            count += 1
    return count


def _packet_length(packet: Dict) -> int:
    pkt_len = packet.get("packet_length", 0) or 0
    return pkt_len


def _header_length(packet: Dict) -> int:
    pkt_len = packet.get("packet_length", 0) or 0
    payload = packet.get("payload_size", 0) or 0
    return pkt_len - payload


class FeatureExtractor:
    """Extracts 78 CIC-IDS2017 features from a Flow object."""

    @staticmethod
    def extract(flow) -> List[float]:
        packets = flow.packets
        fwd = flow._forward_packets
        bwd = flow._backward_packets

        duration = max(flow.duration, 0.0)

        fwd_lengths = [_packet_length(p) for p in fwd]
        bwd_lengths = [_packet_length(p) for p in bwd]
        all_lengths = fwd_lengths + bwd_lengths

        all_iats = _parse_iat(packets)
        fwd_iats = _parse_iat(fwd)
        bwd_iats = _parse_iat(bwd)

        fin_count = _count_flags(packets, "F")
        syn_count = _count_flags(packets, "S")
        rst_count = _count_flags(packets, "R")
        psh_count = _count_flags(packets, "P")
        ack_count = _count_flags(packets, "A")
        urg_count = _count_flags(packets, "U")
        cwe_count = _count_flags(packets, "C")
        ece_count = _count_flags(packets, "E")

        fwd_psh = _count_flags(fwd, "P")
        bwd_psh = _count_flags(bwd, "P")
        fwd_urg = _count_flags(fwd, "U")
        bwd_urg = _count_flags(bwd, "U")

        fwd_hdr = [_header_length(p) for p in fwd]
        bwd_hdr = [_header_length(p) for p in bwd]
        total_fwd_hdr = sum(fwd_hdr) if fwd_hdr else 0.0
        total_bwd_hdr = sum(bwd_hdr) if bwd_hdr else 0.0

        total_fwd = len(fwd)
        total_bwd = len(bwd)
        total_bytes = sum(all_lengths)
        total_packets = len(packets)
        total_fwd_bytes = sum(fwd_lengths) if fwd_lengths else 0.0
        total_bwd_bytes = sum(bwd_lengths) if bwd_lengths else 0.0

        fwd_len_mean = sum(fwd_lengths) / len(fwd_lengths) if fwd_lengths else 0.0
        bwd_len_mean = sum(bwd_lengths) / len(bwd_lengths) if bwd_lengths else 0.0
        pkt_mean = sum(all_lengths) / len(all_lengths) if all_lengths else 0.0

        feat = []

        # 1. Destination Port
        feat.append(float(flow.dst_port or 0))

        # 2. Flow Duration
        feat.append(float(duration))

        # 3. Total Fwd Packets
        feat.append(float(total_fwd))

        # 4. Total Backward Packets
        feat.append(float(total_bwd))

        # 5. Total Length of Fwd Packets
        feat.append(float(total_fwd_bytes))

        # 6. Total Length of Bwd Packets
        feat.append(float(total_bwd_bytes))

        # 7-10. Fwd Packet Length Stats
        feat.append(float(max(fwd_lengths)) if fwd_lengths else 0.0)
        feat.append(float(min(fwd_lengths)) if fwd_lengths else 0.0)
        feat.append(float(fwd_len_mean))
        feat.append(float(_safe_std(fwd_lengths, fwd_len_mean)))

        # 11-14. Bwd Packet Length Stats
        feat.append(float(max(bwd_lengths)) if bwd_lengths else 0.0)
        feat.append(float(min(bwd_lengths)) if bwd_lengths else 0.0)
        feat.append(float(bwd_len_mean))
        feat.append(float(_safe_std(bwd_lengths, bwd_len_mean)))

        # 15. Flow Bytes/s
        feat.append(float(total_bytes / duration) if duration > 0 else 0.0)

        # 16. Flow Packets/s
        feat.append(float(total_packets / duration) if duration > 0 else 0.0)

        # 17-20. Flow IAT Stats (ms) - 4 features
        if all_iats:
            mean_iat = sum(all_iats) / len(all_iats)
            feat.extend([float(mean_iat), float(_safe_std(all_iats, mean_iat)),
                         float(max(all_iats)), float(min(all_iats))])
        else:
            feat.extend([0.0, 0.0, 0.0, 0.0])

        # 21-25. Fwd IAT Stats - 5 features
        if fwd_iats:
            mean_fwd_iat = sum(fwd_iats) / len(fwd_iats)
            feat.extend([float(sum(fwd_iats)), float(mean_fwd_iat),
                         float(_safe_std(fwd_iats, mean_fwd_iat)),
                         float(max(fwd_iats)), float(min(fwd_iats))])
        else:
            feat.extend([0.0, 0.0, 0.0, 0.0, 0.0])

        # 26-30. Bwd IAT Stats - 5 features
        if bwd_iats:
            mean_bwd_iat = sum(bwd_iats) / len(bwd_iats)
            feat.extend([float(sum(bwd_iats)), float(mean_bwd_iat),
                         float(_safe_std(bwd_iats, mean_bwd_iat)),
                         float(max(bwd_iats)), float(min(bwd_iats))])
        else:
            feat.extend([0.0, 0.0, 0.0, 0.0, 0.0])

        # 31-34. PSH/URG Flags - 4 features
        feat.extend([float(fwd_psh), float(bwd_psh), float(fwd_urg), float(bwd_urg)])

        # 35. Fwd Header Length
        feat.append(float(total_fwd_hdr))

        # 36. Bwd Header Length
        feat.append(float(total_bwd_hdr))

        # 37. Fwd Packets/s
        feat.append(float(total_fwd / duration) if duration > 0 else 0.0)

        # 38. Bwd Packets/s
        feat.append(float(total_bwd / duration) if duration > 0 else 0.0)

        # 39-43. Packet Length Stats - 5 features
        feat.append(float(min(all_lengths)) if all_lengths else 0.0)
        feat.append(float(max(all_lengths)) if all_lengths else 0.0)
        feat.append(float(pkt_mean))
        feat.append(float(_safe_std(all_lengths, pkt_mean)))
        pkt_var = sum((x - pkt_mean) ** 2 for x in all_lengths) / len(all_lengths) if all_lengths else 0.0
        feat.append(float(pkt_var))

        # 44-51. Flag Counts - 8 features
        feat.extend([float(fin_count), float(syn_count), float(rst_count),
                     float(psh_count), float(ack_count), float(urg_count),
                     float(cwe_count), float(ece_count)])

        # 52. Down/Up Ratio
        feat.append(float(total_fwd / total_bwd) if total_bwd > 0 else 0.0)

        # 53. Average Packet Size
        feat.append(float(total_bytes / total_packets) if total_packets > 0 else 0.0)

        # 54. Avg Fwd Segment Size
        feat.append(float(total_fwd_bytes / total_fwd) if total_fwd > 0 else 0.0)

        # 55. Avg Bwd Segment Size
        feat.append(float(total_bwd_bytes / total_bwd) if total_bwd > 0 else 0.0)

        # 56. Fwd Header Length (as in dataset - duplicate of 35)
        feat.append(float(total_fwd_hdr))

        # 57-62. Bulk Stats - 6 features
        fwd_bulk_n = max(1, len(fwd) // 4) if fwd else 0
        fwd_bulk_bytes = sum((p.get("payload_size", 0) or 0) for p in fwd[:fwd_bulk_n]) if fwd_bulk_n else 0.0
        bwd_bulk_n = max(1, len(bwd) // 4) if bwd else 0
        bwd_bulk_bytes = sum((p.get("payload_size", 0) or 0) for p in bwd[:bwd_bulk_n]) if bwd_bulk_n else 0.0

        feat.append(float(fwd_bulk_bytes / fwd_bulk_n) if fwd_bulk_n > 0 else 0.0)  # 57
        feat.append(float(fwd_bulk_n / fwd_bulk_n) if fwd_bulk_n > 0 else 0.0)      # 58
        feat.append(float(fwd_bulk_bytes / duration) if duration > 0 else 0.0)       # 59
        feat.append(float(bwd_bulk_bytes / bwd_bulk_n) if bwd_bulk_n > 0 else 0.0)  # 60
        feat.append(float(bwd_bulk_n / bwd_bulk_n) if bwd_bulk_n > 0 else 0.0)      # 61
        feat.append(float(bwd_bulk_bytes / duration) if duration > 0 else 0.0)       # 62

        # 63. Subflow Fwd Packets
        feat.append(float(total_fwd))

        # 64. Subflow Fwd Bytes
        feat.append(float(total_fwd_bytes))

        # 65. Subflow Bwd Packets
        feat.append(float(total_bwd))

        # 66. Subflow Bwd Bytes
        feat.append(float(total_bwd_bytes))

        # 67. Init_Win_bytes_forward
        feat.append(0.0)

        # 68. Init_Win_bytes_backward
        feat.append(0.0)

        # 69. act_data_pkt_fwd
        act_data = sum(1 for p in fwd if (p.get("payload_size", 0) or 0) > 0)
        feat.append(float(act_data))

        # 70. min_seg_size_forward
        feat.append(float(min(fwd_lengths)) if fwd_lengths else 0.0)

        # 71-74. Active Mean/Std/Max/Min - 4 features
        active_times = []
        for i in range(1, len(packets)):
            ts1 = packets[i - 1].get("timestamp")
            ts2 = packets[i].get("timestamp")
            if isinstance(ts1, str):
                try:
                    ts1 = datetime.fromisoformat(ts1)
                except (ValueError, TypeError):
                    continue
            if isinstance(ts2, str):
                try:
                    ts2 = datetime.fromisoformat(ts2)
                except (ValueError, TypeError):
                    continue
            gap = (ts2 - ts1).total_seconds()
            if gap > 0:
                active_times.append(gap)

        if active_times:
            active_mean = sum(active_times) / len(active_times)
            feat.extend([float(active_mean), float(_safe_std(active_times, active_mean)),
                         float(max(active_times)), float(min(active_times))])
        else:
            feat.extend([0.0, 0.0, 0.0, 0.0])

        # 75-78. Idle Mean/Std/Max/Min - 4 features
        feat.extend([0.0, 0.0, 0.0, 0.0])

        assert len(feat) == 78, f"Expected 78 features, got {len(feat)}"
        return feat


feature_extractor = FeatureExtractor()
