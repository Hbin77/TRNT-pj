"""인증 의존성"""
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.user import User
from app.services.auth import AuthService
from app.exceptions import AuthenticationException, UserNotFoundException

# Bearer 토큰 스키마
security = HTTPBearer()


async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db)
) -> User:
    """
    현재 인증된 사용자 조회

    Args:
        credentials: Bearer 토큰
        db: 데이터베이스 세션

    Returns:
        User 객체

    Raises:
        AuthenticationException: 인증 실패 시
        UserNotFoundException: 사용자를 찾을 수 없을 때
    """
    token = credentials.credentials

    # 토큰에서 사용자 ID 추출
    user_id = AuthService.get_user_id_from_token(token)

    # 사용자 조회
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise UserNotFoundException(user_id=str(user_id))

    return user


async def get_current_active_user(
    current_user: User = Depends(get_current_user)
) -> User:
    """
    현재 활성화된 사용자 조회

    Args:
        current_user: 현재 사용자

    Returns:
        User 객체

    Raises:
        AuthenticationException: 사용자가 비활성화된 경우
    """
    if not current_user.is_active:
        raise AuthenticationException(message="비활성화된 사용자입니다.")

    return current_user
