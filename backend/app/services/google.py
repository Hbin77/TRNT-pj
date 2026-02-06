"""구글 OAuth 서비스"""
from typing import Dict, Any
from urllib.parse import urlencode

import httpx

from app.config import settings
from app.exceptions import AIServiceException


class GoogleOAuthService:
    """
    구글 OAuth 2.0 서비스

    구글 로그인을 위한 OAuth 2.0 인증 플로우를 처리합니다.
    """

    def __init__(self):
        """GoogleOAuthService 초기화"""
        self.client_id = settings.GOOGLE_CLIENT_ID
        self.client_secret = settings.GOOGLE_CLIENT_SECRET
        self.redirect_uri = settings.GOOGLE_REDIRECT_URI
        self.auth_url = "https://accounts.google.com/o/oauth2/v2/auth"
        self.token_url = "https://oauth2.googleapis.com/token"
        self.user_info_url = "https://www.googleapis.com/oauth2/v3/userinfo"

    def get_authorization_url(self) -> str:
        """
        구글 인증 URL 생성

        Returns:
            구글 로그인 페이지 URL
        """
        params = {
            "client_id": self.client_id,
            "redirect_uri": self.redirect_uri,
            "response_type": "code",
            "scope": "openid email profile",
            "access_type": "offline",
            "prompt": "consent"
        }
        return f"{self.auth_url}?{urlencode(params)}"

    async def exchange_code(self, code: str) -> str:
        """
        인가 코드를 액세스 토큰으로 교환

        Args:
            code: 구글에서 받은 인가 코드

        Returns:
            구글 액세스 토큰
        """
        data = {
            "client_id": self.client_id,
            "client_secret": self.client_secret,
            "code": code,
            "grant_type": "authorization_code",
            "redirect_uri": self.redirect_uri
        }

        try:
            async with httpx.AsyncClient() as client:
                response = await client.post(self.token_url, data=data)

                if response.status_code != 200:
                    raise AIServiceException(
                        message="구글 토큰 교환에 실패했습니다.",
                        details={"status_code": response.status_code, "response": response.text[:200]}
                    )

                token_data = response.json()
                return token_data["access_token"]

        except httpx.RequestError as e:
            raise AIServiceException(
                message="구글 서버 연결에 실패했습니다.",
                details={"error": str(e)}
            )

    async def get_user_info(self, access_token: str) -> Dict[str, Any]:
        """
        구글 사용자 정보 조회

        Args:
            access_token: 구글 액세스 토큰

        Returns:
            사용자 정보 딕셔너리
            {
                "google_id": "123456789",
                "email": "user@example.com",
                "name": "홍길동",
                "picture": "https://..."
            }
        """
        try:
            async with httpx.AsyncClient() as client:
                response = await client.get(
                    self.user_info_url,
                    headers={"Authorization": f"Bearer {access_token}"}
                )

                if response.status_code != 200:
                    raise AIServiceException(
                        message="구글 사용자 정보 조회에 실패했습니다.",
                        details={"status_code": response.status_code, "response": response.text[:200]}
                    )

                user_data = response.json()

                # 구글 사용자 정보 파싱
                return {
                    "google_id": user_data["sub"],
                    "email": user_data.get("email"),
                    "name": user_data.get("name"),
                    "picture": user_data.get("picture")
                }

        except httpx.RequestError as e:
            raise AIServiceException(
                message="구글 서버 연결에 실패했습니다.",
                details={"error": str(e)}
            )
