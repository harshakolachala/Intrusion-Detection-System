"""
Audit Routes.
"""

from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from database.session import get_db
from services.audit_service import AuditService

router = APIRouter(
    prefix="/audit",
    tags=["Audit"],
)


@router.get("/")
def get_all_audit_logs(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
):

    return AuditService.get_all(
        db=db,
        skip=skip,
        limit=limit,
    )


@router.get("/statistics")
def get_statistics(
    db: Session = Depends(get_db),
):

    return AuditService.statistics(db)


@router.get("/{audit_id}")
def get_audit(
    audit_id: UUID,
    db: Session = Depends(get_db),
):

    audit = AuditService.get_by_id(
        db,
        audit_id,
    )

    if audit is None:

        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Audit log not found.",
        )

    return audit