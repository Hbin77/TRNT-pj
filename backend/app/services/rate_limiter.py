"""사용량 제한 서비스"""
from datetime import datetime, timedelta
from uuid import UUID

from sqlalchemy.orm import Session
from sqlalchemy import func

from app.config import settings
from app.models.usage_log import UsageLog
from app.exceptions import RateLimitExceededException


class RateLimiterService:
    """일일 사용량 제한 서비스"""

    def __init__(self, db: Session):
        self.db = db
        self.daily_limit = settings.DAILY_FREE_LIMIT

    def check_and_record(self, user_id: UUID, action: str = "scenario_generation") -> None:
        """
        일일 사용량 체크 및 기록

        Args:
            user_id: 사용자 ID
            action: 작업 유형 (기본값: "scenario_generation")

        Raises:
            RateLimitExceededException: 일일 제한 초과 시
        """
        # 오늘 00:00:00부터의 사용량 조회
        today_start = datetime.utcnow().replace(hour=0, minute=0, second=0, microsecond=0)

        usage_count = (
            self.db.query(func.count(UsageLog.id))
            .filter(
                UsageLog.user_id == user_id,
                UsageLog.action == action,
                UsageLog.created_at >= today_start
            )
            .scalar()
        )

        if usage_count >= self.daily_limit:
            # 다음 날 00:00:00 계산
            tomorrow = today_start + timedelta(days=1)
            hours_until_reset = int((tomorrow - datetime.utcnow()).total_seconds() / 3600)
            reset_time = f"{hours_until_reset}시간 후" if hours_until_reset > 0 else "곧"

            raise RateLimitExceededException(limit=self.daily_limit, reset_time=reset_time)

        # 사용 기록 저장
        log = UsageLog(user_id=user_id, action=action)
        self.db.add(log)
        self.db.commit()

    def get_usage_count(self, user_id: UUID, action: str = "scenario_generation") -> int:
        """
        오늘 사용량 조회

        Args:
            user_id: 사용자 ID
            action: 작업 유형

        Returns:
            오늘 사용 횟수
        """
        today_start = datetime.utcnow().replace(hour=0, minute=0, second=0, microsecond=0)

        return (
            self.db.query(func.count(UsageLog.id))
            .filter(
                UsageLog.user_id == user_id,
                UsageLog.action == action,
                UsageLog.created_at >= today_start
            )
            .scalar()
        )

    def get_remaining_count(self, user_id: UUID, action: str = "scenario_generation") -> int:
        """
        남은 사용 가능 횟수

        Args:
            user_id: 사용자 ID
            action: 작업 유형

        Returns:
            남은 횟수
        """
        used = self.get_usage_count(user_id, action)
        return max(0, self.daily_limit - used)
