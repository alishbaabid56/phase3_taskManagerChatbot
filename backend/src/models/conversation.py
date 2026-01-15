from sqlmodel import SQLModel, Field, Relationship
from typing import Optional, List
from datetime import datetime
import uuid
from sqlalchemy import Column, Index, Text, Enum as SQLAlchemyEnum, JSON as SA_JSON
from enum import Enum

class MessageRole(str, Enum):
    user = "user"
    assistant = "assistant"
    system = "system"

class Conversation(SQLModel, table=True):
    """
    Conversation model to track chat sessions
    """
    __tablename__ = "conversations"

    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    user_id: uuid.UUID = Field(foreign_key="user.id", nullable=False)
    title: Optional[str] = Field(default=None, max_length=255)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    # Relationship to messages
    messages: List["Message"] = Relationship(back_populates="conversation")

    # Define indexes for performance
    __table_args__ = (
        Index("idx_conversation_user_id", "user_id"),
        Index("idx_conversation_created_at", "created_at"),
    )

class Message(SQLModel, table=True):
    """
    Message model to store conversation history
    """
    __tablename__ = "messages"

    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    conversation_id: uuid.UUID = Field(foreign_key="conversations.id", nullable=False)  # Fixed: referenced correct table name
    role: str = Field(sa_column=Column(SQLAlchemyEnum(MessageRole)))
    content: str = Field(sa_column=Column(Text))
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    metadata_json: Optional[dict] = Field(default=None, sa_column=Column("metadata", SA_JSON))

    # Relationship to conversation
    conversation: Conversation = Relationship(back_populates="messages")

    # Define indexes for performance
    __table_args__ = (
        Index("idx_message_conversation_id", "conversation_id"),
        Index("idx_message_timestamp", "timestamp"),
    )

# Pydantic models for API requests/responses
class ConversationCreate(SQLModel):
    title: Optional[str] = None

class ConversationRead(SQLModel):
    id: uuid.UUID
    user_id: uuid.UUID
    title: Optional[str]
    created_at: datetime
    updated_at: datetime

class MessageCreate(SQLModel):
    role: MessageRole
    content: str
    metadata_json: Optional[dict] = None

class MessageRead(SQLModel):
    id: uuid.UUID
    conversation_id: uuid.UUID
    role: MessageRole
    content: str
    timestamp: datetime
    metadata_json: Optional[dict]