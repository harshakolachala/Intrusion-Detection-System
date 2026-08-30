"""Professional PDF security summary generation for FedSentry."""

from __future__ import annotations

from datetime import datetime, timezone
from html import escape
from io import BytesIO
from typing import Iterable, Mapping

from reportlab.lib import colors
from reportlab.lib.colors import HexColor
from reportlab.lib.enums import TA_LEFT
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import mm
from reportlab.platypus import (
    Paragraph,
    SimpleDocTemplate,
    Spacer,
    Table,
    TableStyle,
)

BRAND = HexColor("#F27C52")
INK = HexColor("#2F2C28")
MUTED = HexColor("#706A62")
PANEL = HexColor("#F7F3ED")
LINE = HexColor("#DED7CD")
SUCCESS = HexColor("#4DA861")
DANGER = HexColor("#CF5F57")
WARNING = HexColor("#D89A39")


def _value(record: object, key: str, default: object = "—") -> object:
    if isinstance(record, Mapping):
        return record.get(key, default)
    return getattr(record, key, default)


def _text(value: object, limit: int = 140) -> str:
    if value is None or value == "":
        return "—"
    rendered = str(value)
    if len(rendered) > limit:
        rendered = rendered[: limit - 1] + "…"
    return escape(rendered)


def _date(value: object) -> str:
    if value is None:
        return "—"
    if isinstance(value, datetime):
        dt = value
    else:
        try:
            dt = datetime.fromisoformat(str(value).replace("Z", "+00:00"))
        except ValueError:
            return _text(value)
    if dt.tzinfo is None:
        dt = dt.replace(tzinfo=timezone.utc)
    return dt.astimezone(timezone.utc).strftime("%d %b %Y, %H:%M UTC")


def _styles():
    base = getSampleStyleSheet()
    return {
        "title": ParagraphStyle(
            "FedSentryTitle",
            parent=base["Title"],
            fontName="Helvetica-Bold",
            fontSize=24,
            leading=29,
            textColor=INK,
            alignment=TA_LEFT,
            spaceAfter=5 * mm,
        ),
        "eyebrow": ParagraphStyle(
            "FedSentryEyebrow",
            parent=base["Normal"],
            fontName="Helvetica-Bold",
            fontSize=8,
            leading=10,
            textColor=BRAND,
            charSpace=1.2,
            spaceAfter=2 * mm,
        ),
        "heading": ParagraphStyle(
            "FedSentryHeading",
            parent=base["Heading2"],
            fontName="Helvetica-Bold",
            fontSize=13,
            leading=16,
            textColor=INK,
            spaceBefore=5 * mm,
            spaceAfter=3 * mm,
        ),
        "body": ParagraphStyle(
            "FedSentryBody",
            parent=base["BodyText"],
            fontName="Helvetica",
            fontSize=9,
            leading=13,
            textColor=MUTED,
        ),
        "cell": ParagraphStyle(
            "FedSentryCell",
            parent=base["BodyText"],
            fontName="Helvetica",
            fontSize=7.5,
            leading=10,
            textColor=INK,
        ),
        "cell_bold": ParagraphStyle(
            "FedSentryCellBold",
            parent=base["BodyText"],
            fontName="Helvetica-Bold",
            fontSize=7.5,
            leading=10,
            textColor=INK,
        ),
    }


def _footer(canvas, doc) -> None:
    canvas.saveState()
    width, _ = A4
    canvas.setStrokeColor(LINE)
    canvas.line(18 * mm, 14 * mm, width - 18 * mm, 14 * mm)
    canvas.setFillColor(MUTED)
    canvas.setFont("Helvetica", 7)
    canvas.drawString(18 * mm, 9 * mm, "FedSentry · Security Operations Report")
    canvas.drawRightString(width - 18 * mm, 9 * mm, f"Page {doc.page}")
    canvas.restoreState()


def _metric_table(summary: Mapping[str, object], styles) -> Table:
    items = [
        ("Analyzed traffic", summary.get("total_predictions", 0)),
        ("Malicious", summary.get("malicious_predictions", 0)),
        ("Benign", summary.get("benign_predictions", 0)),
        ("Avg confidence", f"{float(summary.get('average_confidence', 0) or 0) * 100:.2f}%"),
        ("Alerts", summary.get("total_alerts", 0)),
        ("Open incidents", summary.get("open_incidents", 0)),
    ]
    rows = []
    for index in range(0, len(items), 3):
        chunk = items[index:index + 3]
        rows.append([
            Paragraph(f"<b>{_text(label)}</b><br/><font size='15'>{_text(value)}</font>", styles["body"])
            for label, value in chunk
        ])
    table = Table(rows, colWidths=[56 * mm, 56 * mm, 56 * mm], rowHeights=[25 * mm] * len(rows))
    table.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, -1), PANEL),
        ("BOX", (0, 0), (-1, -1), 0.6, LINE),
        ("INNERGRID", (0, 0), (-1, -1), 0.4, LINE),
        ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
        ("LEFTPADDING", (0, 0), (-1, -1), 10),
        ("RIGHTPADDING", (0, 0), (-1, -1), 10),
    ]))
    return table


def _records_table(records: Iterable[object], columns: list[tuple[str, str]], styles, widths: list[float]) -> Table:
    header = [Paragraph(f"<b>{escape(label)}</b>", styles["cell_bold"]) for label, _ in columns]
    data = [header]
    for record in records:
        row = []
        for _, key in columns:
            value = _value(record, key)
            if key.endswith("_at"):
                value = _date(value)
            elif key == "confidence":
                try:
                    value = f"{float(value) * 100:.1f}%"
                except (TypeError, ValueError):
                    pass
            row.append(Paragraph(_text(value, 70), styles["cell"]))
        data.append(row)
    if len(data) == 1:
        data.append([Paragraph("No records available", styles["cell"]) for _ in columns])

    table = Table(data, colWidths=widths, repeatRows=1)
    table.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, 0), INK),
        ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
        ("ROWBACKGROUNDS", (0, 1), (-1, -1), [colors.white, PANEL]),
        ("GRID", (0, 0), (-1, -1), 0.35, LINE),
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
        ("LEFTPADDING", (0, 0), (-1, -1), 5),
        ("RIGHTPADDING", (0, 0), (-1, -1), 5),
        ("TOPPADDING", (0, 0), (-1, -1), 5),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 5),
    ]))
    return table


def build_security_summary_pdf(
    summary: Mapping[str, object],
    recent_alerts: Iterable[object],
    recent_incidents: Iterable[object],
) -> bytes:
    """Build a downloadable executive/SOC security summary PDF."""
    styles = _styles()
    output = BytesIO()
    doc = SimpleDocTemplate(
        output,
        pagesize=A4,
        rightMargin=18 * mm,
        leftMargin=18 * mm,
        topMargin=18 * mm,
        bottomMargin=20 * mm,
        title="FedSentry Security Summary",
        author="FedSentry",
    )

    story = [
        Paragraph("FEDSENTRY · SECURITY INTELLIGENCE", styles["eyebrow"]),
        Paragraph("Security Operations Summary", styles["title"]),
        Paragraph(
            f"Generated {_date(datetime.now(timezone.utc))}. This report summarizes the current IDS prediction, alert, and incident posture.",
            styles["body"],
        ),
        Spacer(1, 5 * mm),
        _metric_table(summary, styles),
        Paragraph("Recent security alerts", styles["heading"]),
        _records_table(
            list(recent_alerts),
            [
                ("Created", "created_at"),
                ("Attack", "attack_type"),
                ("Severity", "severity"),
                ("Source", "source_ip"),
                ("Destination", "destination_ip"),
                ("Confidence", "confidence"),
            ],
            styles,
            [27 * mm, 31 * mm, 20 * mm, 30 * mm, 30 * mm, 25 * mm],
        ),
        Paragraph("Recent incident registry", styles["heading"]),
        _records_table(
            list(recent_incidents),
            [
                ("Created", "created_at"),
                ("Title", "title"),
                ("Severity", "severity"),
                ("Status", "status"),
                ("Assigned", "assigned_to"),
            ],
            styles,
            [30 * mm, 58 * mm, 24 * mm, 25 * mm, 31 * mm],
        ),
        Paragraph("Analyst note", styles["heading"]),
        Paragraph(
            "Use this summary together with the live FedSentry dashboard, packet engine status, and incident evidence when making containment or escalation decisions.",
            styles["body"],
        ),
    ]

    doc.build(story, onFirstPage=_footer, onLaterPages=_footer)
    return output.getvalue()
