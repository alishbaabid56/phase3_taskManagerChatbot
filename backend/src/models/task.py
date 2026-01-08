from sqlmodel import SQLModel, Field
from typing import Optional
from datetime import datetime
import uuid
from sqlalchemy import Index

class TaskBase(SQLModel):
    """
    Base model for Task with common fields.
    Reference: @specs/database/schema.md
    """
    title: str = Field(nullable=False)
    description: Optional[str] = Field(default=None)
    completed: bool = Field(default=False)
    created_at: Optional[datetime] = Field(default_factory=datetime.utcnow)
    updated_at: Optional[datetime] = Field(default_factory=datetime.utcnow)

class Task(TaskBase, table=True):
    """
    Task model representing a user's task with title, description, completion status, creation date, and association to a user.
    Reference: @specs/database/schema.md
    """
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    user_id: uuid.UUID = Field(foreign_key="user.id", nullable=False)

    # Define indexes for performance
    __table_args__ = (
        Index("idx_user_id", "user_id"),
        Index("idx_completed", "completed"),
        Index("idx_created_at", "created_at"),
    )

class TaskCreate(TaskBase):
    """Model for creating a new task"""
    pass

class TaskRead(TaskBase):
    """Model for reading task data"""
    id: uuid.UUID
    user_id: uuid.UUID

class TaskUpdate(SQLModel):
    """Model for updating task data"""
    title: Optional[str] = None
    description: Optional[str] = None
    completed: Optional[bool] = None
