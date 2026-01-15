from sqlmodel import SQLModel, create_engine
from sqlalchemy import event
from ..models.user import User
from ..models.task import Task
from ..models.conversation import Conversation, Message
import os

# Get database URL from environment
DATABASE_URL = os.getenv("DATABASE_URL")

# Create engine
engine = create_engine(
    DATABASE_URL,
    # Connection pooling settings for serverless
    pool_size=5,
    max_overflow=10,
    pool_pre_ping=True,  # Verify connections before use
    pool_recycle=300,    # Recycle connections every 5 minutes
)

def create_db_and_indexes():
    """
    Create database tables and indexes based on SQLModel models.
    Reference: @specs/database/schema.md
    """
    # Create all tables
    SQLModel.metadata.create_all(engine)

    # Add indexes after table creation if needed
    # Note: In SQLModel, indexes are typically defined in the model fields
    print("Database tables and indexes created successfully!")

if __name__ == "__main__":
    create_db_and_indexes()