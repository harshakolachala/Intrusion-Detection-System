from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class IncidentBase(BaseModel):
    title: str
    description: Optional[str] = None
    severity: str
    status: Optional[str] = "Open"
    alert_id: Optional[int] = None  # Fixed: Made optional
    assigned_user: Optional[str] = None

class IncidentCreate(IncidentBase):
    pass

class IncidentUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    severity: Optional[str] = None
    status: Optional[str] = None
    assigned_user: Optional[str] = None

class IncidentResponse(IncidentBase):
    id: int
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True