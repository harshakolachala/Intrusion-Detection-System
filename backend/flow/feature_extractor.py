"""FedSentry CICIDS-style live feature extraction.

The extractor emits the 78-feature vector expected by the trained model.
Timing fields use microseconds, matching CICFlowMeter/CICIDS conventions,
while rate features continue to use seconds as their denominator.
"""

from datetime import datetime
from typing import Dict, List


MICROSECONDS_PER_SECOND = 1_000_000.0


def _safe_std(values: List[float], mean: float) -> float:
    if len(values) < 2:
        return 0.0
    variance = sum((x - mean) ** 2 for x in values) / len(values)
    return variance ** 0.5


def _timestamp(value):
    if isinstance(value, str):
        try:
            return datetime.fromisoformat(value)
        except (ValueError, TypeError):
            return None
    return value


def _parse_iat(packets: List[Dict]) -> List[float]:
    """Return inter-arrival times in microseconds."""
    iats = []
    for i in range(1, len(packets)):
        ts1 = _timestamp(packets[i - 1].get("timestamp"))
        ts2 = _timestamp(packets[i].get("timestamp"))
        if ts1 is None or ts2 is None:
            continue
        iats.append(abs((ts2 - ts1).total_seconds()) * MICROSECONDS_PER_SECOND)
    return iats


def _count_flags(packets_list: List[Dict], flag_char: str) -> int:
    return sum(
        1
        for packet in packets_list
        if flag_char in str(packet.get("tcp_flags", "") or "")
    )


def _packet_length(packet: Dict) -> int:
    return int(packet.get("packet_length", 0) or 0)


def _header_length(packet: Dict) -> int:
    explicit = packet.get("header_length")
    if explicit is not None:
        return max(0, int(explicit))
    return max(
        0,
        int(packet.get("packet_length", 0) or 0)
        - int(packet.get("payload_size", 0) or 0),
    )


class FeatureExtractor:
    """Extract exactly 78 CICIDS-style features from a completed Flow."""

    @staticmethod
    def extract(flow) -> List[float]:
        packets = flow.packets
        fwd = flow._forward_packets
        bwd = flow._backward_packets

        duration_seconds = max(flow.duration, 0.0)
        duration_us = duration_seconds * MICROSECONDS_PER_SECOND

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

        total_fwd_hdr = sum(_header_length(p) for p in fwd)
        total_bwd_hdr = sum(_header_length(p) for p in bwd)

        total_fwd = len(fwd)
        total_bwd = len(bwd)
        total_packets = len(packets)
        total_fwd_bytes = sum(fwd_lengths)
        total_bwd_bytes = sum(bwd_lengths)
        total_bytes = total_fwd_bytes + total_bwd_bytes

        fwd_len_mean = sum(fwd_lengths) / total_fwd if total_fwd else 0.0
        bwd_len_mean = sum(bwd_lengths) / total_bwd if total_bwd else 0.0
        pkt_mean = sum(all_lengths) / total_packets if total_packets else 0.0

        feat: List[float] = []

        # 1-6: destination, duration (us), directional packet/byte totals.
        feat.extend([
            float(flow.dst_port or 0),
            float(duration_us),
            float(total_fwd),
            float(total_bwd),
            float(total_fwd_bytes),
            float(total_bwd_bytes),
        ])

        # 7-14: directional packet-length statistics.
        feat.extend([
            float(max(fwd_lengths)) if fwd_lengths else 0.0,
            float(min(fwd_lengths)) if fwd_lengths else 0.0,
            float(fwd_len_mean),
            float(_safe_std(fwd_lengths, fwd_len_mean)),
            float(max(bwd_lengths)) if bwd_lengths else 0.0,
            float(min(bwd_lengths)) if bwd_lengths else 0.0,
            float(bwd_len_mean),
            float(_safe_std(bwd_lengths, bwd_len_mean)),
        ])

        # 15-16: rates are per second.
        feat.append(float(total_bytes / duration_seconds) if duration_seconds > 0 else 0.0)
        feat.append(float(total_packets / duration_seconds) if duration_seconds > 0 else 0.0)

        # 17-20: flow IAT statistics in microseconds.
        if all_iats:
            mean_iat = sum(all_iats) / len(all_iats)
            feat.extend([
                float(mean_iat),
                float(_safe_std(all_iats, mean_iat)),
                float(max(all_iats)),
                float(min(all_iats)),
            ])
        else:
            feat.extend([0.0] * 4)

        # 21-25: forward IAT total/mean/std/max/min in microseconds.
        if fwd_iats:
            mean_fwd_iat = sum(fwd_iats) / len(fwd_iats)
            feat.extend([
                float(sum(fwd_iats)),
                float(mean_fwd_iat),
                float(_safe_std(fwd_iats, mean_fwd_iat)),
                float(max(fwd_iats)),
                float(min(fwd_iats)),
            ])
        else:
            feat.extend([0.0] * 5)

        # 26-30: backward IAT statistics in microseconds.
        if bwd_iats:
            mean_bwd_iat = sum(bwd_iats) / len(bwd_iats)
            feat.extend([
                float(sum(bwd_iats)),
                float(mean_bwd_iat),
                float(_safe_std(bwd_iats, mean_bwd_iat)),
                float(max(bwd_iats)),
                float(min(bwd_iats)),
            ])
        else:
            feat.extend([0.0] * 5)

        # 31-38: flags, header lengths and directional rates.
        feat.extend([
            float(fwd_psh),
            float(bwd_psh),
            float(fwd_urg),
            float(bwd_urg),
            float(total_fwd_hdr),
            float(total_bwd_hdr),
            float(total_fwd / duration_seconds) if duration_seconds > 0 else 0.0,
            float(total_bwd / duration_seconds) if duration_seconds > 0 else 0.0,
        ])

        # 39-43: aggregate packet-length statistics.
        pkt_var = (
            sum((x - pkt_mean) ** 2 for x in all_lengths) / len(all_lengths)
            if all_lengths
            else 0.0
        )
        feat.extend([
            float(min(all_lengths)) if all_lengths else 0.0,
            float(max(all_lengths)) if all_lengths else 0.0,
            float(pkt_mean),
            float(_safe_std(all_lengths, pkt_mean)),
            float(pkt_var),
        ])

        # 44-51: TCP flag counts.
        feat.extend([
            float(fin_count), float(syn_count), float(rst_count),
            float(psh_count), float(ack_count), float(urg_count),
            float(cwe_count), float(ece_count),
        ])

        # 52-56: ratios and segment/header averages.
        feat.extend([
            float(total_fwd / total_bwd) if total_bwd > 0 else 0.0,
            float(total_bytes / total_packets) if total_packets > 0 else 0.0,
            float(total_fwd_bytes / total_fwd) if total_fwd > 0 else 0.0,
            float(total_bwd_bytes / total_bwd) if total_bwd > 0 else 0.0,
            float(total_fwd_hdr),
        ])

        # 57-62: conservative bulk approximations.
        fwd_bulk_n = max(1, len(fwd) // 4) if fwd else 0
        bwd_bulk_n = max(1, len(bwd) // 4) if bwd else 0
        fwd_bulk_bytes = sum((p.get("payload_size", 0) or 0) for p in fwd[:fwd_bulk_n]) if fwd_bulk_n else 0.0
        bwd_bulk_bytes = sum((p.get("payload_size", 0) or 0) for p in bwd[:bwd_bulk_n]) if bwd_bulk_n else 0.0
        feat.extend([
            float(fwd_bulk_bytes / fwd_bulk_n) if fwd_bulk_n else 0.0,
            1.0 if fwd_bulk_n else 0.0,
            float(fwd_bulk_bytes / duration_seconds) if duration_seconds > 0 else 0.0,
            float(bwd_bulk_bytes / bwd_bulk_n) if bwd_bulk_n else 0.0,
            1.0 if bwd_bulk_n else 0.0,
            float(bwd_bulk_bytes / duration_seconds) if duration_seconds > 0 else 0.0,
        ])

        # 63-66: subflow totals.
        feat.extend([
            float(total_fwd),
            float(total_fwd_bytes),
            float(total_bwd),
            float(total_bwd_bytes),
        ])

        # 67-68: initial TCP windows where captured by the parser.
        fwd_win = next((p.get("tcp_window") for p in fwd if p.get("tcp_window") is not None), 0)
        bwd_win = next((p.get("tcp_window") for p in bwd if p.get("tcp_window") is not None), 0)
        feat.extend([float(fwd_win or 0), float(bwd_win or 0)])

        # 69-70: active data packets and minimum forward segment/header size.
        act_data = sum(1 for p in fwd if (p.get("payload_size", 0) or 0) > 0)
        feat.append(float(act_data))
        feat.append(float(min((_header_length(p) for p in fwd), default=0.0)))

        # 71-74: active gap approximation in microseconds.
        active_times = []
        for i in range(1, len(packets)):
            ts1 = _timestamp(packets[i - 1].get("timestamp"))
            ts2 = _timestamp(packets[i].get("timestamp"))
            if ts1 is None or ts2 is None:
                continue
            gap_us = (ts2 - ts1).total_seconds() * MICROSECONDS_PER_SECOND
            if gap_us > 0:
                active_times.append(gap_us)

        if active_times:
            active_mean = sum(active_times) / len(active_times)
            feat.extend([
                float(active_mean),
                float(_safe_std(active_times, active_mean)),
                float(max(active_times)),
                float(min(active_times)),
            ])
        else:
            feat.extend([0.0] * 4)

        # 75-78: idle stats are not reliably derivable from the current short
        # flow representation; keep them neutral rather than inventing values.
        feat.extend([0.0] * 4)

        if len(feat) != 78:
            raise ValueError(f"Expected 78 features, got {len(feat)}")
        return feat


feature_extractor = FeatureExtractor()
