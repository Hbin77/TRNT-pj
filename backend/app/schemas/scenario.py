from datetime import datetime
from typing import Optional, Literal, List
from uuid import UUID

from pydantic import BaseModel, Field


class BranchInput(BaseModel):
    """분기점 입력"""
    occurred_at: str = Field(..., description="선택 시점 (예: '2020년 고3 겨울')")
    original_choice: str = Field(..., description="실제로 한 선택")
    alternative_choice: str = Field(..., description="만약 이렇게 했다면?")
    context: Optional[str] = Field(None, description="당시 상황, 고민, 환경")


class ScenarioRequest(BaseModel):
    """시나리오 생성 요청"""
    user_id: Optional[UUID] = None  # 인증 도입 후 토큰에서 추출, 비인증 시 직접 전달
    branch: BranchInput

    # 커스터마이징 옵션
    tone: Literal["optimistic", "realistic", "pessimistic"] = "realistic"
    genre: Literal["romance", "success", "healing", "drama"] = "drama"
    detail_level: Literal["summary", "normal", "novel"] = "normal"
    scope: Literal["short", "medium", "long"] = "medium"


class ScenarioResponse(BaseModel):
    """시나리오 생성 응답"""
    scenario_id: Optional[UUID] = None
    user_id: UUID
    branch: BranchInput
    tone: str
    genre: str
    detail_level: str
    scope: str
    scenario_text: str
    word_count: int


class ScenarioDBResponse(BaseModel):
    """DB에서 조회한 시나리오 상세 응답"""
    id: UUID
    user_id: UUID
    branch_data: dict
    tone: str
    genre: str
    detail_level: str
    scope: str
    scenario_text: str
    word_count: int
    created_at: datetime

    class Config:
        from_attributes = True


class ScenarioListItem(BaseModel):
    """시나리오 목록 아이템 (scenario_text 제외)"""
    id: UUID
    user_id: UUID
    branch_data: dict
    tone: str
    genre: str
    detail_level: str
    scope: str
    word_count: int
    created_at: datetime

    class Config:
        from_attributes = True


class ScenarioListResponse(BaseModel):
    """시나리오 목록 응답"""
    total: int
    scenarios: List[ScenarioListItem]
