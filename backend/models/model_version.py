"""
Model Version model.

Stores metadata for every trained global federated model.
"""

import uuid
from datetime import datetime, timezone

from sqlalchemy import DateTime, Float, Integer, String
from sqlalchemy.orm import Mapped, mapped_column

from database.base import Base


class ModelVersion(Base):
    __tablename__ = "model_versions"

    id: Mapped[str] = mapped_column(
        String(36),
        primary_key=True,
        default=lambda: str(uuid.uuid4()),
    )

    version: Mapped[str] = mapped_column(
        String(50),
        unique=True,
        nullable=False,
    )

    flower_round: Mapped[int] = mapped_column(
        Integer,
        nullable=False,
    )

    accuracy: Mapped[float] = mapped_column(
        Float,
        nullable=False,
    )

    precision: Mapped[float] = mapped_column(
        Float,
        nullable=False,
    )

    recall: Mapped[float] = mapped_column(
        Float,
        nullable=False,
    )

    f1_score: Mapped[float] = mapped_column(
        Float,
        nullable=False,
    )

    auc_score: Mapped[float | None] = mapped_column(
        Float,
        nullable=True,
    )

    model_path: Mapped[str] = mapped_column(
        String(255),
        nullable=False,
    )

    training_dataset: Mapped[str | None] = mapped_column(
        String(255),
        nullable=True,
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
    )
