import requests

BASE_URL = "http://localhost:8002"
LOGIN_ENDPOINT = "/api/v1/auth/login"
TIMEOUT = 30
HEADERS = {
    "Content-Type": "application/json"
}

def test_user_login_with_email_and_password_returns_jwt_tokens():
    session = requests.Session()
    # Test valid credentials
    valid_payload = {
        "email": "master@example.com",  # Assuming master account to test master account bypass but can be any valid
        "password": "correct_password"
    }
    try:
        response = session.post(
            BASE_URL + LOGIN_ENDPOINT,
            json=valid_payload,
            headers=HEADERS,
            timeout=TIMEOUT
        )
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        json_resp = response.json()
        assert "access_token" in json_resp, "Missing access_token in response"
        assert "refresh_token" in json_resp, "Missing refresh_token in response"
        assert "user_id" in json_resp, "Missing user_id in response"
    except requests.exceptions.RequestException as e:
        assert False, f"Request failed during valid login test: {e}"

    # Test invalid credentials
    invalid_payload = {
        "email": "nonexistent@example.com",
        "password": "wrong_password"
    }
    try:
        response = session.post(
            BASE_URL + LOGIN_ENDPOINT,
            json=invalid_payload,
            headers=HEADERS,
            timeout=TIMEOUT
        )
        assert response.status_code == 401, f"Expected 401 for invalid credentials, got {response.status_code}"
        # Optionally validate error message structure
        json_resp = response.json()
        assert isinstance(json_resp, dict), "Response should be a JSON object on error"
    except requests.exceptions.RequestException as e:
        assert False, f"Request failed during invalid login test: {e}"

test_user_login_with_email_and_password_returns_jwt_tokens()