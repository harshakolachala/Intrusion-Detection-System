"""VirusTotal IP reputation client."""

import ipaddress
import os
from typing import Any

import httpx


VT_URL = "https://www.virustotal.com/api/v3/ip_addresses/{ip}"


async def check_ip(ip: str, timeout: float = 8.0) -> dict[str, Any]:
    try:
        value = ipaddress.ip_address(ip)
        if value.is_private or value.is_loopback or value.is_reserved:
            return {"provider": "virustotal", "available": False, "ip": ip, "reason": "non_public_ip"}
    except ValueError:
        return {"provider": "virustotal", "available": False, "ip": ip, "reason": "invalid_ip"}

    api_key = os.getenv("VIRUSTOTAL_API_KEY")
    if not api_key:
        return {"provider": "virustotal", "available": False, "ip": ip, "reason": "api_key_not_configured"}

    try:
        async with httpx.AsyncClient(timeout=timeout) as client:
            response = await client.get(VT_URL.format(ip=ip), headers={"x-apikey": api_key})
            response.raise_for_status()
        attrs = response.json().get("data", {}).get("attributes", {})
        stats = attrs.get("last_analysis_stats", {})
        return {
            "provider": "virustotal",
            "available": True,
            "ip": ip,
            "malicious": int(stats.get("malicious", 0) or 0),
            "suspicious": int(stats.get("suspicious", 0) or 0),
            "harmless": int(stats.get("harmless", 0) or 0),
            "undetected": int(stats.get("undetected", 0) or 0),
            "country": attrs.get("country"),
            "as_owner": attrs.get("as_owner"),
            "reputation": attrs.get("reputation", 0),
        }
    except (httpx.HTTPError, ValueError) as exc:
        return {"provider": "virustotal", "available": False, "ip": ip, "reason": "request_failed", "error": str(exc)}
