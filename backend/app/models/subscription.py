import uuid
from datetime import datetime

from sqlalchemy import Column, String, DateTime, ForeignKey
from sqlalchemy.orm import relationship

from app.database import Base, GUID


class Subscription(Base):
    __tablename__ = "subscriptions"

    # PK
    id = Column(GUID(), primary_key=True, default=uuid.uuid4)

    # FK
    user_id = Column(GUID(), ForeignKey("users.id"), unique=True, nullable=False)
    plan_id = Column(GUID(), ForeignKey("plans.id"), nullable=False)

    # 상태
    status = Column(String(20), nullable=False)  # "active", "cancelled", "expired", "past_due"
    billing_key = Column(String(255), nullable=True)  # PortOne 빌링키

    # 구독 기간
    current_period_start = Column(DateTime, nullable=False)
    current_period_end = Column(DateTime, nullable=False)
    cancelled_at = Column(DateTime, nullable=True)

    # 시스템
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    # Relationships
    user = relationship("User", backref="subscription", uselist=False)
    plan = relationship("Plan", backref="subscriptions")
