"""
Database connection configuration.

Creates the SQLAlchemy engine using the connection string
stored in the .env file. Falls back to SQLite if no URL is set.
"""

import os

from dotenv import load_dotenv
from sqlalchemy import create_engine

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL") or "sqlite:///./ids_database.db"

is_postgres = DATABASE_URL.startswith("postgresql")

engine_kwargs = {
    "pool_pre_ping": True,
    "echo": False,
}

if is_postgres:
    engine_kwargs["pool_size"] = 10
    engine_kwargs["max_overflow"] = 20

engine = create_engine(DATABASE_URL, **engine_kwargs)
