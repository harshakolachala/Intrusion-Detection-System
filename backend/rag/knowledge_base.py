"""
Temporary local knowledge base for attack explanations.

This exists ONLY so /chatbot/explain works end-to-end before Hasini's real
ChromaDB + sentence-transformers retriever (backend/rag/retriever.py) is merged.

Once her retriever.py lands, context_provider.py will import it automatically
and this file becomes an offline fallback only (no code changes needed here).

Each entry is a short, factual write-up in the same spirit as MITRE ATT&CK /
NIST / OWASP references, condensed to a couple of sentences per "chunk" so it
behaves like retrieved passages would.
"""

from typing import List

# Keys are matched case-insensitively and with underscores/spaces normalized,
# so "DDoS", "ddos", "DoS_Hulk" and "DoS Hulk" all resolve correctly.
KNOWLEDGE_BASE = {
    "benign": [
        "Benign traffic shows normal, expected flow characteristics: balanced "
        "packet sizes, typical inter-arrival times, and no repeated connection "
        "attempts to unusual ports.",
    ],
    "ddos": [
        "Distributed Denial of Service (DDoS) attacks flood a target with "
        "traffic from many sources simultaneously, aiming to exhaust "
        "bandwidth or connection resources (MITRE ATT&CK T1498).",
        "Typical DDoS flow features include an abnormally high packet rate, "
        "very short inter-arrival times, and low payload-size variance "
        "compared to legitimate traffic.",
    ],
    "dos hulk": [
        "DoS Hulk generates HTTP GET/POST floods with randomized headers and "
        "URLs to bypass simple signature-based detection while overwhelming "
        "a web server's request-handling capacity.",
    ],
    "dos goldeneye": [
        "DoS GoldenEye is an HTTP-layer denial-of-service tool that opens many "
        "concurrent keep-alive connections, exhausting the server's available "
        "worker threads/connections.",
    ],
    "dos slowloris": [
        "Slowloris keeps many connections to a target open by sending "
        "partial HTTP requests very slowly, consuming the server's "
        "connection pool without needing high bandwidth.",
    ],
    "dos slowhttptest": [
        "Slowhttptest-style attacks send incomplete HTTP requests or slow "
        "POST bodies, tying up server threads for long periods with minimal "
        "attacker bandwidth (related to CWE-400, resource exhaustion).",
    ],
    "portscan": [
        "Port scanning (MITRE ATT&CK T1046, Network Service Discovery) probes "
        "many ports on a host in sequence to discover open services, "
        "producing many short-lived connections with little or no payload.",
    ],
    "ftp-patator": [
        "FTP-Patator performs brute-force credential guessing against an FTP "
        "server, characterized by many repeated authentication attempts from "
        "the same source in a short window (MITRE ATT&CK T1110, Brute Force).",
    ],
    "ssh-patator": [
        "SSH-Patator brute-forces SSH login credentials, producing many "
        "short-duration connections with failed-authentication patterns "
        "from a single source IP (MITRE ATT&CK T1110).",
    ],
    "web attack - brute force": [
        "Web application brute-force attacks repeatedly submit login "
        "credentials to a web form, visible as many similar POST requests "
        "to an authentication endpoint in a short time span.",
    ],
    "web attack - xss": [
        "Cross-Site Scripting (XSS, OWASP A03:2021) injects malicious "
        "scripts into web pages viewed by other users, often visible as "
        "requests containing script-like payloads in query parameters.",
    ],
    "web attack - sql injection": [
        "SQL Injection (OWASP A03:2021) inserts malicious SQL through input "
        "fields to manipulate backend queries, often visible as requests "
        "with SQL keywords or special characters in parameters.",
    ],
    "infiltration": [
        "Infiltration attacks involve an attacker gaining an initial foothold "
        "(e.g. via a malicious file) and then conducting internal "
        "reconnaissance, often showing unusual internal-to-internal traffic.",
    ],
    "bot": [
        "Botnet traffic shows periodic beaconing to a command-and-control "
        "server: regular, low-volume connections at consistent intervals "
        "(MITRE ATT&CK T1071, Application Layer Protocol).",
    ],
    "heartbleed": [
        "Heartbleed (CVE-2014-0160) exploits a buffer over-read in OpenSSL's "
        "heartbeat extension, letting an attacker read server memory; "
        "network traces show malformed/oversized heartbeat requests.",
    ],
}

_DEFAULT_SNIPPET = (
    "No curated reference write-up is available yet for this attack class; "
    "the explanation below is based on the model's confidence and the "
    "contributing flow features only."
)


def _normalize(label: str) -> str:
    return label.strip().lower().replace("_", " ").replace("-", " - ").strip()


def get_local_context(attack_type: str, top_k: int = 3) -> List[str]:
    """Return up to top_k reference snippets for an attack type.

    This mimics the return shape expected from Hasini's real retriever
    (a list of short text chunks) so it's a drop-in fallback.
    """
    key = _normalize(attack_type)
    for k, snippets in KNOWLEDGE_BASE.items():
        if _normalize(k) == key:
            return snippets[:top_k]
    return [_DEFAULT_SNIPPET]
