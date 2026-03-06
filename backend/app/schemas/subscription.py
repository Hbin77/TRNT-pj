"""구독/결제 관련 스키마"""
from datetime import datetime
from typing import Optional, List
from uuid import UUID
from pydantic import BaseModel


class PlanResponse(BaseModel):
    """플랜 응답"""
    id: UUID
    name: str
    display_name: str
    price: int
    annual_price: Optional[int] = None
    daily_limit: int
    monthly_tts_limit: int
    tts_enabled: bool
    storage_limit: int

    class Config:
        from_attributes = True


class SubscriptionResponse(BaseModel):
    """구독 응답"""
    id: UUID
    plan: PlanResponse
    status: str
    current_period_start: datetime
    current_period_end: datetime
    cancelled_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class SubscriptionCreateRequest(BaseModel):
    """구독 생성 요청"""
    imp_uid: str
    merchant_uid: str
    plan_id: UUID


class PaymentHistoryItem(BaseModel):
    """결제 내역 항목"""
    id: UUID
    amount: int
    status: str
    paid_at: Optional[datetime] = None
    created_at: datetime

    class Config:
        from_attributes = True


class PaymentHistoryResponse(BaseModel):
    """결제 내역 응답"""
    payments: List[PaymentHistoryItem]
    total: int
