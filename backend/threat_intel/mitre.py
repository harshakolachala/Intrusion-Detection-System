"""MITRE ATT&CK mapping for CICIDS2017 attack classes."""

from typing import Any


ATTACK_TO_MITRE: dict[str, list[dict[str, str]]] = {
    "PortScan": [{"technique_id": "T1046", "technique": "Network Service Discovery", "tactic": "Discovery"}],
    "Bot": [{"technique_id": "T1071", "technique": "Application Layer Protocol", "tactic": "Command and Control"}],
    "DDoS": [{"technique_id": "T1498", "technique": "Network Denial of Service", "tactic": "Impact"}],
    "DoS Hulk": [{"technique_id": "T1499", "technique": "Endpoint Denial of Service", "tactic": "Impact"}],
    "DoS GoldenEye": [{"technique_id": "T1499", "technique": "Endpoint Denial of Service", "tactic": "Impact"}],
    "DoS Slowhttptest": [{"technique_id": "T1499", "technique": "Endpoint Denial of Service", "tactic": "Impact"}],
    "DoS slowloris": [{"technique_id": "T1499", "technique": "Endpoint Denial of Service", "tactic": "Impact"}],
    "FTP-Patator": [{"technique_id": "T1110", "technique": "Brute Force", "tactic": "Credential Access"}],
    "SSH-Patator": [{"technique_id": "T1110", "technique": "Brute Force", "tactic": "Credential Access"}],
    "Heartbleed": [{"technique_id": "T1190", "technique": "Exploit Public-Facing Application", "tactic": "Initial Access"}],
    "Infiltration": [{"technique_id": "T1071", "technique": "Application Layer Protocol", "tactic": "Command and Control"}],
    "Web Attack_Brute Force": [{"technique_id": "T1110", "technique": "Brute Force", "tactic": "Credential Access"}],
    "Web Attack_Sql Injection": [{"technique_id": "T1190", "technique": "Exploit Public-Facing Application", "tactic": "Initial Access"}],
    "Web Attack_XSS": [{"technique_id": "T1189", "technique": "Drive-by Compromise", "tactic": "Initial Access"}],
}


def map_attack(attack_type: str) -> dict[str, Any]:
    """Map a model class to MITRE ATT&CK techniques."""
    normalized = (attack_type or "").strip()
    if normalized.upper() == "BENIGN":
        return {"attack_type": normalized, "mapped": False, "techniques": []}
    techniques = ATTACK_TO_MITRE.get(normalized, [])
    return {"attack_type": normalized, "mapped": bool(techniques), "techniques": techniques}
