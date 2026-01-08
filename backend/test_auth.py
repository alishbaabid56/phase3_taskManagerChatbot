
import requests
import json

# Test the backend auth endpoints
BASE_URL = "http://127.0.0.1:8000"

def test_register():
    """Test the registration endpoint"""
    print("Testing registration endpoint...")
    register_url = f"{BASE_URL}/api/auth/register"

    # Prepare registration data
    user_data = {
        "email": "testuser@example.com",
        "password": "testpassword123"
    }

    try:
        response = requests.post(register_url, json=user_data)
        print(f"Register status: {response.status_code}")
        print(f"Register response: {response.text}")
        return response
    except Exception as e:
        print(f"Error during registration test: {e}")
        return None

def test_login():
    """Test the login endpoint"""
    print("Testing login endpoint...")
    login_url = f"{BASE_URL}/api/auth/login"

    # Login data (form data, not JSON)
    login_data = {
        "username": "testuser@example.com",
        "password": "testpassword123"
    }

    try:
        # Using form data, not JSON
        response = requests.post(login_url, data=login_data)
        print(f"Login status: {response.status_code}")
        print(f"Login response: {response.text}")
        return response
    except Exception as e:
        print(f"Error during login test: {e}")
        return None

if __name__ == "__main__":
    print("Testing auth endpoints...")

    # Start server first
    print("Please start the server with: uvicorn src.main:app --reload --port 8000")
    input("Press Enter after starting the server to continue...")

    # Test registration
    register_response = test_register()

    # Test login
    login_response = test_login()

    print("Auth endpoint testing completed.")