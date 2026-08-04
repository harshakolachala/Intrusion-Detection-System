"""
Analytics Routes.
"""

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from database.session import get_db

from schemas.analytics import AnalyticsResponse
from services.analytics_service import AnalyticsService

router = APIRouter(
    prefix="/analytics",
    tags=["Analytics"],
)


@router.get(
    "/dashboard",
    response_model=AnalyticsResponse,
)
def get_dashboard(
    db: Session = Depends(get_db),
):
    """
    Returns complete dashboard analytics.
    """

    return AnalyticsService.get_dashboard(db)


@router.get("/summary")
def get_summary(
    db: Session = Depends(get_db),
):

    return AnalyticsService.dashboard_summary(db)


@router.get("/attack-distribution")
def get_attack_distribution(
    db: Session = Depends(get_db),
):

    return AnalyticsService.attack_distribution(db)


@router.get("/severity-distribution")
def get_severity_distribution(
    db: Session = Depends(get_db),
):

    return AnalyticsService.severity_distribution(db)


@router.get("/confidence")
def get_confidence_statistics(
    db: Session = Depends(get_db),
):

    return AnalyticsService.confidence_statistics(db)