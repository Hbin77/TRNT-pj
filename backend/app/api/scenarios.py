from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.user import User
from app.schemas.scenario import ScenarioRequest, ScenarioResponse
from app.services.ai import AIService

router = APIRouter(prefix="/scenarios", tags=["Scenarios"])

ai_service = AIService()


@router.post("/generate", response_model=ScenarioResponse)
async def generate_scenario(request: ScenarioRequest, db: Session = Depends(get_db)):
    """평행세계 시나리오 생성"""
    
    # 사용자 조회
    user = db.query(User).filter(User.id == request.user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="사용자를 찾을 수 없습니다. 먼저 프로필을 생성해주세요."
        )
    
    # 시나리오 생성
    scenario_text = await ai_service.generate_scenario(
        user=user,
        branch=request.branch,
        tone=request.tone,
        genre=request.genre,
        detail_level=request.detail_level,
        scope=request.scope
    )
    
    return ScenarioResponse(
        user_id=request.user_id,
        branch=request.branch,
        tone=request.tone,
        genre=request.genre,
        detail_level=request.detail_level,
        scope=request.scope,
        scenario_text=scenario_text,
        word_count=len(scenario_text)
    )