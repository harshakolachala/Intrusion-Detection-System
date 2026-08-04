"""
Audit Service.

Enterprise audit logging service.
"""

from sqlalchemy import desc
from sqlalchemy.orm import Session

from models.audit import Audit


class AuditService:

    @staticmethod
    def log(
        db: Session,
        action: str,
        resource: str,
        user_id=None,
        ip_address: str | None = None,
        user_agent: str | None = None,
        status: str = "SUCCESS",
        details: str | None = None,
    ) -> Audit:

        audit = Audit(
            user_id=user_id,
            action=action,
            resource=resource,
            ip_address=ip_address,
            user_agent=user_agent,
            status=status,
            details=details,
        )

        db.add(audit)
        db.commit()
        db.refresh(audit)

        return audit

    @staticmethod
    def get_all(
        db: Session,
        skip: int = 0,
        limit: int = 100,
    ):

        return (
            db.query(Audit)
            .order_by(desc(Audit.created_at))
            .offset(skip)
            .limit(limit)
            .all()
        )

    @staticmethod
    def get_by_id(
        db: Session,
        audit_id,
    ):

        return (
            db.query(Audit)
            .filter(Audit.id == audit_id)
            .first()
        )

    @staticmethod
    def get_by_user(
        db: Session,
        user_id,
    ):

        return (
            db.query(Audit)
            .filter(Audit.user_id == user_id)
            .order_by(desc(Audit.created_at))
            .all()
        )

    @staticmethod
    def get_by_action(
        db: Session,
        action: str,
    ):

        return (
            db.query(Audit)
            .filter(Audit.action == action)
            .order_by(desc(Audit.created_at))
            .all()
        )

    @staticmethod
    def statistics(
        db: Session,
    ):

        total = db.query(Audit).count()

        success = (
            db.query(Audit)
            .filter(Audit.status == "SUCCESS")
            .count()
        )

        failed = (
            db.query(Audit)
            .filter(Audit.status == "FAILED")
            .count()
        )

        return {
            "total": total,
            "success": success,
            "failed": failed,
        }