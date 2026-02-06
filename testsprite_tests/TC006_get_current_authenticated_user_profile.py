import requests

BASE_URL = "http://localhost:8002"
AUTH_ME_ENDPOINT = "/api/v1/auth/me"
VALID_TOKEN = "sk-user-m7j6iIH79Tpjg4AZlQS_BQXDrSoy5BxXR4dFTYt89Mx4iAVomQLHR5yuBzB4KIIRff0B4AYxYb1deFAV5gF-q_t3nLL85XsGVoUuEBjABlhURvDLJHc732RmzZ7McnIhLvo"
TIMEOUT_SECONDS = 30

def test_get_current_authenticated_user_profile():
    headers_valid = {
        "Authorization": f"Bearer {VALID_TOKEN}"
    }
    headers_invalid = {
        "Authorization": "Bearer invalidtoken"
    }
    url = f"{BASE_URL}{AUTH_ME_ENDPOINT}"

    # Test authorized access with valid token
    try:
        response = requests.get(url, headers=headers_valid, timeout=TIMEOUT_SECONDS)
        assert response.status_code == 200, f"Expected 200 OK, got {response.status_code}"
        json_data = response.json()
        # At minimum verify fields expected in user profile are present as per typical user profile
        # Since PRD doesn't specify exact user profile schema, check expected keys existence
        assert isinstance(json_data, dict), "Response JSON is not an object"
        # Check for at least 'id' or 'user_id' or 'email' in profile response commonly expected
        # If none found, just check keys presence
        # This is a minimal safe check
        assert any(k in json_data for k in ("id", "user_id", "email", "name")), "User profile missing expected fields"
    except Exception as e:
        assert False, f"Authorized request failed: {e}"

    # Test unauthorized access with invalid token
    try:
        response_unauth = requests.get(url, headers=headers_invalid, timeout=TIMEOUT_SECONDS)
        assert response_unauth.status_code == 401, f"Expected 401 Unauthorized for invalid token, got {response_unauth.status_code}"
        # Response body should be JSON error response
        error_json = response_unauth.json()
        assert isinstance(error_json, dict), "Unauthorized error response should be JSON object"
    except Exception as e:
        assert False, f"Unauthorized access test failed: {e}"

    # Test unauthorized access with missing token
    try:
        response_no_auth = requests.get(url, timeout=TIMEOUT_SECONDS)
        assert response_no_auth.status_code == 401, f"Expected 401 Unauthorized for missing token, got {response_no_auth.status_code}"
        error_json = response_no_auth.json()
        assert isinstance(error_json, dict), "Unauthorized error response should be JSON object"
    except Exception as e:
        assert False, f"Unauthorized missing token test failed: {e}"

test_get_current_authenticated_user_profile()