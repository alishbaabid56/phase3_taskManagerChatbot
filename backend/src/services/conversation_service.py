from sqlmodel import Session, select
from typing import Optional
from uuid import UUID
from datetime import datetime
from ..models.conversation import Conversation, Message, ConversationCreate
from ..models.user import User

def create_conversation(session: Session, user_id: str) -> Conversation:
    """
    Create a new conversation for a user
    """
    conversation = Conversation(
        user_id=UUID(user_id),
        title="New Conversation"
    )
    session.add(conversation)
    session.commit()
    session.refresh(conversation)
    return conversation

def get_conversation(session: Session, conversation_id: str, user_id: str) -> Optional[Conversation]:
    """
    Get a conversation by ID for a specific user
    """
    stmt = select(Conversation).where(
        Conversation.id == UUID(conversation_id),
        Conversation.user_id == UUID(user_id)
    )
    return session.exec(stmt).first()

def update_conversation_title(session: Session, conversation_id: str, title: str) -> bool:
    """
    Update the title of a conversation
    """
    stmt = select(Conversation).where(Conversation.id == UUID(conversation_id))
    conversation = session.exec(stmt).first()

    if conversation:
        conversation.title = title
        conversation.updated_at = datetime.utcnow()
        session.add(conversation)
        session.commit()
        return True

    return False

def create_message(session: Session, conversation_id: str, role: str, content: str, metadata: dict = None) -> Message:
    """
    Create a new message in a conversation
    """
    message = Message(
        conversation_id=UUID(conversation_id),
        role=role,
        content=content,
        metadata_json=metadata
    )
    session.add(message)
    session.commit()
    session.refresh(message)
    return message

def get_conversation_messages(session: Session, conversation_id: str) -> list[Message]:
    """
    Get all messages for a conversation
    """
    stmt = select(Message).where(
        Message.conversation_id == UUID(conversation_id)
    ).order_by(Message.timestamp.asc())
    return session.exec(stmt).all()

def get_user_conversations(session: Session, user_id: str) -> list[Conversation]:
    """
    Get all conversations for a user
    """
    stmt = select(Conversation).where(
        Conversation.user_id == UUID(user_id)
    ).order_by(Conversation.created_at.desc())
    return session.exec(stmt).all()