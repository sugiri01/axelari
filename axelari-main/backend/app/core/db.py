import os
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import NullPool
from dotenv import load_dotenv

load_dotenv()

# Get DATABASE_URL from environment
DATABASE_URL = os.getenv("DATABASE_URL")

# Parse and modify for SQLAlchemy if needed
# Neon URLs work directly with SQLAlchemy
if DATABASE_URL and DATABASE_URL.startswith("postgresql://"):
    # SQLAlchemy 2.0+ requires postgresql+psycopg2:// or postgresql+asyncpg://
    DATABASE_URL = DATABASE_URL.replace("postgresql://", "postgresql+psycopg2://")

# Create engine with SSL support for Neon
engine = create_engine(
    DATABASE_URL,
    poolclass=NullPool,  # Neon manages connections, don't pool
    connect_args={
        "sslmode": "require",
        "connect_timeout": 10,
    },
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def get_db():
    """Dependency for FastAPI endpoints"""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
