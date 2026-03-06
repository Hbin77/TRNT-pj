"""구독/결제 API 라우터"""
import logging
from fastapi import APIRouter, Depends, Request, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.dependencies.auth import get_current_active_user
from app.models.user import User
from app.schemas.subscription import (
    PlanResponse,
    SubscriptionResponse,
    SubscriptionCreateRequest,
    PaymentHistoryItem,
    PaymentHistoryResponse,
)
from app.services.subscription import SubscriptionService

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/subscriptions", tags=["Subscriptions"])


@router.get("/plans", response_model=list[PlanResponse])
def get_plans(db: Session = Depends(get_db)):
    """요금제 목록 (공개)"""
    service = SubscriptionService(db)
    plans = service.get_plans()
    return [PlanResponse.model_validate(p) for p in plans]


@router.get("/me", response_model=SubscriptionResponse | None)
def get_my_subscription(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db),
):
    """내 구독 상태 + 플랜 정보"""
    service = SubscriptionService(db)
    subscription = service.get_user_subscription(current_user.id)
    if not subscription:
        return None
    return SubscriptionResponse.model_validate(subscription)


@router.post("/", response_model=SubscriptionResponse, status_code=status.HTTP_201_CREATED)
def create_subscription(
    request: SubscriptionCreateRequest,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db),
):
    """결제 완료 후 구독 생성. PortOne imp_uid로 결제 검증."""
    service = SubscriptionService(db)
    subscription = service.create_subscription(
        user_id=current_user.id,
        plan_id=request.plan_id,
        imp_uid=request.imp_uid,
        merchant_uid=request.merchant_uid,
    )
    return SubscriptionResponse.model_validate(subscription)


@router.post("/cancel", response_model=SubscriptionResponse)
def cancel_subscription(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db),
):
    """구독 취소 (기간 만료 시까지 유지)"""
    service = SubscriptionService(db)
    subscription = service.cancel_subscription(current_user.id)
    return SubscriptionResponse.model_validate(subscription)


@router.post("/webhooks/portone")
async def portone_webhook(request: Request, db: Session = Depends(get_db)):
    """PortOne 웹훅 수신"""
    body = await request.json()
    imp_uid = body.get("imp_uid", "")
    merchant_uid = body.get("merchant_uid", "")
    webhook_status = body.get("status", "")

    logger.info(f"PortOne 웹훅 수신: imp_uid={imp_uid}, status={webhook_status}")

    service = SubscriptionService(db)
    service.process_webhook(imp_uid, merchant_uid, webhook_status)

    return {"status": "ok"}


@router.get("/payments", response_model=PaymentHistoryResponse)
def get_payment_history(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db),
):
    """결제 내역"""
    service = SubscriptionService(db)
    payments = service.get_payment_history(current_user.id)
    return PaymentHistoryResponse(
        payments=[PaymentHistoryItem.model_validate(p) for p in payments],
        total=len(payments),
    )
