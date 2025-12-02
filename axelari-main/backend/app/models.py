from sqlalchemy import Column, Integer, String, Boolean, ForeignKey, DateTime, Float
from sqlalchemy.orm import relationship
from sqlalchemy.dialects.postgresql import UUID
import uuid
from datetime import datetime
from app.core.db import Base

class Student(Base):
    __tablename__ = "students"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    email = Column(String, unique=True, index=True)
    name = Column(String)
    grade = Column(Integer, default=8)
    board = Column(String, default='CBSE')
    user_id = Column(Integer, unique=True, index=True) # Links to Phase 1 users table
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    profile = relationship("StudentProfile", back_populates="student", uselist=False)

class StudentProfile(Base):
    __tablename__ = "student_profiles"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    student_id = Column(UUID(as_uuid=True), ForeignKey("students.id"))
    processing_speed = Column(Float, default=50.0)
    accuracy_consistency = Column(Float, default=50.0)
    memory_retention = Column(Float, default=50.0)
    learning_style = Column(String, default='visual')
    confidence_score = Column(Float, default=0.3)
    total_interactions = Column(Integer, default=0)
    last_profile_update = Column(DateTime, default=datetime.utcnow)

    student = relationship("Student", back_populates="profile")
