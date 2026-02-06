import requests

BASE_URL = "http://localhost:8002"
HEADERS = {
    "Authorization": "Bearer sk-user-m7j6iIH79Tpjg4AZlQS_BQXDrSoy5BxXR4dFTYt89Mx4iAVomQLHR5yuBzB4KIIRff0B4AYxYb1deFAV5gF-q_t3nLL85XsGVoUuEBjABlhURvDLJHc732RmzZ7McnIhLvo",
    "Accept": "application/json",
}
TIMEOUT = 30

def test_health_check_returns_server_status():
    try:
        response = requests.get(f"{BASE_URL}/health", headers=HEADERS, timeout=TIMEOUT)
        assert response.status_code == 200, f"Expected 200 OK, got {response.status_code}"
        json_data = response.json()
        assert isinstance(json_data, dict), "Response is not a JSON object"
        # Validate expected keys presence
        assert "status" in json_data, "'status' field is missing in response"
        assert "timestamp" in json_data, "'timestamp' field is missing in response"
        assert "version" in json_data, "'version' field is missing in response"
        # Validate types
        assert isinstance(json_data["status"], str), "'status' should be a string"
        assert isinstance(json_data["timestamp"], str), "'timestamp' should be a string"
        assert isinstance(json_data["version"], str), "'version' should be a string"
    except requests.RequestException as e:
        assert False, f"Request failed: {e}"

test_health_check_returns_server_status()