"""카카오 OAuth 서비스"""
from typing import Dict, Any
from urllib.parse import urlencode

import httpx

from app.config import settings
from app.exceptions import AIServiceException


class KakaoOAuthService:
    """
    카카오 OAuth 2.0 서비스

    카카오 로그인을 위한 OAuth 2.0 인증 플로우를 처리합니다.
    인가 코드 방식(Authorization Code Grant)을 사용합니다.
    """

    def __init__(self):
        """KakaoOAuthService 초기화"""
        self.client_id = settings.KAKAO_CLIENT_ID
        self.client_secret = settings.KAKAO_CLIENT_SECRET
        self.redirect_uri = settings.KAKAO_REDIRECT_URI
        self.auth_url = "https://kauth.kakao.com/oauth/authorize"
        self.token_url = "https://kauth.kakao.com/oauth/token"
        self.user_info_url = "https://kapi.kakao.com/v2/user/me"

    def get_authorization_url(self) -> str:
        """
        카카오 인증 URL 생성

        Returns:
            카카오 로그인 페이지 URL
        """
        params = {
            "client_id": self.client_id,
            "redirect_uri": self.redirect_uri,
            "response_type": "code"
        }
        return f"{self.auth_url}?{urlencode(params)}"

    async def exchange_code(self, code: str) -> str:
        """
        인가 코드를 액세스 토큰으로 교환

        Args:
            code: 카카오에서 받은 인가 코드

        Returns:
            카카오 액세스 토큰

        Raises:
            AIServiceException: 토큰 교환 실패 시
        """
        data = {
            "grant_type": "authorization_code",
            "client_id": self.client_id,
            "client_secret": self.client_secret,
            "redirect_uri": self.redirect_uri,
            "code": code
        }

        try:
            async with httpx.AsyncClient() as client:
                response = await client.post(
                    self.token_url,
                    data=data,
                    headers={"Content-Type": "application/x-www-form-urlencoded"}
                )

                if response.status_code != 200:
                    raise AIServiceException(
                        message="카카오 토큰 교환에 실패했습니다.",
                        details={"status_code": response.status_code, "response": response.text[:200]}
                    )

                token_data = response.json()
                return token_data["access_token"]

        except httpx.RequestError as e:
            raise AIServiceException(
                message="카카오 서버 연결에 실패했습니다.",
                details={"error": str(e)}
            )

    async def get_user_info(self, access_token: str) -> Dict[str, Any]:
        """
        카카오 사용자 정보 조회

        Args:
            access_token: 카카오 액세스 토큰

        Returns:
            사용자 정보 딕셔너리
            {
                "kakao_id": "123456789",
                "email": "user@example.com",
                "nickname": "홍길동"
            }

        Raises:
            AIServiceException: 사용자 정보 조회 실패 시
        """
        try:
            async with httpx.AsyncClient() as client:
                response = await client.get(
                    self.user_info_url,
                    headers={
                        "Authorization": f"Bearer {access_token}",
                        "Content-Type": "application/x-www-form-urlencoded"
                    }
                )

                if response.status_code != 200:
                    raise AIServiceException(
                        message="카카오 사용자 정보 조회에 실패했습니다.",
                        details={"status_code": response.status_code, "response": response.text[:200]}
                    )

                user_data = response.json()

                # 카카오 사용자 정보 파싱
                return {
                    "kakao_id": str(user_data["id"]),
                    "email": user_data.get("kakao_account", {}).get("email"),
                    "nickname": user_data.get("properties", {}).get("nickname", "카카오사용자")
                }

        except httpx.RequestError as e:
            raise AIServiceException(
                message="카카오 서버 연결에 실패했습니다.",
                details={"error": str(e)}
            )
