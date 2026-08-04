"""
Prediction model.

Stores every prediction made by the IDS model.
"""

import uuid
from datetime import datetime, timezone

from sqlalchemy import DateTime, Float, ForeignKey, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from database.base import Base


class Prediction(Base):
    __tablename__ = "predictions"

    id: Mapped[str] = mapped_column(
        String(36),
        primary_key=True,
        default=lambda: str(uuid.uuid4()),
    )

    model_version: Mapped[str] = mapped_column(
        String(50),
        nullable=False,
    )

    source_ip: Mapped[str] = mapped_column(
        String(50),
        nullable=False,
        index=True,
    )

    destination_ip: Mapped[str] = mapped_column(
        String(50),
        nullable=False,
        index=True,
    )

    predicted_class: Mapped[str] = mapped_column(
        String(100),
        nullable=False,
    )

    confidence: Mapped[float] = mapped_column(
        Float,
        nullable=False,
    )

    latency_ms: Mapped[float] = mapped_column(
        Float,
        nullable=False,
    )

    alert_id: Mapped[str | None] = mapped_column(
        String(36),
        ForeignKey("alerts.id"),
        nullable=True,
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
    )

    # Relationships

    alert = relationship(
        "Alert",
        back_populates="predictions",
    )
