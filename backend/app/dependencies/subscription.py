"""구독 의존성"""
from fastapi import Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.dependencies.auth import get_current_active_user
from app.exceptions import PermissionDeniedException
from app.models.user import User
from app.services.subscription import SubscriptionService


async def get_premium_user(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db),
) -> User:
    """프리미엄 기능 접근 시 구독 상태 체크"""
    service = SubscriptionService(db)
    plan = service.get_user_plan(current_user.id)
    if not plan.tts_enabled:
        raise PermissionDeniedException(message="프리미엄 구독이 필요합니다.")
    return current_user
