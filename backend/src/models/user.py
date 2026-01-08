from sqlmodel import SQLModel, Field
from typing import Optional
from datetime import datetime
import uuid
from pydantic import field_validator

class UserBase(SQLModel):
    """
    Base model for User with common fields.
    Reference: @specs/database/schema.md
    """
    email: str = Field(unique=True, nullable=False)
    created_at: Optional[datetime] = Field(default_factory=datetime.utcnow)
    updated_at: Optional[datetime] = Field(default_factory=datetime.utcnow)

class User(UserBase, table=True):
    """
    User model representing an authenticated user with email, password hash, and account metadata.
    Reference: @specs/database/schema.md
    """
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    password_hash: str = Field(nullable=False)

class UserCreate(UserBase):
    """Model for creating a new user"""
    password: str

    @field_validator('password')
    @classmethod
    def validate_password_length(cls, v):
        # Bcrypt has a 72-byte password length limit
        if len(v.encode('utf-8')) > 72:
            raise ValueError('Password must be 72 bytes or less')
        return v

class UserRead(UserBase):
    """Model for reading user data (without sensitive information)"""
    id: uuid.UUID
