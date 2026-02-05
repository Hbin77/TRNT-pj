"""토큰 블랙리스트 모델"""
import uuid
from datetime import datetime

from sqlalchemy import Column, String, DateTime

from app.database import Base, GUID


class TokenBlacklist(Base):
    """토큰 블랙리스트 (로그아웃된 토큰)"""
    __tablename__ = "token_blacklist"

    id = Column(GUID(), primary_key=True, default=uuid.uuid4)
    token = Column(String(500), unique=True, nullable=False, index=True)
    blacklisted_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    expires_at = Column(DateTime, nullable=False, index=True)
