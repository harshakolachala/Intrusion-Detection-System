"""
Database initialization.

Creates all database tables.
"""

from database.connection import engine
from database.base import Base
from models.user import User
from models.user_profile import UserProfile
from models.alert import Alert
from models.audit import Audit
from models.chat import Chat
from models.incident import Incident
from models.prediction import Prediction
from models.model_version import ModelVersion


def init_database():
    Base.metadata.create_all(bind=engine)


if __name__ == "__main__":
    init_database()
    print("Database initialized successfully.")
