import json
import logging
from typing import List, Optional
from uuid import UUID
from pathlib import Path

from fastapi import APIRouter, Depends, Query, status
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session

from app.config import settings
from app.database import get_db
from app.models.user import User
from app.models.scenario import Scenario
from app.schemas.scenario import (
    ScenarioRequest,
    ScenarioResponse,
    ScenarioDBResponse,
    ScenarioListResponse,
    ScenarioListItem,
    BranchInput,
    FeedbackRequest,
    FeedbackResponse,
    ContinuationRequest,
)
from app.services.ai import AIService
from app.services.rate_limiter import RateLimiterService
from app.dependencies.auth import get_current_active_user
from app.dependencies.profile import require_complete_profile
from app.exceptions import UserNotFoundException, ScenarioNotFoundException, PermissionDeniedException, AIServiceException, TRNTException

logger = logging.getLogger(__name__)

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
        logger.error(f"Scenario generation failed: {type(e).__name__}: {e}", exc_info=True)
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


@router.post("/generate/stream")
async def generate_scenario_stream(
    request: ScenarioRequest,
    current_user: User = Depends(require_complete_profile),
    db: Session = Depends(get_db)
):
    """평행세계 시나리오 스트리밍 생성 (SSE)"""

    user = current_user

    # 일일 사용량 제한 체크 및 기록
    rate_limiter = RateLimiterService(db)
    rate_limiter.check_and_record(user_id=user.id, email=user.email)

    async def event_stream():
        full_text = []
        in_think = False

        try:
            async for chunk in ai_service.generate_scenario_stream(
                user=user,
                branch=request.branch,
                tone=request.tone,
                genre=request.genre,
                detail_level=request.detail_level,
                scope=request.scope
            ):
                full_text.append(chunk)
                # <think> 태그 내용은 프론트에 보내지 않음
                if '<think>' in chunk:
                    in_think = True
                if in_think:
                    if '</think>' in chunk:
                        in_think = False
                    continue
                yield f"data: {json.dumps({'type': 'chunk', 'content': chunk}, ensure_ascii=False)}\n\n"

            # 스트림 완료 — 후처리 및 DB 저장
            raw_text = "".join(full_text)
            cleaned_text = ai_service._strip_think_tags(raw_text)
            cleaned_text = ai_service._clean_foreign_chars(cleaned_text)

            scenario = Scenario(
                user_id=user.id,
                branch_data=request.branch.model_dump(),
                tone=request.tone,
                genre=request.genre,
                detail_level=request.detail_level,
                scope=request.scope,
                scenario_text=cleaned_text,
                word_count=len(cleaned_text.split())
            )
            db.add(scenario)
            db.commit()
            db.refresh(scenario)

            yield f"data: {json.dumps({'type': 'done', 'scenario_id': str(scenario.id)}, ensure_ascii=False)}\n\n"

        except Exception as e:
            logger.error(f"Stream generation failed: {type(e).__name__}: {e}", exc_info=True)
            yield f"data: {json.dumps({'type': 'error', 'message': str(e)}, ensure_ascii=False)}\n\n"

    return StreamingResponse(
        event_stream(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no",
        }
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


# Phase 4: 피드백
@router.post("/{scenario_id}/feedback", response_model=FeedbackResponse)
def feedback_scenario(
    scenario_id: UUID,
    request: FeedbackRequest,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """시나리오 피드백 (좋아요/싫어요)"""

    scenario = db.query(Scenario).filter(Scenario.id == scenario_id).first()
    if not scenario:
        raise ScenarioNotFoundException(scenario_id=str(scenario_id))

    if scenario.user_id != current_user.id:
        raise PermissionDeniedException(message="다른 사용자의 시나리오에 피드백할 수 없습니다.")

    scenario.rating = request.rating
    db.commit()

    # "like" 시 참조 자료로 자동 저장
    if request.rating == "like":
        try:
            _save_liked_scenario(scenario)
        except Exception as e:
            logger.warning(f"좋아요 시나리오 저장 실패 (무시): {e}")

    return FeedbackResponse(
        scenario_id=scenario.id,
        rating=request.rating,
        message="피드백이 반영되었습니다."
    )


def _save_liked_scenario(scenario: Scenario):
    """좋아요 받은 시나리오를 참조 자료로 저장"""
    novels_dir = ai_service._novels_dir
    examples_dir = novels_dir / "contents" / "examples"
    examples_dir.mkdir(parents=True, exist_ok=True)

    scenario_id_short = str(scenario.id)[:8]
    filename = f"liked_{scenario.genre}_{scenario.tone}_{scenario_id_short}.md"
    filepath = examples_dir / filename

    branch = scenario.branch_data or {}
    content = f"""# 좋아요 시나리오: {scenario.genre} / {scenario.tone}

**장르**: {scenario.genre} | **톤**: {scenario.tone} | **범위**: {scenario.scope}
**분기점**: {branch.get('occurred_at', '알 수 없음')}

---

{scenario.scenario_text}
"""
    filepath.write_text(content, encoding="utf-8")
    logger.info(f"좋아요 시나리오 저장: {filepath}")


# Phase 5: 이어쓰기
@router.post("/{scenario_id}/continue", response_model=ScenarioResponse)
async def continue_scenario(
    scenario_id: UUID,
    request: ContinuationRequest,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """시나리오 이어쓰기"""

    scenario = db.query(Scenario).filter(Scenario.id == scenario_id).first()
    if not scenario:
        raise ScenarioNotFoundException(scenario_id=str(scenario_id))

    if scenario.user_id != current_user.id:
        raise PermissionDeniedException(message="다른 사용자의 시나리오를 이어쓸 수 없습니다.")

    # 일일 사용량 제한 체크 및 기록
    rate_limiter = RateLimiterService(db)
    rate_limiter.check_and_record(user_id=current_user.id, email=current_user.email)

    branch = BranchInput(**scenario.branch_data)

    try:
        continuation_text = await ai_service.continue_scenario(
            user=current_user,
            existing_text=scenario.scenario_text,
            branch=branch,
            tone=scenario.tone,
            genre=scenario.genre,
            continuation_direction=request.continuation_direction
        )
    except TRNTException:
        raise
    except Exception as e:
        logger.error(f"Continuation failed: {type(e).__name__}: {e}", exc_info=True)
        raise AIServiceException(
            message=f"시나리오 이어쓰기 중 오류가 발생했습니다: {type(e).__name__}",
            details={"error": str(e)}
        )

    # 새 시나리오로 DB 저장
    new_scenario = Scenario(
        user_id=current_user.id,
        branch_data=scenario.branch_data,
        tone=scenario.tone,
        genre=scenario.genre,
        detail_level=scenario.detail_level,
        scope=scenario.scope,
        scenario_text=continuation_text,
        word_count=len(continuation_text.split()),
        parent_scenario_id=scenario.id
    )
    db.add(new_scenario)
    db.commit()
    db.refresh(new_scenario)

    return ScenarioResponse(
        scenario_id=new_scenario.id,
        user_id=current_user.id,
        branch=branch,
        tone=scenario.tone,
        genre=scenario.genre,
        detail_level=scenario.detail_level,
        scope=scenario.scope,
        scenario_text=continuation_text,
        word_count=len(continuation_text.split())
    )


@router.post("/{scenario_id}/continue/stream")
async def continue_scenario_stream(
    scenario_id: UUID,
    request: ContinuationRequest,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """시나리오 이어쓰기 (스트리밍)"""

    scenario = db.query(Scenario).filter(Scenario.id == scenario_id).first()
    if not scenario:
        raise ScenarioNotFoundException(scenario_id=str(scenario_id))

    if scenario.user_id != current_user.id:
        raise PermissionDeniedException(message="다른 사용자의 시나리오를 이어쓸 수 없습니다.")

    rate_limiter = RateLimiterService(db)
    rate_limiter.check_and_record(user_id=current_user.id, email=current_user.email)

    branch = BranchInput(**scenario.branch_data)

    async def event_stream():
        full_text = []
        in_think = False

        try:
            async for chunk in ai_service.continue_scenario_stream(
                user=current_user,
                existing_text=scenario.scenario_text,
                branch=branch,
                tone=scenario.tone,
                genre=scenario.genre,
                continuation_direction=request.continuation_direction
            ):
                full_text.append(chunk)
                if '<think>' in chunk:
                    in_think = True
                if in_think:
                    if '</think>' in chunk:
                        in_think = False
                    continue
                yield f"data: {json.dumps({'type': 'chunk', 'content': chunk}, ensure_ascii=False)}\n\n"

            raw_text = "".join(full_text)
            cleaned_text = ai_service._strip_think_tags(raw_text)
            cleaned_text = ai_service._clean_foreign_chars(cleaned_text)

            new_scenario = Scenario(
                user_id=current_user.id,
                branch_data=scenario.branch_data,
                tone=scenario.tone,
                genre=scenario.genre,
                detail_level=scenario.detail_level,
                scope=scenario.scope,
                scenario_text=cleaned_text,
                word_count=len(cleaned_text.split()),
                parent_scenario_id=scenario.id
            )
            db.add(new_scenario)
            db.commit()
            db.refresh(new_scenario)

            yield f"data: {json.dumps({'type': 'done', 'scenario_id': str(new_scenario.id)}, ensure_ascii=False)}\n\n"

        except Exception as e:
            logger.error(f"Stream continuation failed: {type(e).__name__}: {e}", exc_info=True)
            yield f"data: {json.dumps({'type': 'error', 'message': str(e)}, ensure_ascii=False)}\n\n"

    return StreamingResponse(
        event_stream(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no",
        }
    )
