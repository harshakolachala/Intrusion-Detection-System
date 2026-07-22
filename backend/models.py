from sqlalchemy import Column, Integer, String, Float, DateTime
from database import Base
import datetime

class Alert(Base):
    __tablename__ = "alerts"

    id = Column(Integer, primary_key=True, index=True)
    attack_type = Column(String, index=True)
    confidence = Column(Float)
    source_ip = Column(String)
    timestamp = Column(DateTime, default=datetime.datetime.utcnow)

# Create the tables in the database
from database import engine
Base.metadata.create_all(bind=engine)
