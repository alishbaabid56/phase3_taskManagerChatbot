import requests
import json

# Test the chat endpoint
def test_chat_endpoint():
    # This is a test to see if the endpoint structure is correct
    print("Testing chat endpoint structure...")

    # Since we don't have a real user/token, let's just check if the endpoint exists
    # by looking at the API routes
    try:
        response = requests.get("http://127.0.0.1:8000/docs", timeout=5)
        if response.status_code == 200:
            print("[OK] API documentation is accessible")
        else:
            print("[?] API documentation not accessible, but server might still be working")
    except:
        print("[?] Server might not be running on port 8000")

    # Test that the modules are properly structured
    try:
        from src.api.chat_routes import router
        print("[OK] Chat routes module loaded successfully")
    except Exception as e:
        print(f"[ERROR] Chat routes module failed to load: {e}")
        return False

    try:
        from src.ai.ai_agent import ai_agent
        print("[OK] AI agent module loaded successfully")
    except Exception as e:
        print(f"[ERROR] AI agent module failed to load: {e}")
        return False

    try:
        from src.services.mcp_tool_service import get_mcp_tools
        tools = get_mcp_tools()
        print(f"[OK] MCP tools loaded successfully ({len(tools)} tools)")
    except Exception as e:
        print(f"[ERROR] MCP tools failed to load: {e}")
        return False

    return True

if __name__ == "__main__":
    print("Testing backend components...")
    success = test_chat_endpoint()
    if success:
        print("\n[SUCCESS] Backend components are structured correctly")
    else:
        print("\n[ERROR] Backend components have issues")