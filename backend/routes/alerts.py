from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List
from database import get_db
import models
from pydantic import BaseModel
from datetime import datetime

router = APIRouter(prefix="/alerts", tags=["alerts"])

class AlertResponse(BaseModel):
    id: int
    attack_type: str
    confidence: float
    source_ip: str
    timestamp: datetime

    class Config:
        from_attributes = True

@router.get("/", response_model=List[AlertResponse])
def get_recent_alerts(db: Session = Depends(get_db)):
    """Fetch the 10 most recent alerts for the dashboard."""
    return db.query(models.Alert).order_by(models.Alert.timestamp.desc()).limit(10).all()

@router.get("/history", response_model=List[AlertResponse])
def get_alert_history(db: Session = Depends(get_db)):
    """Fetch all historical alerts for the history page."""
    return db.query(models.Alert).order_by(models.Alert.timestamp.desc()).all()
