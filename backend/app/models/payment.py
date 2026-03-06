import uuid
from datetime import datetime

from sqlalchemy import Column, String, Integer, DateTime, ForeignKey
from sqlalchemy.orm import relationship

from app.database import Base, GUID


class Payment(Base):
    __tablename__ = "payments"

    # PK
    id = Column(GUID(), primary_key=True, default=uuid.uuid4)

    # FK
    user_id = Column(GUID(), ForeignKey("users.id"), nullable=False)
    subscription_id = Column(GUID(), ForeignKey("subscriptions.id"), nullable=True)

    # 결제 정보
    merchant_uid = Column(String(100), unique=True, nullable=False)
    imp_uid = Column(String(100), nullable=True)  # PortOne 결제 고유 ID
    amount = Column(Integer, nullable=False)
    status = Column(String(20), nullable=False)  # "paid", "failed", "cancelled", "refunded"

    # 결제 결과
    paid_at = Column(DateTime, nullable=True)
    failed_reason = Column(String(500), nullable=True)

    # 시스템
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    # Relationships
    user = relationship("User", backref="payments")
    subscription = relationship("Subscription", backref="payments")
