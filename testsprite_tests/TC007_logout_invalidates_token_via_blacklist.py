import requests

BASE_URL = "http://localhost:8002"
TIMEOUT = 30
AUTH_TOKEN = "sk-user-m7j6iIH79Tpjg4AZlQS_BQXDrSoy5BxXR4dFTYt89Mx4iAVomQLHR5yuBzB4KIIRff0B4AYxYb1deFAV5gF-q_t3nLL85XsGVoUuEBjABlhURvDLJHc732RmzZ7McnIhLvo"

def test_logout_invalidates_token_via_blacklist():
    """
    Test POST /api/v1/auth/logout to logout user by invalidating the current token
    """
    headers = {
        "Authorization": f"Bearer {AUTH_TOKEN}",
        "Content-Type": "application/json"
    }
    url = f"{BASE_URL}/api/v1/auth/logout"
    try:
        response = requests.post(url, headers=headers, timeout=TIMEOUT)
        assert response.status_code == 200, f"Expected 200 OK, got {response.status_code}"
        json_resp = response.json()
        # Confirm response confirms logout - expect some message or just success
        # PRD only documents description "Logged out" with 200, no payload detail, so allow empty or message
        assert isinstance(json_resp, dict), "Response JSON expected"
        # If message exists, check for logout confirmation keyword
        msg = json_resp.get("message", "").lower() if "message" in json_resp else ""
        assert ("logout" in msg) or (msg == "") or (json_resp == {}), "Logout confirmation missing in response"
        
        # Additional check: Using the same token again should fail authentication
        # (optional) since backend should blacklist token
        resp_after_logout = requests.get(f"{BASE_URL}/api/v1/auth/me", headers=headers, timeout=TIMEOUT)
        # Expect 401 Unauthorized as token is invalidated
        assert resp_after_logout.status_code == 401, "Token should be invalid after logout"
    except requests.RequestException as e:
        assert False, f"Request failed with exception: {e}"

test_logout_invalidates_token_via_blacklist()