from typing import List, Optional
from uuid import UUID

from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.user import User
from app.models.scenario import Scenario
from app.schemas.scenario import (
    ScenarioRequest,
    ScenarioResponse,
    ScenarioDBResponse,
    ScenarioListResponse,
    ScenarioListItem
)
from app.services.ai import AIService
from app.services.rate_limiter import RateLimiterService
from app.dependencies.auth import get_current_active_user
from app.dependencies.profile import require_complete_profile
from app.exceptions import UserNotFoundException, ScenarioNotFoundException, PermissionDeniedException, AIServiceException, TRNTException

router = APIRouter(prefix="/scenarios", tags=["Scenarios"])

ai_service = AIService()


@router.post("/generate", response_model=ScenarioResponse)
async def generate_scenario(
    request: ScenarioRequest,
    save: bool = Query(True, description="시나리오 DB 저장 여부"),
    current_user: User = Depends(require_complete_profile),
    db: Session = Depends(get_db)
):
    """평행세계 시나리오 생성 (인증 필요, 프로필 완성 필수)"""

    # 토큰에서 추출한 사용자 사용
    user = current_user

    # 일일 사용량 제한 체크 및 기록
    rate_limiter = RateLimiterService(db)
    rate_limiter.check_and_record(user_id=user.id, email=user.email)

    # 시나리오 생성
    try:
        scenario_text = await ai_service.generate_scenario(
            user=user,
            branch=request.branch,
            tone=request.tone,
            genre=request.genre,
            detail_level=request.detail_level,
            scope=request.scope
        )
    except TRNTException:
        raise
    except Exception as e:
        import logging
        logging.getLogger(__name__).error(f"Scenario generation failed: {type(e).__name__}: {e}", exc_info=True)
        raise AIServiceException(
            message=f"시나리오 생성 중 오류가 발생했습니다: {type(e).__name__}",
            details={"error": str(e)}
        )

    scenario_id = None

    # DB 저장
    if save:
        scenario = Scenario(
            user_id=user.id,
            branch_data=request.branch.model_dump(),
            tone=request.tone,
            genre=request.genre,
            detail_level=request.detail_level,
            scope=request.scope,
            scenario_text=scenario_text,
            word_count=len(scenario_text.split())
        )
        db.add(scenario)
        db.commit()
        db.refresh(scenario)
        scenario_id = scenario.id

    return ScenarioResponse(
        scenario_id=scenario_id,
        user_id=user.id,
        branch=request.branch,
        tone=request.tone,
        genre=request.genre,
        detail_level=request.detail_level,
        scope=request.scope,
        scenario_text=scenario_text,
        word_count=len(scenario_text.split())
    )


@router.get("", response_model=ScenarioListResponse)
def get_scenarios(
    skip: int = Query(0, ge=0, description="건너뛸 개수"),
    limit: int = Query(20, ge=1, le=100, description="가져올 최대 개수"),
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """내 시나리오 목록 조회 (인증 필요, scenario_text 제외)"""

    # 총 개수 조회
    total = db.query(Scenario).filter(Scenario.user_id == current_user.id).count()

    # 시나리오 목록 조회 (최신순)
    scenarios = (
        db.query(Scenario)
        .filter(Scenario.user_id == current_user.id)
        .order_by(Scenario.created_at.desc())
        .offset(skip)
        .limit(limit)
        .all()
    )

    return ScenarioListResponse(
        total=total,
        scenarios=[ScenarioListItem.model_validate(s) for s in scenarios]
    )


@router.get("/{scenario_id}", response_model=ScenarioDBResponse)
def get_scenario(
    scenario_id: UUID,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """시나리오 상세 조회 (인증 필요, 본인 시나리오만)"""

    scenario = db.query(Scenario).filter(Scenario.id == scenario_id).first()
    if not scenario:
        raise ScenarioNotFoundException(scenario_id=str(scenario_id))

    # 소유권 확인
    if scenario.user_id != current_user.id:
        raise PermissionDeniedException(message="다른 사용자의 시나리오에 접근할 수 없습니다.")

    return ScenarioDBResponse.model_validate(scenario)


@router.delete("/{scenario_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_scenario(
    scenario_id: UUID,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """시나리오 삭제 (인증 필요, 본인 시나리오만)"""

    scenario = db.query(Scenario).filter(Scenario.id == scenario_id).first()
    if not scenario:
        raise ScenarioNotFoundException(scenario_id=str(scenario_id))

    # 소유권 확인
    if scenario.user_id != current_user.id:
        raise PermissionDeniedException(message="다른 사용자의 시나리오를 삭제할 수 없습니다.")

    db.delete(scenario)
    db.commit()
    return None
