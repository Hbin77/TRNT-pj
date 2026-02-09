import uuid
from datetime import datetime

from sqlalchemy import Column, String, Integer, Text, DateTime, ForeignKey
from sqlalchemy.dialects.postgresql import JSON

from app.database import Base, GUID


class Scenario(Base):
    __tablename__ = "scenarios"

    id = Column(GUID(), primary_key=True, default=uuid.uuid4)
    user_id = Column(GUID(), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)

    # 분기점 정보 (JSON)
    branch_data = Column(JSON, nullable=False)

    # 커스터마이징 옵션
    tone = Column(String(20), nullable=False)
    genre = Column(String(20), nullable=False)
    detail_level = Column(String(20), nullable=False)
    scope = Column(String(20), nullable=False)

    # 생성된 시나리오
    scenario_text = Column(Text, nullable=False)
    word_count = Column(Integer, nullable=False)

    # 피드백
    rating = Column(String(10), nullable=True)  # "like" / "dislike"

    # 이어쓰기
    parent_scenario_id = Column(GUID(), ForeignKey("scenarios.id"), nullable=True)

    # 시스템
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
