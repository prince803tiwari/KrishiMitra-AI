import datetime
from sqlalchemy import Column, Integer, String, Float, Text, Boolean, DateTime
from app.database import Base

class CropScan(Base):
    __tablename__ = "crop_scans"

    id = Column(Integer, primary_key=True, index=True)
    session_id = Column(String(50), default="default_farmer", index=True)
    image_name = Column(String(255))
    crop_type = Column(String(100))
    disease_name = Column(String(200))
    severity = Column(String(50))
    treatment = Column(Text)
    prevention = Column(Text)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

class WeatherLog(Base):
    __tablename__ = "weather_logs"

    id = Column(Integer, primary_key=True, index=True)
    session_id = Column(String(50), default="default_farmer", index=True)
    location = Column(String(150))
    temperature = Column(Float)
    rain_probability = Column(Float)
    conditions = Column(String(100))
    recommendations = Column(Text)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

class SchemeLog(Base):
    __tablename__ = "scheme_logs"

    id = Column(Integer, primary_key=True, index=True)
    session_id = Column(String(50), default="default_farmer", index=True)
    scheme_name = Column(String(200))
    eligible = Column(Boolean)
    notes = Column(Text)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

class ChatMessage(Base):
    __tablename__ = "chat_messages"

    id = Column(Integer, primary_key=True, index=True)
    session_id = Column(String(50), default="default_farmer", index=True)
    sender = Column(String(50))  # 'user' or 'advisor' or 'emergency'
    message = Column(Text)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

class AgentActivity(Base):
    __tablename__ = "agent_activities"

    id = Column(Integer, primary_key=True, index=True)
    session_id = Column(String(50), default="default_farmer", index=True)
    agent_name = Column(String(100))
    collaboration_flow = Column(String(255))
    action_taken = Column(String(255))
    details = Column(Text)
    latency_ms = Column(Integer)
    status = Column(String(50))  # 'SUCCESS', 'WARNING', 'ERROR'
    timestamp = Column(DateTime, default=datetime.datetime.utcnow)
