"""프로필 완성 체크 의존성"""
from fastapi import Depends

from app.models.user import User
from app.dependencies.auth import get_current_active_user
from app.exceptions import IncompleteProfileException


async def require_complete_profile(
    current_user: User = Depends(get_current_active_user)
) -> User:
    """
    프로필 완성 여부 확인 (카카오 신규 가입자 체크)

    Args:
        current_user: 현재 사용자

    Returns:
        User 객체

    Raises:
        IncompleteProfileException: 프로필이 완성되지 않은 경우
    """
    # 카카오 사용자이면서 프로필이 플레이스홀더인 경우 체크
    if current_user.auth_provider == "kakao":
        # birth_year가 0이거나 occupation이 "미입력"이면 프로필 미완성
        if current_user.birth_year == 0 or current_user.occupation == "미입력":
            raise IncompleteProfileException()

    return current_user
