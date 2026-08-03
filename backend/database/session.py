"""
Database session management.

Provides SessionLocal and FastAPI dependency injection.
"""

from sqlalchemy.orm import sessionmaker

from database.connection import engine

SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine,
)


def get_db():
    """
    FastAPI dependency.

    Usage:

    db: Session = Depends(get_db)
    """

    db = SessionLocal()

    try:
        yield db

    finally:
        db.close()