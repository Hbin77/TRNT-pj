"""인증 API 테스트"""
import pytest


class TestRegister:
    """회원가입 테스트"""

    def test_register_success(self, client, test_user_data):
        """회원가입 성공"""
        response = client.post("/api/v1/auth/register", json=test_user_data)

        assert response.status_code == 201
        data = response.json()
        assert "access_token" in data
        assert "refresh_token" in data
        assert "user_id" in data

    def test_register_duplicate_email(self, client, test_user_data):
        """중복 이메일로 회원가입 실패"""
        # 첫 번째 회원가입
        client.post("/api/v1/auth/register", json=test_user_data)

        # 같은 이메일로 두 번째 시도
        response = client.post("/api/v1/auth/register", json=test_user_data)

        assert response.status_code == 400
        data = response.json()
        assert data["error"]["code"] == "DUPLICATE_EMAIL"

    def test_register_weak_password(self, client, test_user_data):
        """약한 비밀번호로 회원가입 실패"""
        test_user_data["password"] = "weak"  # 너무 짧고 복잡도 미달

        response = client.post("/api/v1/auth/register", json=test_user_data)

        assert response.status_code == 422
        data = response.json()
        assert "error" in data
        assert data["error"]["code"] == "VALIDATION_ERROR"

    def test_register_invalid_birth_year(self, client, test_user_data):
        """유효하지 않은 출생연도로 회원가입 실패"""
        test_user_data["birth_year"] = 2999  # 미래 연도

        response = client.post("/api/v1/auth/register", json=test_user_data)

        assert response.status_code == 422

    def test_register_password_without_uppercase(self, client, test_user_data):
        """대문자 없는 비밀번호로 회원가입 실패"""
        test_user_data["password"] = "test1234!"

        response = client.post("/api/v1/auth/register", json=test_user_data)

        assert response.status_code == 422

    def test_register_password_without_number(self, client, test_user_data):
        """숫자 없는 비밀번호로 회원가입 실패"""
        test_user_data["password"] = "TestTest!"

        response = client.post("/api/v1/auth/register", json=test_user_data)

        assert response.status_code == 422

    def test_register_password_without_special(self, client, test_user_data):
        """특수문자 없는 비밀번호로 회원가입 실패"""
        test_user_data["password"] = "Test1234"

        response = client.post("/api/v1/auth/register", json=test_user_data)

        assert response.status_code == 422


class TestLogin:
    """로그인 테스트"""

    def test_login_success(self, client, test_user_data):
        """로그인 성공"""
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

    def test_login_wrong_password(self, client, test_user_data):
        """잘못된 비밀번호로 로그인 실패"""
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
        client, token = authenticated_client

        # 로그아웃
        response = client.post(
            "/api/v1/auth/logout",
            headers={"Authorization": f"Bearer {token}"}
        )

        assert response.status_code == 200
        data = response.json()
        assert "message" in data

    def test_logout_token_becomes_invalid(self, authenticated_client):
        """로그아웃 후 토큰 무효화 확인"""
        client, token = authenticated_client

        # 로그아웃
        client.post(
            "/api/v1/auth/logout",
            headers={"Authorization": f"Bearer {token}"}
        )

        # 로그아웃된 토큰으로 요청 (실패해야 함)
        response = client.get(
            "/api/v1/auth/me",
            headers={"Authorization": f"Bearer {token}"}
        )

        assert response.status_code == 401
        data = response.json()
        assert data["error"]["code"] == "AUTHENTICATION_FAILED"


class TestPasswordReset:
    """비밀번호 재설정 테스트"""

    def test_forgot_password_success(self, client, test_user_data):
        """비밀번호 재설정 요청 성공"""
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

    def test_refresh_token_success(self, client, test_user_data):
        """리프레시 토큰으로 새 액세스 토큰 발급"""
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
