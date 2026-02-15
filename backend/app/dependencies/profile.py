"""프로필 완성 체크 의존성"""
from fastapi import Depends

from app.models.user import User
from app.dependencies.auth import get_current_active_user
from app.exceptions import IncompleteProfileException


async def require_complete_profile(
    current_user: User = Depends(get_current_active_user)
) -> User:
    """
    프로필 완성 여부 확인 (모든 사용자)

    Args:
        current_user: 현재 사용자

    Returns:
        User 객체

    Raises:
        IncompleteProfileException: 프로필이 완성되지 않은 경우
    """
    # 필수 필드 목록 (life_background는 선택사항)
    required_fields = {
        'name': '이름',
        'birth_year': '출생연도',
        'occupation': '직업',
    }

    for field, label in required_fields.items():
        value = getattr(current_user, field)

        # None 체크
        if value is None:
            raise IncompleteProfileException(
                message=f"프로필을 완성해주세요: {label} 필드가 필수입니다"
            )

        # 문자열 필드 공백 체크
        if isinstance(value, str) and not value.strip():
            raise IncompleteProfileException(
                message=f"프로필을 완성해주세요: {label}을(를) 입력해주세요"
            )

        # birth_year 특수 값 체크 (카카오 플레이스홀더)
        if field == 'birth_year' and value == 0:
            raise IncompleteProfileException(
                message="프로필을 완성해주세요: 출생연도를 입력해주세요"
            )

        # occupation 특수 값 체크
        if field == 'occupation' and value == '미입력':
            raise IncompleteProfileException(
                message="프로필을 완성해주세요: 직업을 입력해주세요"
            )

    return current_user
