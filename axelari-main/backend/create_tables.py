"""
Create database tables for Axelari backend
"""
from app.core.db import engine, Base
from app.models import Student, StudentProfile

# Import all models to ensure they're registered with Base.metadata
print("Creating tables...")
Base.metadata.create_all(bind=engine)
print("Tables created successfully!")
