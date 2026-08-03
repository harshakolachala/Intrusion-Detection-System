"""
Base class for all SQLAlchemy ORM models.

Every database model (User, Alert, Prediction, Chat, etc.)
will inherit from this Base.
"""

from sqlalchemy.orm import DeclarativeBase


class Base(DeclarativeBase):
    pass