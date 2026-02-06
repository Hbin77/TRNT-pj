import requests
from requests.exceptions import RequestException

BASE_URL = "http://localhost:8002"
API_PATH = "/api/v1/scenarios"
AUTH_TOKEN = "sk-user-m7j6iIH79Tpjg4AZlQS_BQXDrSoy5BxXR4dFTYt89Mx4iAVomQLHR5yuBzB4KIIRff0B4AYxYb1deFAV5gF-q_t3nLL85XsGVoUuEBjABlhURvDLJHc732RmzZ7McnIhLvo"
HEADERS = {"Authorization": f"Bearer {AUTH_TOKEN}"}
TIMEOUT = 30

def test_list_user_scenarios_with_pagination():
    # Validate authentication enforcement: request without token should be 401 or 403
    try:
        response = requests.get(f"{BASE_URL}{API_PATH}", timeout=TIMEOUT)
        assert response.status_code in (401, 403), f"Expected 401 or 403 for unauthenticated request, got {response.status_code}"
    except RequestException as e:
        assert False, f"Request failed without auth token: {str(e)}"

    # Request first page with default pagination (skip=0, limit=20)
    params = {"skip": 0, "limit": 5}  # use limit=5 for manageable test
    try:
        response = requests.get(f"{BASE_URL}{API_PATH}", headers=HEADERS, params=params, timeout=TIMEOUT)
        assert response.status_code == 200, f"Expected 200 OK, got {response.status_code}"
        data = response.json()
        
        # Assert response contains list and pagination details if any
        assert isinstance(data, dict), "Response is not a JSON object"
        assert "items" in data or isinstance(data, list), "Response missing 'items' key or is not a list"
        
        items = data.get("items", None)
        # 'items' key may or may not exist; if not, assume response is list
        if items is None:
            # response is list of scenarios
            items = data if isinstance(data, list) else []
        assert isinstance(items, list), "'items' is not a list"

        # Check number of returned scenarios not exceeding the limit param
        assert len(items) <= 5, f"Number of items {len(items)} exceeded limit 5"

        # Optional: Try to fetch next page and ensure no overlap
        params_next = {"skip": 5, "limit": 5}
        response_next = requests.get(f"{BASE_URL}{API_PATH}", headers=HEADERS, params=params_next, timeout=TIMEOUT)
        assert response_next.status_code == 200, f"Expected 200 OK for next page, got {response_next.status_code}"
        data_next = response_next.json()
        items_next = data_next.get("items", None)
        if items_next is None:
            items_next = data_next if isinstance(data_next, list) else []
        assert isinstance(items_next, list), "'items' in next page response is not a list"
        
        # Check no duplicated scenario IDs between pages if items have 'id'
        ids_first = set()
        for item in items:
            if isinstance(item, dict) and "id" in item:
                ids_first.add(item["id"])
        ids_next = set()
        for item in items_next:
            if isinstance(item, dict) and "id" in item:
                ids_next.add(item["id"])
        duplicates = ids_first.intersection(ids_next)
        assert len(duplicates) == 0, f"Duplicate scenario IDs across pages: {duplicates}"

    except RequestException as e:
        assert False, f"Request failed: {str(e)}"
    except ValueError as e:
        assert False, f"Failed to decode JSON response: {str(e)}"

test_list_user_scenarios_with_pagination()
