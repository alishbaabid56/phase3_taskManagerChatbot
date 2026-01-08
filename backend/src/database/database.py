# backend/src/database/database.py
import os
from sqlmodel import create_engine, Session, SQLModel
from typing import Generator

from dotenv import load_dotenv
import os

# Load .env file
load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")
if not DATABASE_URL:
    raise ValueError("DATABASE_URL not set in .env file")


# Create SQLModel engine for PostgreSQL (Neon)
engine = create_engine(
    DATABASE_URL,
    echo=True,          # Prints SQL queries (good for debugging)
    pool_size=5,
    max_overflow=10,
    pool_pre_ping=True,
    pool_recycle=300
)

def get_session() -> Generator[Session, None, None]:
    """
    Dependency for FastAPI routes
    """
    with Session(engine) as session:
        yield session
