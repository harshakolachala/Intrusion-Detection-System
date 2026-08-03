"""
Database initialization.

Creates all database tables.
"""

from database.connection import engine
from database.base import Base

# Import all models here
from models.user import User
from models.alert import Alert


def init_database():
    Base.metadata.create_all(bind=engine)


if __name__ == "__main__":
    init_database()
    print("Database initialized successfully.")