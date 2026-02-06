import uuid
from datetime import datetime

from sqlalchemy import Column, String, Integer, Text, DateTime, Boolean

from app.database import Base, GUID


class User(Base):
    __tablename__ = "users"

    # PK
    id = Column(GUID(), primary_key=True, default=uuid.uuid4)
    email = Column(String(255), unique=True, nullable=True)

    # 인증 관련
    hashed_password = Column(String(255), nullable=True)  # OAuth 사용자는 null
    auth_provider = Column(String(20), nullable=False, default="email")  # "email", "kakao", "google"
    kakao_id = Column(String(100), unique=True, nullable=True)
    google_id = Column(String(100), unique=True, nullable=True)
    is_active = Column(Boolean, default=True, nullable=False)
    
    # 이메일 인증
    is_verified = Column(Boolean, default=False, nullable=False)
    verification_code = Column(String(6), nullable=True)

    # 기본 정보
    name = Column(String(100), nullable=False)
    birth_year = Column(Integer, nullable=False)
    gender = Column(String(20), nullable=True)

    # 현재 상태
    occupation = Column(String(100), nullable=False)
    education = Column(String(50), nullable=True)
    major = Column(String(100), nullable=True)
    residence = Column(String(100), nullable=True)
    relationship_status = Column(String(50), nullable=True)

    # 배경 스토리
    life_background = Column(Text, nullable=False)
    key_events = Column(Text, nullable=True)

    # 성향
    personality = Column(String(100), nullable=True)
    values = Column(String(200), nullable=True)

    # 시스템
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)