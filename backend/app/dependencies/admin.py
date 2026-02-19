"""관리자 권한 의존성"""
from fastapi import Depends
from app.dependencies.auth import get_current_active_user
from app.models.user import User
from app.config import settings
from app.exceptions import PermissionDeniedException


def get_admin_user(current_user: User = Depends(get_current_active_user)) -> User:
    """MASTER_EMAILS 목록에 있는 사용자만 통과"""
    master_emails = [e.strip() for e in settings.MASTER_EMAILS.split(',') if e.strip()]
    if current_user.email not in master_emails:
        raise PermissionDeniedException(message="관리자 권한이 필요합니다.")
    return current_user
