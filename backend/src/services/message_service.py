from sqlmodel import Session, select
from typing import Optional
from uuid import UUID
from datetime import datetime
from ..models.conversation import Message, MessageCreate

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

def get_message_by_id(session: Session, message_id: str) -> Optional[Message]:
    """
    Get a message by its ID
    """
    stmt = select(Message).where(Message.id == UUID(message_id))
    return session.exec(stmt).first()

def get_conversation_messages(session: Session, conversation_id: str) -> list[Message]:
    """
    Get all messages for a conversation, ordered by timestamp
    """
    stmt = select(Message).where(
        Message.conversation_id == UUID(conversation_id)
    ).order_by(Message.timestamp.asc())
    return session.exec(stmt).all()

def get_latest_messages(session: Session, conversation_id: str, limit: int = 10) -> list[Message]:
    """
    Get the latest N messages from a conversation
    """
    stmt = select(Message).where(
        Message.conversation_id == UUID(conversation_id)
    ).order_by(Message.timestamp.desc()).limit(limit)
    messages = session.exec(stmt).all()
    # Reverse the list to return in chronological order
    return list(reversed(messages))

def update_message_content(session: Session, message_id: str, content: str) -> bool:
    """
    Update the content of a message
    """
    stmt = select(Message).where(Message.id == UUID(message_id))
    message = session.exec(stmt).first()

    if message:
        message.content = content
        message.metadata_json = getattr(message, 'metadata_json', {})
        session.add(message)
        session.commit()
        return True

    return False

def delete_message(session: Session, message_id: str) -> bool:
    """
    Delete a message
    """
    stmt = select(Message).where(Message.id == UUID(message_id))
    message = session.exec(stmt).first()

    if message:
        session.delete(message)
        session.commit()
        return True

    return False