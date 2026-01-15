from src.ai.ai_agent import ai_agent

def test_ai_agent():
    print("Testing AI Agent...")

    try:
        # Test that the agent can process a simple message
        response = ai_agent.run_sync("Hello, how are you?")
        print(f"[OK] AI Agent responded: {response[:100]}...")

        # Test with a task-related message
        task_response = ai_agent.run_sync("Can you help me add a task to buy groceries?")
        print(f"[OK] Task-related response: {task_response[:100]}...")

        return True
    except Exception as e:
        print(f"[ERROR] AI Agent failed: {e}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == "__main__":
    success = test_ai_agent()
    if success:
        print("\n[SUCCESS] AI Agent is working correctly")
    else:
        print("\n[ERROR] AI Agent has issues")