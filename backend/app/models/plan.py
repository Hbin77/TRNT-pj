import uuid
from datetime import datetime

from sqlalchemy import Column, String, Integer, DateTime, Boolean

from app.database import Base, GUID


class Plan(Base):
    __tablename__ = "plans"

    # PK
    id = Column(GUID(), primary_key=True, default=uuid.uuid4)
    name = Column(String(50), unique=True, nullable=False)  # "free", "premium", "pro"
    display_name = Column(String(100), nullable=False)  # "무료", "프리미엄", "프로"

    # 가격
    price = Column(Integer, nullable=False)  # 월 가격 (원), free=0
    annual_price = Column(Integer, nullable=True)  # 연간 월 환산 가격

    # 제한
    daily_limit = Column(Integer, nullable=False)  # 일일 시나리오 생성 횟수
    monthly_tts_limit = Column(Integer, nullable=False)  # 월 TTS 횟수, -1=무제한
    tts_enabled = Column(Boolean, default=False, nullable=False)
    storage_limit = Column(Integer, nullable=False)  # 저장 가능 시나리오 수, -1=무제한

    # 시스템
    is_active = Column(Boolean, default=True, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
