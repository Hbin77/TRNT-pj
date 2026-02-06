import requests
import uuid
import time

BASE_URL = "http://localhost:8002"
REGISTER_ENDPOINT = f"{BASE_URL}/api/v1/auth/register"
HEADERS = {
    "Authorization": "Bearer sk-user-m7j6iIH79Tpjg4AZlQS_BQXDrSoy5BxXR4dFTYt89Mx4iAVomQLHR5yuBzB4KIIRff0B4AYxYb1deFAV5gF-q_t3nLL85XsGVoUuEBjABlhURvDLJHc732RmzZ7McnIhLvo",
    "Content-Type": "application/json"
}
TIMEOUT = 30

def test_user_registration_with_email_and_turnstile_verification():
    unique_email = f"testuser_{uuid.uuid4().hex[:8]}@example.com"
    user_payload = {
        "email": unique_email,
        "password": "StrongPass!123",
        "name": "Test User",
        "birth_year": 1990,
        "occupation": "Tester",
        "life_background": "Just a test background.",
        "turnstile_token": "test_turnstile_token_xyz"
    }
    # Register new user
    try:
        response = requests.post(
            REGISTER_ENDPOINT,
            json=user_payload,
            headers=HEADERS,
            timeout=TIMEOUT
        )
    except requests.RequestException as e:
        assert False, f"Request failed during user registration: {e}"

    # Expect 201 Created indicating verification email sent
    assert response.status_code == 201, f"Expected 201, got {response.status_code}, response: {response.text}"

    # Test duplicate email registration returns 409 Conflict
    try:
        duplicate_resp = requests.post(
            REGISTER_ENDPOINT,
            json=user_payload,
            headers=HEADERS,
            timeout=TIMEOUT
        )
    except requests.RequestException as e:
        assert False, f"Request failed during duplicate registration: {e}"

    assert duplicate_resp.status_code == 409, f"Expected 409 on duplicate email, got {duplicate_resp.status_code}, response: {duplicate_resp.text}"

test_user_registration_with_email_and_turnstile_verification()