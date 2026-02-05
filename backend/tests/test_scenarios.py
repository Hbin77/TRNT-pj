"""시나리오 API 테스트"""
import pytest
from unittest.mock import patch, MagicMock


@pytest.fixture
def sample_branch():
    """샘플 분기점 데이터"""
    return {
        "occurred_at": "2020년 고3 겨울",
        "original_choice": "서울대 진학",
        "alternative_choice": "해외 유학"
    }


@pytest.fixture
def sample_scenario_request(sample_branch):
    """샘플 시나리오 생성 요청"""
    return {
        "branch": sample_branch,
        "tone": "realistic",
        "genre": "drama",
        "detail_level": "normal",
        "scope": "medium"
    }


class TestScenarioGeneration:
    """시나리오 생성 테스트"""

    @patch('app.services.ai.AIService.generate_scenario')
    def test_generate_scenario_success(
        self,
        mock_generate,
        authenticated_client,
        sample_scenario_request
    ):
        """시나리오 생성 성공"""
        client, token = authenticated_client
        mock_generate.return_value = "샘플 시나리오 텍스트입니다."

        response = client.post(
            "/api/v1/scenarios/generate?save=true",
            headers={"Authorization": f"Bearer {token}"},
            json=sample_scenario_request
        )

        assert response.status_code == 200
        data = response.json()
        assert "scenario_text" in data
        assert "word_count" in data
        assert data["word_count"] > 0

    def test_generate_scenario_requires_auth(self, client, sample_scenario_request):
        """인증 없이 시나리오 생성 실패"""
        response = client.post(
            "/api/v1/scenarios/generate",
            json=sample_scenario_request
        )

        assert response.status_code == 403

    @patch('app.services.ai.AIService.generate_scenario')
    def test_generate_scenario_without_save(
        self,
        mock_generate,
        authenticated_client,
        sample_scenario_request
    ):
        """DB 저장 없이 시나리오 생성"""
        client, token = authenticated_client
        mock_generate.return_value = "샘플 시나리오 텍스트입니다."

        response = client.post(
            "/api/v1/scenarios/generate?save=false",
            headers={"Authorization": f"Bearer {token}"},
            json=sample_scenario_request
        )

        assert response.status_code == 200
        data = response.json()
        assert data["scenario_id"] is None

    def test_generate_scenario_invalid_branch_data(
        self,
        authenticated_client
    ):
        """유효하지 않은 분기점 데이터로 생성 실패"""
        client, token = authenticated_client

        invalid_request = {
            "branch": {
                "occurred_at": "",  # 빈 문자열
                "original_choice": "A",
                "alternative_choice": "B"
            }
        }

        response = client.post(
            "/api/v1/scenarios/generate",
            headers={"Authorization": f"Bearer {token}"},
            json=invalid_request
        )

        assert response.status_code == 422

    def test_generate_scenario_too_long_text(
        self,
        authenticated_client
    ):
        """너무 긴 텍스트로 생성 실패"""
        client, token = authenticated_client

        invalid_request = {
            "branch": {
                "occurred_at": "A" * 300,  # 200자 제한 초과
                "original_choice": "A",
                "alternative_choice": "B"
            }
        }

        response = client.post(
            "/api/v1/scenarios/generate",
            headers={"Authorization": f"Bearer {token}"},
            json=invalid_request
        )

        assert response.status_code == 422


class TestRateLimiting:
    """사용량 제한 테스트"""

    @patch('app.services.ai.AIService.generate_scenario')
    def test_rate_limit_exceeded(
        self,
        mock_generate,
        authenticated_client,
        sample_scenario_request
    ):
        """일일 사용량 제한 초과"""
        client, token = authenticated_client
        mock_generate.return_value = "샘플 시나리오 텍스트입니다."

        # 3번 성공적으로 생성 (일일 무료 제한)
        for i in range(3):
            response = client.post(
                "/api/v1/scenarios/generate?save=true",
                headers={"Authorization": f"Bearer {token}"},
                json=sample_scenario_request
            )
            assert response.status_code == 200

        # 4번째는 실패
        response = client.post(
            "/api/v1/scenarios/generate?save=true",
            headers={"Authorization": f"Bearer {token}"},
            json=sample_scenario_request
        )

        assert response.status_code == 429
        data = response.json()
        assert data["error"]["code"] == "RATE_LIMIT_EXCEEDED"


class TestScenarioList:
    """시나리오 목록 조회 테스트"""

    @patch('app.services.ai.AIService.generate_scenario')
    def test_get_scenarios_list(
        self,
        mock_generate,
        authenticated_client,
        sample_scenario_request
    ):
        """내 시나리오 목록 조회 성공"""
        client, token = authenticated_client
        mock_generate.return_value = "샘플 시나리오 텍스트입니다."

        # 시나리오 2개 생성
        for _ in range(2):
            client.post(
                "/api/v1/scenarios/generate?save=true",
                headers={"Authorization": f"Bearer {token}"},
                json=sample_scenario_request
            )

        # 목록 조회
        response = client.get(
            "/api/v1/scenarios",
            headers={"Authorization": f"Bearer {token}"}
        )

        assert response.status_code == 200
        data = response.json()
        assert "total" in data
        assert "scenarios" in data
        assert data["total"] == 2
        assert len(data["scenarios"]) == 2

        # scenario_text는 목록에 포함되지 않음
        for scenario in data["scenarios"]:
            assert "scenario_text" not in scenario
            assert "id" in scenario
            assert "word_count" in scenario

    def test_get_scenarios_requires_auth(self, client):
        """인증 없이 시나리오 목록 조회 실패"""
        response = client.get("/api/v1/scenarios")

        assert response.status_code == 403

    def test_get_scenarios_pagination(
        self,
        authenticated_client
    ):
        """시나리오 목록 페이지네이션"""
        client, token = authenticated_client

        response = client.get(
            "/api/v1/scenarios?skip=0&limit=10",
            headers={"Authorization": f"Bearer {token}"}
        )

        assert response.status_code == 200


class TestScenarioDetail:
    """시나리오 상세 조회 테스트"""

    @patch('app.services.ai.AIService.generate_scenario')
    def test_get_scenario_detail(
        self,
        mock_generate,
        authenticated_client,
        sample_scenario_request
    ):
        """시나리오 상세 조회 성공"""
        client, token = authenticated_client
        mock_generate.return_value = "샘플 시나리오 텍스트입니다."

        # 시나리오 생성
        create_response = client.post(
            "/api/v1/scenarios/generate?save=true",
            headers={"Authorization": f"Bearer {token}"},
            json=sample_scenario_request
        )
        scenario_id = create_response.json()["scenario_id"]

        # 상세 조회
        response = client.get(
            f"/api/v1/scenarios/{scenario_id}",
            headers={"Authorization": f"Bearer {token}"}
        )

        assert response.status_code == 200
        data = response.json()
        assert "id" in data
        assert "scenario_text" in data
        assert "branch_data" in data

    def test_get_scenario_not_found(self, authenticated_client):
        """존재하지 않는 시나리오 조회 실패"""
        client, token = authenticated_client
        fake_uuid = "00000000-0000-0000-0000-000000000000"

        response = client.get(
            f"/api/v1/scenarios/{fake_uuid}",
            headers={"Authorization": f"Bearer {token}"}
        )

        assert response.status_code == 404

    def test_get_scenario_requires_auth(self, client):
        """인증 없이 시나리오 조회 실패"""
        fake_uuid = "00000000-0000-0000-0000-000000000000"

        response = client.get(f"/api/v1/scenarios/{fake_uuid}")

        assert response.status_code == 403


class TestScenarioDelete:
    """시나리오 삭제 테스트"""

    @patch('app.services.ai.AIService.generate_scenario')
    def test_delete_scenario_success(
        self,
        mock_generate,
        authenticated_client,
        sample_scenario_request
    ):
        """시나리오 삭제 성공"""
        client, token = authenticated_client
        mock_generate.return_value = "샘플 시나리오 텍스트입니다."

        # 시나리오 생성
        create_response = client.post(
            "/api/v1/scenarios/generate?save=true",
            headers={"Authorization": f"Bearer {token}"},
            json=sample_scenario_request
        )
        scenario_id = create_response.json()["scenario_id"]

        # 삭제
        response = client.delete(
            f"/api/v1/scenarios/{scenario_id}",
            headers={"Authorization": f"Bearer {token}"}
        )

        assert response.status_code == 204

    def test_delete_scenario_not_found(self, authenticated_client):
        """존재하지 않는 시나리오 삭제 실패"""
        client, token = authenticated_client
        fake_uuid = "00000000-0000-0000-0000-000000000000"

        response = client.delete(
            f"/api/v1/scenarios/{fake_uuid}",
            headers={"Authorization": f"Bearer {token}"}
        )

        assert response.status_code == 404

    def test_delete_scenario_requires_auth(self, client):
        """인증 없이 시나리오 삭제 실패"""
        fake_uuid = "00000000-0000-0000-0000-000000000000"

        response = client.delete(f"/api/v1/scenarios/{fake_uuid}")

        assert response.status_code == 403
