"""AbuseIPDB client used for IP reputation enrichment."""

import ipaddress
import os
from typing import Any

import httpx


ABUSEIPDB_URL = "https://api.abuseipdb.com/api/v2/check"


def _is_public_ip(ip: str) -> bool:
    try:
        value = ipaddress.ip_address(ip)
        return not (value.is_private or value.is_loopback or value.is_reserved or value.is_multicast)
    except ValueError:
        return False


async def check_ip(ip: str, timeout: float = 8.0) -> dict[str, Any]:
    """Return normalized AbuseIPDB reputation data.

    Missing API keys or private/invalid IPs are handled gracefully so threat
    enrichment never interrupts the IDS prediction pipeline.
    """
    if not _is_public_ip(ip):
        return {"provider": "abuseipdb", "available": False, "ip": ip, "reason": "non_public_or_invalid_ip"}

    api_key = os.getenv("ABUSEIPDB_API_KEY")
    if not api_key:
        return {"provider": "abuseipdb", "available": False, "ip": ip, "reason": "api_key_not_configured"}

    headers = {"Key": api_key, "Accept": "application/json"}
    params = {"ipAddress": ip, "maxAgeInDays": 90, "verbose": ""}

    try:
        async with httpx.AsyncClient(timeout=timeout) as client:
            response = await client.get(ABUSEIPDB_URL, headers=headers, params=params)
            response.raise_for_status()
        data = response.json().get("data", {})
        return {
            "provider": "abuseipdb",
            "available": True,
            "ip": ip,
            "abuse_confidence_score": int(data.get("abuseConfidenceScore", 0) or 0),
            "country_code": data.get("countryCode"),
            "usage_type": data.get("usageType"),
            "isp": data.get("isp"),
            "domain": data.get("domain"),
            "total_reports": int(data.get("totalReports", 0) or 0),
            "last_reported_at": data.get("lastReportedAt"),
            "is_whitelisted": data.get("isWhitelisted"),
        }
    except (httpx.HTTPError, ValueError) as exc:
        return {"provider": "abuseipdb", "available": False, "ip": ip, "reason": "request_failed", "error": str(exc)}
