import requests
import uuid
import time

BASE_URL = "http://localhost:8002"
TIMEOUT = 30
AUTH_HEADER = {
    "Authorization": "Bearer sk-user-m7j6iIH79Tpjg4AZlQS_BQXDrSoy5BxXR4dFTYt89Mx4iAVomQLHR5yuBzB4KIIRff0B4AYxYb1deFAV5gF-q_t3nLL85XsGVoUuEBjABlhURvDLJHc732RmzZ7McnIhLvo"
}

def test_email_verification_with_6_digit_code_and_auto_login():
    # 1. Register a new user to get a valid email and trigger email verification code sending
    register_url = f"{BASE_URL}/api/v1/auth/register"
    test_email = f"testuser_{uuid.uuid4().hex[:8]}@example.com"
    register_payload = {
        "email": test_email,
        "password": "TestPassword123!",
        "name": "Test User",
        "birth_year": 1990,
        "occupation": "Tester",
        "life_background": "Test background",
        "turnstile_token": "dummy_turnstile_token"
    }
    headers = {"Content-Type": "application/json"}
    # Include auth header as this is a master account bypass test environment
    headers.update(AUTH_HEADER)
    resp = requests.post(register_url, json=register_payload, headers=headers, timeout=TIMEOUT)
    assert resp.status_code in (201, 409), f"Unexpected register status: {resp.status_code}"
    # If duplicate, the email exists. We proceed anyway.

    # 2. Normally, we need the actual 6-digit verification code sent by email.
    # Since we cannot access email, we simulate obtaining the code.
    # For test purpose, we assume a known valid code for this test environment or via an internal test API call.
    # Here, we call an internal testing helper endpoint to fetch the latest code for the email, bypassing real emails.

    # Helper endpoint assumed for testing purposes only.
    code_fetch_url = f"{BASE_URL}/internal/testing/fetch-verification-code"
    code_params = {"email": test_email}
    try:
        code_resp = requests.get(code_fetch_url, params=code_params, headers=AUTH_HEADER, timeout=TIMEOUT)
        assert code_resp.status_code == 200, f"Failed to fetch verification code, status {code_resp.status_code}"
        code_data = code_resp.json()
        verification_code = code_data.get("code")
        assert verification_code is not None and len(verification_code) == 6, "Invalid verification code fetched"
    except Exception:
        # If no helper endpoint, fallback or skip test due to environment constraints.
        raise AssertionError("Unable to obtain verification code for test user email verification")

    # 3. Call verify-email endpoint with email and 6-digit code
    verify_url = f"{BASE_URL}/api/v1/auth/verify-email"
    verify_payload = {
        "email": test_email,
        "code": verification_code
    }
    verify_headers = {"Content-Type": "application/json"}
    verify_headers.update(AUTH_HEADER)
    verify_resp = requests.post(verify_url, json=verify_payload, headers=verify_headers, timeout=TIMEOUT)
    assert verify_resp.status_code == 200, f"Email verification failed with status {verify_resp.status_code}"
    verify_json = verify_resp.json()
    assert "access_token" in verify_json and isinstance(verify_json["access_token"], str) and len(verify_json["access_token"]) > 0
    assert "refresh_token" in verify_json and isinstance(verify_json["refresh_token"], str) and len(verify_json["refresh_token"]) > 0
    assert "user_id" in verify_json and isinstance(verify_json["user_id"], int)

    # 4. Optional: Test rate limiter master account bypass behavior by calling scenario generation multiple times
    # since the instruction says focus on rate limiter master bypass feature, ensure that the master token allows bypass.
    # For brevity, we just check that multiple calls do not get 429.
    scenario_generate_url = f"{BASE_URL}/api/v1/scenarios/generate"
    scenario_payload = {
        "branch": {
            "occurred_at": "2020-01-01T00:00:00Z",
            "original_choice": "Original",
            "alternative_choice": "Alternative",
            "context": "Test context"
        },
        "tone": "optimistic",
        "genre": "success",
        "detail_level": "normal",
        "scope": "short"
    }
    scenario_headers = {
        "Content-Type": "application/json",
        "Authorization": AUTH_HEADER["Authorization"]
    }
    for _ in range(5):
        gen_resp = requests.post(scenario_generate_url, json=scenario_payload, headers=scenario_headers, timeout=TIMEOUT)
        assert gen_resp.status_code == 200, f"Master account should bypass rate limit, got {gen_resp.status_code}"
        gen_json = gen_resp.json()
        assert "text" in gen_json and isinstance(gen_json["text"], str)

test_email_verification_with_6_digit_code_and_auto_login()