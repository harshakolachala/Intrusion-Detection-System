"""CSV export helpers for alerts, predictions, and incidents."""

import csv
import io
from collections.abc import Iterable


def export_records(records: Iterable[object], fields: list[str]) -> str:
    output = io.StringIO()
    writer = csv.DictWriter(output, fieldnames=fields, extrasaction="ignore")
    writer.writeheader()
    for record in records:
        if isinstance(record, dict):
            row = record
        else:
            row = {field: getattr(record, field, None) for field in fields}
        writer.writerow({key: "" if value is None else value for key, value in row.items()})
    return output.getvalue()


def export_alerts(records: Iterable[object]) -> str:
    return export_records(records, ["id", "source_ip", "destination_ip", "source_port", "destination_port", "protocol", "attack_type", "confidence", "severity", "risk_score", "status", "created_at"])


def export_incidents(records: Iterable[object]) -> str:
    return export_records(records, ["id", "alert_id", "title", "description", "severity", "status", "assigned_to", "resolution", "created_at", "updated_at", "closed_at"])
