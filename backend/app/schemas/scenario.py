from typing import Optional, Literal
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
    user_id: UUID
    branch: BranchInput
    
    # 커스터마이징 옵션
    tone: Literal["optimistic", "realistic", "pessimistic"] = "realistic"
    genre: Literal["romance", "success", "healing", "drama"] = "drama"
    detail_level: Literal["summary", "normal", "novel"] = "normal"
    scope: Literal["short", "medium", "long"] = "medium"


class ScenarioResponse(BaseModel):
    """시나리오 생성 응답"""
    user_id: UUID
    branch: BranchInput
    tone: str
    genre: str
    detail_level: str
    scope: str
    scenario_text: str
    word_count: int