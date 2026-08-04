"""
Audit Schemas.
"""

from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, ConfigDict


class AuditResponse(BaseModel):

    model_config = ConfigDict(from_attributes=True)

    id: UUID

    user_id: UUID | None

    action: str

    resource: str

    ip_address: str | None

    user_agent: str | None

    status: str

    details: str | None

    created_at: datetime


class AuditStatistics(BaseModel):

    total: int

    success: int

    failed: int