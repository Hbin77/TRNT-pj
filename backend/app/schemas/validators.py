"""공통 검증 함수"""
from typing import Optional


def validate_not_empty_string(v: Optional[str], field_name: str) -> Optional[str]:
    """
    공백 문자열 검증

    Args:
        v: 검증할 문자열
        field_name: 필드명 (에러 메시지용)

    Returns:
        공백이 제거된 문자열 또는 None

    Raises:
        ValueError: 공백만 입력된 경우
    """
    if v is not None:
        if not v.strip():
            raise ValueError(f'{field_name}은(는) 공백만 입력할 수 없습니다')
        return v.strip()
    return v
