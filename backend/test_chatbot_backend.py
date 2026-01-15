"""
Test script to verify the backend functionality of the chatbot
"""
import asyncio
import os
from sqlmodel import Session, create_engine
from unittest.mock import patch, MagicMock
from src.models.conversation import Conversation, Message
from src.services.conversation_service import create_conversation, get_conversation_messages
from src.ai.ai_agent import ai_agent
from src.services.mcp_tool_service import get_mcp_tools

# Mock the AI agent call to avoid actual API calls during testing
def test_ai_agent_integration():
    print("Testing AI Agent integration...")

    # Verify AI agent is configured
    try:
        client = ai_agent.ai_config.get_client()
        print("[OK] AI Agent client configured successfully")
    except Exception as e:
        print(f"[FAIL] AI Agent configuration failed: {e}")
        return False

    # Test getting tools
    tools = get_mcp_tools()
    if len(tools) > 0:
        print(f"[OK] Retrieved {len(tools)} MCP tools successfully")
    else:
        print("[FAIL] Failed to retrieve MCP tools")
        return False

    return True

def test_database_models():
    print("\nTesting Database Models...")

    # Test creating a conversation object (in memory)
    try:
        # We won't actually save to DB in this test, just verify the model structure
        from uuid import uuid4
        from datetime import datetime

        conv = Conversation(
            id=uuid4(),
            user_id=uuid4(),
            title="Test Conversation",
            created_at=datetime.utcnow(),
            updated_at=datetime.utcnow()
        )

        msg = Message(
            id=uuid4(),
            conversation_id=conv.id,
            role="user",
            content="Test message",
            timestamp=datetime.utcnow()
        )

        print("[OK] Database models instantiated successfully")
        return True
    except Exception as e:
        print(f"[FAIL] Database model test failed: {e}")
        return False

def test_services():
    print("\nTesting Services...")

    # Test service imports
    try:
        from src.services.conversation_service import create_conversation, get_conversation
        from src.services.message_service import create_message
        from src.services.mcp_tool_service import MCPTaskTools

        print("[OK] Services imported successfully")
        return True
    except Exception as e:
        print(f"[FAIL] Service import test failed: {e}")
        return False

def run_backend_tests():
    print("Starting Backend Functionality Tests...\n")

    tests = [
        test_ai_agent_integration,
        test_database_models,
        test_services
    ]

    results = []
    for test in tests:
        results.append(test())

    print(f"\n{'='*50}")
    print(f"Test Results: {sum(results)}/{len(results)} passed")

    if all(results):
        print("[SUCCESS] All backend tests passed!")
        return True
    else:
        print("[ERROR] Some backend tests failed!")
        return False

if __name__ == "__main__":
    success = run_backend_tests()
    exit(0 if success else 1)