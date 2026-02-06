import requests
import uuid

BASE_URL = "http://localhost:8002"
AUTH_HEADERS = {
    "Authorization": "Bearer sk-user-m7j6iIH79Tpjg4AZlQS_BQXDrSoy5BxXR4dFTYt89Mx4iAVomQLHR5yuBzB4KIIRff0B4AYxYb1deFAV5gF-q_t3nLL85XsGVoUuEBjABlhURvDLJHc732RmzZ7McnIhLvo",
    "Content-Type": "application/json"
}
TIMEOUT = 30


def test_refresh_jwt_tokens_using_refresh_token():
    # Step 1: Register a new user to obtain initial tokens
    register_payload = {
        "email": f"testuser_{uuid.uuid4().hex[:8]}@example.com",
        "password": "StrongPassw0rd!",
        "name": "Test User",
        "birth_year": 1990,
        "occupation": "Tester",
        "life_background": "Test background",
        "turnstile_token": "test_turnstile_token"
    }

    try:
        resp = requests.post(
            f"{BASE_URL}/api/v1/auth/register",
            json=register_payload,
            timeout=TIMEOUT
        )
        assert resp.status_code == 201, f"Expected 201 Created, got {resp.status_code}"

        # Note: The system sends email verification code, but since automation can't complete email,
        # we simulate verification by using a known code "123456" for test environment or skip actual verification.
        # For this test, we'll simulate a complete flow by verifying email immediately.

        verify_payload = {
            "email": register_payload["email"],
            "code": "123456"  # This code must be valid for test environment
        }
        resp = requests.post(
            f"{BASE_URL}/api/v1/auth/verify-email",
            json=verify_payload,
            timeout=TIMEOUT
        )
        assert resp.status_code == 200, f"Expected 200 OK on email verify, got {resp.status_code}"
        data = resp.json()
        assert "refresh_token" in data, "refresh_token not in verify-email response"
        original_refresh_token = data["refresh_token"]

        # Step 2: Use the refresh_token to refresh tokens
        refresh_payload = {
            "refresh_token": original_refresh_token
        }
        resp = requests.post(
            f"{BASE_URL}/api/v1/auth/refresh",
            json=refresh_payload,
            timeout=TIMEOUT
        )
        assert resp.status_code == 200, f"Expected 200 OK on token refresh, got {resp.status_code}"
        tokens = resp.json()
        assert "access_token" in tokens, "access_token not returned on refresh"
        assert "refresh_token" in tokens, "refresh_token not returned on refresh"
        assert tokens["refresh_token"] != original_refresh_token, "refresh_token should change after refresh"
        assert isinstance(tokens["access_token"], str) and len(tokens["access_token"]) > 0
        assert isinstance(tokens["refresh_token"], str) and len(tokens["refresh_token"]) > 0

    finally:
        # Cleanup: delete user if possible using access token
        # Attempt to get user profile to extract user_id for deletion
        try:
            access_token = tokens.get("access_token", None)
            if access_token:
                headers = {"Authorization": f"Bearer {access_token}"}
                resp = requests.get(
                    f"{BASE_URL}/api/v1/auth/me",
                    headers=headers,
                    timeout=TIMEOUT
                )
                if resp.status_code == 200:
                    user_id = resp.json().get("id") or resp.json().get("user_id")
                    if user_id:
                        del_resp = requests.delete(
                            f"{BASE_URL}/api/v1/users/{user_id}",
                            headers={"Authorization": f"Bearer {access_token}"},
                            timeout=TIMEOUT
                        )
                        assert del_resp.status_code in (204, 200), "User deletion failed during cleanup"
        except Exception:
            pass


test_refresh_jwt_tokens_using_refresh_token()