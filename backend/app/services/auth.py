"""인증 서비스 - 비밀번호 해싱, JWT 생성/검증"""
from datetime import datetime, timedelta
from typing import Optional, Dict, Any
from uuid import UUID

from jose import JWTError, jwt
from passlib.context import CryptContext

from app.config import settings
from app.exceptions import AuthenticationException

# 비밀번호 해싱 컨텍스트
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


class AuthService:
    """인증 서비스"""

    @staticmethod
    def hash_password(password: str) -> str:
        """비밀번호 해싱"""
        return pwd_context.hash(password)

    @staticmethod
    def verify_password(plain_password: str, hashed_password: str) -> bool:
        """비밀번호 검증"""
        return pwd_context.verify(plain_password, hashed_password)

    @staticmethod
    def create_access_token(user_id: UUID, expires_delta: Optional[timedelta] = None) -> str:
        """액세스 토큰 생성"""
        if expires_delta is None:
            expires_delta = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)

        expire = datetime.utcnow() + expires_delta
        to_encode = {
            "sub": str(user_id),
            "exp": expire,
            "type": "access"
        }
        return jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.JWT_ALGORITHM)

    @staticmethod
    def create_refresh_token(user_id: UUID, expires_delta: Optional[timedelta] = None) -> str:
        """리프레시 토큰 생성"""
        if expires_delta is None:
            expires_delta = timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS)

        expire = datetime.utcnow() + expires_delta
        to_encode = {
            "sub": str(user_id),
            "exp": expire,
            "type": "refresh"
        }
        return jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.JWT_ALGORITHM)

    @staticmethod
    def verify_token(token: str, token_type: str = "access") -> Dict[str, Any]:
        """
        토큰 검증 및 페이로드 반환

        Args:
            token: JWT 토큰
            token_type: "access" 또는 "refresh"

        Returns:
            토큰 페이로드

        Raises:
            AuthenticationException: 토큰이 유효하지 않거나 만료된 경우
        """
        try:
            payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.JWT_ALGORITHM])

            # 토큰 타입 확인
            if payload.get("type") != token_type:
                raise AuthenticationException(message=f"유효하지 않은 토큰 타입입니다. ({token_type} 필요)")

            return payload

        except JWTError as e:
            raise AuthenticationException(message=f"토큰 검증 실패: {str(e)}")

    @staticmethod
    def get_user_id_from_token(token: str) -> UUID:
        """
        토큰에서 사용자 ID 추출

        Args:
            token: JWT 액세스 토큰

        Returns:
            사용자 UUID

        Raises:
            AuthenticationException: 토큰이 유효하지 않거나 만료된 경우
        """
        payload = AuthService.verify_token(token, token_type="access")
        user_id_str = payload.get("sub")

        if not user_id_str:
            raise AuthenticationException(message="토큰에 사용자 정보가 없습니다.")

        try:
            return UUID(user_id_str)
        except ValueError:
            raise AuthenticationException(message="유효하지 않은 사용자 ID 형식입니다.")
