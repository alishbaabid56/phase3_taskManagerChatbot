# backend/src/database/init_db.py
from sqlmodel import SQLModel
from .database import engine
from src.models.user import User
from src.models.task import Task

def create_db_and_tables():
    """
    Create database tables based on SQLModel models
    """
    print("Creating database tables...")
    SQLModel.metadata.create_all(engine)
    print("Database tables created successfully!")

if __name__ == "__main__":
    create_db_and_tables()
