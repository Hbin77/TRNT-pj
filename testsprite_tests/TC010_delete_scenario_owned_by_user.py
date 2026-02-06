import requests
import uuid

BASE_URL = "http://localhost:8002"
HEADERS = {
    "Authorization": "Bearer sk-user-m7j6iIH79Tpjg4AZlQS_BQXDrSoy5BxXR4dFTYt89Mx4iAVomQLHR5yuBzB4KIIRff0B4AYxYb1deFAV5gF-q_t3nLL85XsGVoUuEBjABlhURvDLJHc732RmzZ7McnIhLvo",
    "Content-Type": "application/json"
}
TIMEOUT = 30

def test_delete_scenario_owned_by_user():
    scenario_id = None

    # Helper to generate a scenario to delete
    def create_scenario():
        url = f"{BASE_URL}/api/v1/scenarios/generate"
        payload = {
            "branch": {
                "occurred_at": "2026-02-06T12:00:00Z",
                "original_choice": "Take job offer",
                "alternative_choice": "Decline job offer",
                "context": "Career decision after graduation"
            },
            "tone": "optimistic",
            "genre": "success",
            "detail_level": "normal",
            "scope": "short"
        }
        # Save parameter to true to save the scenario owned by user
        params = {"save": "true"}
        response = requests.post(url, headers=HEADERS, json=payload, params=params, timeout=TIMEOUT)
        response.raise_for_status()
        data = response.json()
        assert "id" in data, "Scenario creation response missing id"
        return data["id"]

    # Helper to attempt to delete scenario with invalid token to simulate unauthorized user
    def delete_scenario_unauthorized(scenario_id):
        url = f"{BASE_URL}/api/v1/scenarios/{scenario_id}"
        bad_headers = {
            "Authorization": "Bearer invalid.token.for.testing",
            "Content-Type": "application/json"
        }
        response = requests.delete(url, headers=bad_headers, timeout=TIMEOUT)
        # Expect 401 Unauthorized or 403 Forbidden
        assert response.status_code in (401, 403), f"Expected 401 or 403 for unauthorized deletion, got {response.status_code}"

    try:
        # Create scenario owned by this authenticated user
        scenario_id = create_scenario()

        # Delete the scenario with valid auth
        del_url = f"{BASE_URL}/api/v1/scenarios/{scenario_id}"
        del_response = requests.delete(del_url, headers=HEADERS, timeout=TIMEOUT)
        assert del_response.status_code == 204, f"Expected 204 No Content on delete, got {del_response.status_code}"

        # Verify scenario is deleted by trying to GET it (should return 404)
        get_response = requests.get(del_url, headers=HEADERS, timeout=TIMEOUT)
        assert get_response.status_code == 404, f"Expected 404 Not Found after deletion, got {get_response.status_code}"

        # Create another scenario for unauthorized deletion attempt
        scenario_id = create_scenario()

        # Attempt to delete the scenario with invalid token (unauthorized)
        delete_scenario_unauthorized(scenario_id)

    finally:
        # Cleanup: delete the scenario if it still exists and owned by user
        if scenario_id:
            check_resp = requests.get(f"{BASE_URL}/api/v1/scenarios/{scenario_id}", headers=HEADERS, timeout=TIMEOUT)
            if check_resp.status_code == 200:
                try:
                    requests.delete(f"{BASE_URL}/api/v1/scenarios/{scenario_id}", headers=HEADERS, timeout=TIMEOUT)
                except Exception:
                    pass

test_delete_scenario_owned_by_user()