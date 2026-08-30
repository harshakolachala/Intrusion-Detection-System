"""Individual incident PDF report generation for FedSentry."""

from __future__ import annotations

from datetime import datetime, timezone
from html import escape
from io import BytesIO

from reportlab.lib import colors
from reportlab.lib.colors import HexColor
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import mm
from reportlab.platypus import Paragraph, SimpleDocTemplate, Spacer, Table, TableStyle

BRAND = HexColor("#F27C52")
INK = HexColor("#2F2C28")
MUTED = HexColor("#706A62")
PANEL = HexColor("#F7F3ED")
LINE = HexColor("#DED7CD")


def _get(obj: object, key: str, default: object = "—") -> object:
    return getattr(obj, key, default)


def _safe(value: object, limit: int = 900) -> str:
    if value is None or value == "":
        return "—"
    text = str(value)
    if len(text) > limit:
        text = text[: limit - 1] + "…"
    return escape(text)


def _date(value: object) -> str:
    if value is None:
        return "—"
    if isinstance(value, datetime):
        dt = value
    else:
        try:
            dt = datetime.fromisoformat(str(value).replace("Z", "+00:00"))
        except ValueError:
            return _safe(value)
    if dt.tzinfo is None:
        dt = dt.replace(tzinfo=timezone.utc)
    return dt.astimezone(timezone.utc).strftime("%d %b %Y, %H:%M UTC")


def _styles():
    base = getSampleStyleSheet()
    return {
        "eyebrow": ParagraphStyle(
            "IncidentEyebrow",
            parent=base["Normal"],
            fontName="Helvetica-Bold",
            fontSize=8,
            leading=10,
            textColor=BRAND,
            charSpace=1.2,
        ),
        "title": ParagraphStyle(
            "IncidentTitle",
            parent=base["Title"],
            fontName="Helvetica-Bold",
            fontSize=22,
            leading=27,
            textColor=INK,
        ),
        "heading": ParagraphStyle(
            "IncidentHeading",
            parent=base["Heading2"],
            fontName="Helvetica-Bold",
            fontSize=12,
            leading=15,
            textColor=INK,
            spaceBefore=5 * mm,
            spaceAfter=2.5 * mm,
        ),
        "body": ParagraphStyle(
            "IncidentBody",
            parent=base["BodyText"],
            fontName="Helvetica",
            fontSize=9,
            leading=13,
            textColor=MUTED,
        ),
        "label": ParagraphStyle(
            "IncidentLabel",
            parent=base["BodyText"],
            fontName="Helvetica-Bold",
            fontSize=7.5,
            leading=10,
            textColor=MUTED,
        ),
        "value": ParagraphStyle(
            "IncidentValue",
            parent=base["BodyText"],
            fontName="Helvetica-Bold",
            fontSize=9,
            leading=12,
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
    canvas.drawString(18 * mm, 9 * mm, "FedSentry · Incident Response Report")
    canvas.drawRightString(width - 18 * mm, 9 * mm, f"Page {doc.page}")
    canvas.restoreState()


def _detail_table(incident: object, styles) -> Table:
    fields = [
        ("Incident ID", _get(incident, "id")),
        ("Linked alert", _get(incident, "alert_id")),
        ("Severity", _get(incident, "severity")),
        ("Status", _get(incident, "status")),
        ("Assigned to", _get(incident, "assigned_to")),
        ("Created", _date(_get(incident, "created_at", None))),
        ("Updated", _date(_get(incident, "updated_at", None))),
        ("Closed", _date(_get(incident, "closed_at", None))),
    ]
    rows = []
    for index in range(0, len(fields), 2):
        pair = fields[index:index + 2]
        cells = []
        for label, value in pair:
            cells.append(
                Paragraph(
                    f"<font size='7'>{escape(label.upper())}</font><br/><b>{_safe(value, 120)}</b>",
                    styles["body"],
                )
            )
        rows.append(cells)
    table = Table(rows, colWidths=[84 * mm, 84 * mm], rowHeights=[20 * mm] * len(rows))
    table.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, -1), PANEL),
        ("BOX", (0, 0), (-1, -1), 0.6, LINE),
        ("INNERGRID", (0, 0), (-1, -1), 0.4, LINE),
        ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
        ("LEFTPADDING", (0, 0), (-1, -1), 10),
        ("RIGHTPADDING", (0, 0), (-1, -1), 10),
    ]))
    return table


def build_incident_pdf(incident: object) -> bytes:
    """Build a complete PDF report for one incident ORM object."""
    styles = _styles()
    output = BytesIO()
    doc = SimpleDocTemplate(
        output,
        pagesize=A4,
        rightMargin=18 * mm,
        leftMargin=18 * mm,
        topMargin=18 * mm,
        bottomMargin=20 * mm,
        title=f"FedSentry Incident {_get(incident, 'id')}",
        author="FedSentry",
    )

    alert = _get(incident, "alert", None)
    story = [
        Paragraph("FEDSENTRY · INCIDENT RESPONSE", styles["eyebrow"]),
        Spacer(1, 2 * mm),
        Paragraph(_safe(_get(incident, "title", "Security incident"), 220), styles["title"]),
        Paragraph(
            f"Generated {_date(datetime.now(timezone.utc))}",
            styles["body"],
        ),
        Spacer(1, 5 * mm),
        _detail_table(incident, styles),
        Paragraph("Incident description", styles["heading"]),
        Paragraph(_safe(_get(incident, "description")), styles["body"]),
        Paragraph("Resolution / containment", styles["heading"]),
        Paragraph(_safe(_get(incident, "resolution")), styles["body"]),
    ]

    if alert not in (None, "—"):
        confidence = _get(alert, "confidence", None)
        try:
            confidence_text = f"{float(confidence) * 100:.2f}%"
        except (TypeError, ValueError):
            confidence_text = _safe(confidence)

        alert_data = [
            ["Attack type", _get(alert, "attack_type")],
            ["Source", f"{_get(alert, 'source_ip')}:{_get(alert, 'source_port')}"],
            ["Destination", f"{_get(alert, 'destination_ip')}:{_get(alert, 'destination_port')}"],
            ["Protocol", _get(alert, "protocol")],
            ["Confidence", confidence_text],
            ["Risk score", _get(alert, "risk_score")],
            ["MITRE ATT&CK", _get(alert, "mitre_attack")],
        ]
        story.append(Paragraph("Linked detection evidence", styles["heading"]))
        evidence_rows = [
            [Paragraph(f"<b>{escape(str(label))}</b>", styles["label"]), Paragraph(_safe(value, 160), styles["value"])]
            for label, value in alert_data
        ]
        evidence = Table(evidence_rows, colWidths=[42 * mm, 126 * mm])
        evidence.setStyle(TableStyle([
            ("ROWBACKGROUNDS", (0, 0), (-1, -1), [colors.white, PANEL]),
            ("GRID", (0, 0), (-1, -1), 0.4, LINE),
            ("VALIGN", (0, 0), (-1, -1), "TOP"),
            ("LEFTPADDING", (0, 0), (-1, -1), 7),
            ("RIGHTPADDING", (0, 0), (-1, -1), 7),
            ("TOPPADDING", (0, 0), (-1, -1), 6),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 6),
        ]))
        story.append(evidence)

        llm_summary = _get(alert, "llm_summary", None)
        if llm_summary:
            story.append(Paragraph("AI analyst summary", styles["heading"]))
            story.append(Paragraph(_safe(llm_summary), styles["body"]))

    story.extend([
        Paragraph("Analyst verification", styles["heading"]),
        Paragraph(
            "This report is generated from the current FedSentry incident registry. Analysts should validate network evidence and containment actions before final closure.",
            styles["body"],
        ),
    ])

    doc.build(story, onFirstPage=_footer, onLaterPages=_footer)
    return output.getvalue()
