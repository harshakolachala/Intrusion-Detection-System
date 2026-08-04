"""
Analytics Routes.
"""

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from database.session import get_db
from services.analytics_service import AnalyticsService

router = APIRouter(
    prefix="/analytics",
    tags=["Analytics"],
)


@router.get("/dashboard")
def dashboard(
    db: Session = Depends(get_db),
):

    return AnalyticsService.dashboard(db)


@router.get("/attack-distribution")
def attack_distribution(
    db: Session = Depends(get_db),
):

    return AnalyticsService.attack_distribution(db)


@router.get("/severity-distribution")
def severity_distribution(
    db: Session = Depends(get_db),
):

    return AnalyticsService.severity_distribution(db)


@router.get("/top-source-ips")
def top_source_ips(
    db: Session = Depends(get_db),
):

    return AnalyticsService.top_source_ips(db)