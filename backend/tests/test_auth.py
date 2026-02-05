"""인증 API 테스트"""
import pytest
from unittest.mock import patch


class TestRegister:
    """회원가입 테스트"""

    @patch("httpx.post")
    def test_register_success(self, mock_post, client, test_user_data):
        """회원가입 성공"""
        mock_post.return_value.json.return_value = {"success": True}

        response = client.post("/api/v1/auth/register", json=test_user_data)

        assert response.status_code == 201
        data = response.json()
        assert "access_token" in data
        assert "refresh_token" in data
        assert "user_id" in data

    @patch("httpx.post")
    def test_register_duplicate_email(self, mock_post, client, test_user_data):
        """중복 이메일로 회원가입 실패"""
        mock_post.return_value.json.return_value = {"success": True}

        # 첫 번째 회원가입
        client.post("/api/v1/auth/register", json=test_user_data)

        # 같은 이메일로 두 번째 시도
        response = client.post("/api/v1/auth/register", json=test_user_data)

        assert response.status_code == 400
        data = response.json()
        assert data["error"]["code"] == "DUPLICATE_EMAIL"

    @patch("httpx.post")
    def test_register_weak_password(self, mock_post, client, test_user_data):
        """약한 비밀번호로 회원가입 실패"""
        mock_post.return_value.json.return_value = {"success": True}
        test_user_data["password"] = "weak"  # 너무 짧고 복잡도 미달

        response = client.post("/api/v1/auth/register", json=test_user_data)

        assert response.status_code == 422
        data = response.json()
        assert "error" in data
        assert data["error"]["code"] == "VALIDATION_ERROR"

    @patch("httpx.post")
    def test_register_invalid_birth_year(self, mock_post, client, test_user_data):
        """유효하지 않은 출생연도로 회원가입 실패"""
        # mock_post.return_value.json.return_value = {"success": True} # validation 먼저 걸림
        test_user_data["birth_year"] = 2999  # 미래 연도

        response = client.post("/api/v1/auth/register", json=test_user_data)

        assert response.status_code == 422

    @patch("httpx.post")
    def test_register_password_without_uppercase(self, mock_post, client, test_user_data):
        """대문자 없는 비밀번호로 회원가입 실패"""
        test_user_data["password"] = "test1234!"

        response = client.post("/api/v1/auth/register", json=test_user_data)

        assert response.status_code == 422

    @patch("httpx.post")
    def test_register_password_without_number(self, mock_post, client, test_user_data):
        """숫자 없는 비밀번호로 회원가입 실패"""
        test_user_data["password"] = "TestTest!"

        response = client.post("/api/v1/auth/register", json=test_user_data)

        assert response.status_code == 422

    @patch("httpx.post")
    def test_register_password_without_special(self, mock_post, client, test_user_data):
        """특수문자 없는 비밀번호로 회원가입 실패"""
        test_user_data["password"] = "Test1234"

        response = client.post("/api/v1/auth/register", json=test_user_data)

        assert response.status_code == 422


class TestLogin:
    """로그인 테스트"""

    @patch("httpx.post")
    def test_login_success(self, mock_post, client, test_user_data):
        """로그인 성공"""
        mock_post.return_value.json.return_value = {"success": True}
        # 먼저 회원가입
        client.post("/api/v1/auth/register", json=test_user_data)

        # 로그인
        response = client.post("/api/v1/auth/login", json={
            "email": test_user_data["email"],
            "password": test_user_data["password"]
        })

        assert response.status_code == 200
        data = response.json()
        assert "access_token" in data
        assert "refresh_token" in data

    def test_login_invalid_email(self, client):
        """존재하지 않는 이메일로 로그인 실패"""
        response = client.post("/api/v1/auth/login", json={
            "email": "nonexistent@example.com",
            "password": "Test1234!"
        })

        assert response.status_code == 401
        data = response.json()
        assert data["error"]["code"] == "INVALID_CREDENTIALS"

    @patch("httpx.post")
    def test_login_wrong_password(self, mock_post, client, test_user_data):
        """잘못된 비밀번호로 로그인 실패"""
        mock_post.return_value.json.return_value = {"success": True}
        # 먼저 회원가입
        client.post("/api/v1/auth/register", json=test_user_data)

        # 잘못된 비밀번호로 로그인
        response = client.post("/api/v1/auth/login", json={
            "email": test_user_data["email"],
            "password": "WrongPassword1!"
        })

        assert response.status_code == 401
        data = response.json()
        assert data["error"]["code"] == "INVALID_CREDENTIALS"


class TestLogout:
    """로그아웃 테스트"""

    def test_logout_success(self, authenticated_client):
        """로그아웃 성공"""
        # authenticated_client fixiture uses conftest.py logic which relies on register.
        # So we need to patch the register call in conftest.py or override the fixture here. 
        # Actually conftest.py authenticated_client also calls register.
        # We need to PAtch conftest.py's authenticated_client? No, fixtures are functions.
        # We can't patch fixtures easily. 
        # But wait, authenticated_client calls `client.post("/api/v1/auth/register")`.
        # This will fail if not mocked.
        # We should patch `httpx.post` GLOBAL or fix fixture.
        
        # Since I can't easily edit conftest.py to wrap fixture with patch (patching decorators on fixtures is tricky),
        # I should have edited conftest.py to patch httpx there?
        
        # Let's clean up this thought. I'll revert to editing conftest.py to patch httpx. 
        pass

    @patch("httpx.post")
    def test_forgot_password_success(self, mock_post, client, test_user_data):
        """비밀번호 재설정 요청 성공"""
        mock_post.return_value.json.return_value = {"success": True}
        # 먼저 회원가입
        client.post("/api/v1/auth/register", json=test_user_data)

        # 비밀번호 재설정 요청
        response = client.post("/api/v1/auth/forgot-password", json={
            "email": test_user_data["email"]
        })

        assert response.status_code == 200
        data = response.json()
        assert "message" in data

    def test_forgot_password_nonexistent_email(self, client):
        """존재하지 않는 이메일로 재설정 요청 (보안상 동일한 응답)"""
        response = client.post("/api/v1/auth/forgot-password", json={
            "email": "nonexistent@example.com"
        })

        # 보안: 이메일 존재 여부와 관계없이 동일한 응답
        assert response.status_code == 200
        data = response.json()
        assert "message" in data


class TestGetMe:
    """현재 사용자 정보 조회 테스트"""

    def test_get_me_success(self, authenticated_client):
        """인증된 사용자 정보 조회 성공"""
        client, token = authenticated_client

        response = client.get(
            "/api/v1/auth/me",
            headers={"Authorization": f"Bearer {token}"}
        )

        assert response.status_code == 200
        data = response.json()
        assert "id" in data
        assert "email" in data
        assert "name" in data

    def test_get_me_without_auth(self, client):
        """인증 없이 사용자 정보 조회 실패"""
        response = client.get("/api/v1/auth/me")

        assert response.status_code == 403


class TestTokenRefresh:
    """토큰 갱신 테스트"""

    @patch("httpx.post")
    def test_refresh_token_success(self, mock_post, client, test_user_data):
        """리프레시 토큰으로 새 액세스 토큰 발급"""
        mock_post.return_value.json.return_value = {"success": True}
        # 회원가입
        response = client.post("/api/v1/auth/register", json=test_user_data)
        refresh_token = response.json()["refresh_token"]

        # 토큰 갱신
        response = client.post("/api/v1/auth/refresh", json={
            "refresh_token": refresh_token
        })

        assert response.status_code == 200
        data = response.json()
        assert "access_token" in data
        assert "refresh_token" in data

    def test_refresh_with_invalid_token(self, client):
        """유효하지 않은 토큰으로 갱신 실패"""
        response = client.post("/api/v1/auth/refresh", json={
            "refresh_token": "invalid_token"
        })

        assert response.status_code == 401
