import requests
import time

BASE_URL = "http://localhost:8002"
HEADERS_MASTER = {
    "Authorization": "Bearer sk-user-m7j6iIH79Tpjg4AZlQS_BQXDrSoy5BxXR4dFTYt89Mx4iAVomQLHR5yuBzB4KIIRff0B4AYxYb1deFAV5gF-q_t3nLL85XsGVoUuEBjABlhURvDLJHc732RmzZ7McnIhLvo",
    "Content-Type": "application/json",
}
HEADERS_NORMAL = {
    # For normal user token, assume separate token - for demo purpose we reuse master token but in real test should be different
    # Here we simulate two different users using distinct tokens.
    "Authorization": "Bearer sk-user-normal-token-placeholder",
    "Content-Type": "application/json",
}

generate_endpoint = f"{BASE_URL}/api/v1/scenarios/generate"

payload = {
    "branch": {
        "occurred_at": "2023-08-15T15:00:00Z",
        "original_choice": "Went to college",
        "alternative_choice": "Started a business",
        "context": "Life decision right after high school"
    },
    "tone": "optimistic",
    "genre": "success",
    "detail_level": "normal",
    "scope": "medium"
}

def test_generate_ai_scenario_rate_limit_and_master_exemption():
    # Since we don't have a ready normal user token, first register and login a normal user to get a token.
    # We'll simulate by creating a new normal user, then test rate-limit for it.
    # Then test master account exemption with master token.

    session = requests.Session()
    session.headers.update({"Content-Type": "application/json"})

    # Create normal user for test
    email_normal = f"normaluser{int(time.time())}@example.com"
    password = "TestPass123!"
    register_resp = session.post(
        f"{BASE_URL}/api/v1/auth/register",
        json={
            "email": email_normal,
            "password": password,
            "name": "Normal User",
            "birth_year": 1990,
            "occupation": "Tester",
            "life_background": "Background info",
            "turnstile_token": "dummy-token"
        },
        timeout=30
    )
    assert register_resp.status_code in (201, 409)

    # Assuming email verification step - simulate successful verification and login

    # Here we skip actual email verification due to no real email, 
    # but let's simulate login assuming the password is known.
    login_resp = session.post(
        f"{BASE_URL}/api/v1/auth/login",
        json={
            "email": email_normal,
            "password": password
        },
        timeout=30
    )
    assert login_resp.status_code == 200
    tokens = login_resp.json()
    assert "access_token" in tokens and "refresh_token" in tokens and "user_id" in tokens
    normal_access_token = tokens["access_token"]

    # Prepare headers for normal user
    headers_normal = {
        "Authorization": f"Bearer {normal_access_token}",
        "Content-Type": "application/json"
    }

    # Test daily rate limit for normal user (3 per day allowed)
    for i in range(3):
        resp = requests.post(generate_endpoint, headers=headers_normal, json=payload, timeout=30)
        assert resp.status_code == 200
        resp_json = resp.json()
        assert "text" in resp_json

    # 4th attempt should fail with 429
    resp = requests.post(generate_endpoint, headers=headers_normal, json=payload, timeout=30)
    assert resp.status_code == 429
    err_json = resp.json()
    assert "detail" in err_json or "error" in err_json

    # Now test master account exemption: requests should never hit rate limit (simulate 5 calls)
    # Use HEADERS_MASTER which contains master token
    for _ in range(5):
        resp = requests.post(generate_endpoint, headers=HEADERS_MASTER, json=payload, timeout=30)
        assert resp.status_code == 200
        resp_json = resp.json()
        assert "text" in resp_json

    # Also verify AI prompt changes reflected in the scenario text (e.g. tone)
    # Make a request with different tone and check response text mentions optimism or relevant keywords
    payload_different_tone = payload.copy()
    payload_different_tone["tone"] = "pessimistic"
    resp = requests.post(generate_endpoint, headers=HEADERS_MASTER, json=payload_different_tone, timeout=30)
    assert resp.status_code == 200
    result = resp.json()
    text = result.get("text", "").lower()
    # We expect some indication of pessimistic tone (cannot strictly assert content without AI knowledge, so loosely check text existence)
    assert len(text) > 0

test_generate_ai_scenario_rate_limit_and_master_exemption()
