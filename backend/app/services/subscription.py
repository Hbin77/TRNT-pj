"""구독/결제 서비스"""
import logging
from datetime import datetime, timedelta
from typing import Optional
from uuid import UUID

import httpx
from sqlalchemy.orm import Session

from app.config import settings
from app.exceptions import AuthenticationException, PermissionDeniedException
from app.models.payment import Payment
from app.models.plan import Plan
from app.models.subscription import Subscription

logger = logging.getLogger(__name__)


class SubscriptionService:
    """구독/결제 서비스"""

    def __init__(self, db: Session):
        self.db = db

    def get_plans(self) -> list[Plan]:
        """활성 요금제 목록"""
        return self.db.query(Plan).filter(Plan.is_active == True).all()

    def get_user_subscription(self, user_id: UUID) -> Optional[Subscription]:
        """사용자의 현재 활성 구독"""
        return self.db.query(Subscription).filter(
            Subscription.user_id == user_id,
            Subscription.status.in_(["active", "cancelled"]),
            Subscription.current_period_end > datetime.utcnow()
        ).first()

    def get_user_plan(self, user_id: UUID) -> Plan:
        """사용자의 현재 플랜 (구독 없으면 free plan 반환)"""
        subscription = self.get_user_subscription(user_id)
        if subscription:
            return subscription.plan

        # free plan 반환
        free_plan = self.db.query(Plan).filter(Plan.name == "free").first()
        if not free_plan:
            # free plan이 DB에 없으면 기본값 생성
            free_plan = Plan(
                name="free",
                display_name="무료",
                price=0,
                daily_limit=2,
                monthly_tts_limit=0,
                tts_enabled=False,
                storage_limit=5,
                is_active=True
            )
            self.db.add(free_plan)
            self.db.commit()
            self.db.refresh(free_plan)
        return free_plan

    def create_subscription(
        self, user_id: UUID, plan_id: UUID, imp_uid: str, merchant_uid: str
    ) -> Subscription:
        """
        결제 검증 후 구독 생성.
        1. PortOne API로 결제 검증
        2. Plan 가격과 일치하는지 확인
        3. 기존 구독 있으면 업그레이드 처리
        4. Subscription + Payment 레코드 생성
        """
        # Plan 조회
        plan = self.db.query(Plan).filter(Plan.id == plan_id).first()
        if not plan:
            raise PermissionDeniedException(message="존재하지 않는 요금제입니다.")

        # PortOne 결제 검증
        payment_data = self._verify_payment_with_portone(imp_uid)
        if payment_data["status"] != "paid":
            raise PermissionDeniedException(message="결제가 완료되지 않았습니다.")
        if payment_data["amount"] != plan.price:
            raise PermissionDeniedException(
                message=f"결제 금액 불일치: 예상 {plan.price}원, 실제 {payment_data['amount']}원"
            )

        now = datetime.utcnow()

        # 기존 구독 처리
        existing = self.db.query(Subscription).filter(
            Subscription.user_id == user_id,
            Subscription.status.in_(["active", "cancelled"])
        ).first()
        if existing:
            existing.status = "expired"
            existing.updated_at = now

        # Subscription 생성
        subscription = Subscription(
            user_id=user_id,
            plan_id=plan_id,
            status="active",
            current_period_start=now,
            current_period_end=now + timedelta(days=30),
        )
        self.db.add(subscription)
        self.db.flush()  # subscription.id 확보

        # Payment 생성
        payment = Payment(
            user_id=user_id,
            subscription_id=subscription.id,
            merchant_uid=merchant_uid,
            imp_uid=imp_uid,
            amount=plan.price,
            status="paid",
            paid_at=now,
        )
        self.db.add(payment)
        self.db.commit()
        self.db.refresh(subscription)

        logger.info(f"구독 생성: user={user_id}, plan={plan.name}")
        return subscription

    def cancel_subscription(self, user_id: UUID) -> Subscription:
        """구독 취소 (기간 만료 시까지 유지)"""
        subscription = self.db.query(Subscription).filter(
            Subscription.user_id == user_id,
            Subscription.status == "active"
        ).first()
        if not subscription:
            raise PermissionDeniedException(message="활성 구독이 없습니다.")

        subscription.status = "cancelled"
        subscription.cancelled_at = datetime.utcnow()
        self.db.commit()
        self.db.refresh(subscription)

        logger.info(f"구독 취소: user={user_id}")
        return subscription

    def _verify_payment_with_portone(self, imp_uid: str) -> dict:
        """
        PortOne REST API로 결제 정보 조회.
        1. 토큰 발급
        2. 결제 조회
        """
        # 1. 토큰 발급
        token_response = httpx.post(
            "https://api.iamport.kr/users/getToken",
            json={
                "imp_key": settings.PORTONE_API_KEY,
                "imp_secret": settings.PORTONE_API_SECRET,
            },
            timeout=10.0,
        )
        token_data = token_response.json()
        if token_data.get("code") != 0:
            logger.error(f"PortOne 토큰 발급 실패: {token_data}")
            raise PermissionDeniedException(message="결제 검증 서버 연결 실패")

        access_token = token_data["response"]["access_token"]

        # 2. 결제 정보 조회
        payment_response = httpx.get(
            f"https://api.iamport.kr/payments/{imp_uid}",
            headers={"Authorization": access_token},
            timeout=10.0,
        )
        payment_data = payment_response.json()
        if payment_data.get("code") != 0:
            logger.error(f"PortOne 결제 조회 실패: {payment_data}")
            raise PermissionDeniedException(message="결제 정보를 조회할 수 없습니다.")

        response = payment_data["response"]
        return {
            "amount": response["amount"],
            "status": response["status"],
        }

    def process_webhook(self, imp_uid: str, merchant_uid: str, status: str):
        """PortOne 웹훅 처리: 결제 상태 업데이트"""
        payment = self.db.query(Payment).filter(
            Payment.merchant_uid == merchant_uid
        ).first()

        if not payment:
            logger.warning(f"웹훅: 결제 레코드 없음 merchant_uid={merchant_uid}")
            return

        # 상태 매핑
        status_map = {
            "paid": "paid",
            "cancelled": "cancelled",
            "failed": "failed",
            "refunded": "refunded",
        }
        new_status = status_map.get(status)
        if new_status:
            payment.status = new_status

        # 결제 취소/환불 시 구독도 처리
        if status in ("cancelled", "refunded") and payment.subscription_id:
            subscription = self.db.query(Subscription).filter(
                Subscription.id == payment.subscription_id
            ).first()
            if subscription and subscription.status == "active":
                subscription.status = "expired"
                subscription.updated_at = datetime.utcnow()

        self.db.commit()
        logger.info(f"웹훅 처리: merchant_uid={merchant_uid}, status={status}")

    def get_payment_history(self, user_id: UUID) -> list[Payment]:
        """사용자 결제 내역"""
        return self.db.query(Payment).filter(
            Payment.user_id == user_id
        ).order_by(Payment.created_at.desc()).all()
