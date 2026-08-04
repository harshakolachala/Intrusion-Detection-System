"""
Incident Schemas.
"""

from datetime import datetime
from typing import Optional
from uuid import UUID

from pydantic import BaseModel


class IncidentCreate(BaseModel):
    alert_id: UUID
    title: str
    description: Optional[str] = None
    assigned_to: Optional[UUID] = None
    severity: str = "Medium"


class IncidentUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    assigned_to: Optional[UUID] = None
    severity: Optional[str] = None
    status: Optional[str] = None
    resolution: Optional[str] = None


class IncidentResponse(BaseModel):
    id: UUID
    alert_id: UUID
    assigned_to: Optional[UUID]
    title: str
    description: Optional[str]
    severity: str
    status: str
    resolution: Optional[str]
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True