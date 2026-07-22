from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from database import get_db
import models

router = APIRouter(prefix="/analytics", tags=["analytics"])

@router.get("/stats")
def get_attack_stats(db: Session = Depends(get_db)):
    """Returns the count of each attack type for the dashboard charts."""
    stats = db.query(
        models.Alert.attack_type, 
        func.count(models.Alert.id).label("count")
    ).group_by(models.Alert.attack_type).all()
    
    # Format as a simple dictionary: {"DDoS": 10, "Benign": 50, ...}
    return {item.attack_type: item.count for item in stats}
# Analytics and system integration logic
