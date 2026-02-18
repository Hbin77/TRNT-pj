import json
import logging
from typing import List, Optional
from uuid import UUID
from pathlib import Path

from fastapi import APIRouter, Depends, Query, status
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session

from app.config import settings
from app.database import get_db, SessionLocal
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
from app.services.tts import TTSService
from app.services.image import ImageService
from app.services.rate_limiter import RateLimiterService
from app.dependencies.auth import get_current_active_user
from app.dependencies.profile import require_complete_profile
from app.exceptions import UserNotFoundException, ScenarioNotFoundException, PermissionDeniedException, AIServiceException, TRNTException

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/scenarios", tags=["Scenarios"])

ai_service = AIService()
tts_service = TTSService()
image_service = ImageService()


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

    # StreamingResponse 반환 후 DB 세션이 닫히므로,
    # generator 진입 전에 필요한 데이터를 모두 추출
    db.refresh(user)
    user_id = user.id
    branch_data = request.branch.model_dump()
    tone = request.tone
    genre = request.genre
    detail_level = request.detail_level
    scope = request.scope
    db.expunge(user)

    async def event_stream():
        full_text = []
        in_think = False

        try:
            async for chunk in ai_service.generate_scenario_stream(
                user=user,
                branch=request.branch,
                tone=tone,
                genre=genre,
                detail_level=detail_level,
                scope=scope
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

            # 스트림 완료 — 후처리 및 DB 저장 (새 세션 사용)
            raw_text = "".join(full_text)
            cleaned_text = ai_service._strip_think_tags(raw_text)
            cleaned_text = ai_service._clean_foreign_chars(cleaned_text)

            save_db = SessionLocal()
            try:
                scenario = Scenario(
                    user_id=user_id,
                    branch_data=branch_data,
                    tone=tone,
                    genre=genre,
                    detail_level=detail_level,
                    scope=scope,
                    scenario_text=cleaned_text,
                    word_count=len(cleaned_text.split())
                )
                save_db.add(scenario)
                save_db.commit()
                save_db.refresh(scenario)

                yield f"data: {json.dumps({'type': 'done', 'scenario_id': str(scenario.id)}, ensure_ascii=False)}\n\n"
            finally:
                save_db.close()

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

    # StreamingResponse 반환 후 DB 세션이 닫히므로,
    # generator 진입 전에 필요한 데이터를 모두 추출
    db.refresh(current_user)
    user_id = current_user.id
    existing_text = scenario.scenario_text
    branch = BranchInput(**scenario.branch_data)
    branch_data = scenario.branch_data
    tone = scenario.tone
    genre = scenario.genre
    detail_level = scenario.detail_level
    scope = scenario.scope
    parent_id = scenario.id
    continuation_direction = request.continuation_direction
    db.expunge(current_user)

    async def event_stream():
        full_text = []
        in_think = False

        try:
            async for chunk in ai_service.continue_scenario_stream(
                user=current_user,
                existing_text=existing_text,
                branch=branch,
                tone=tone,
                genre=genre,
                continuation_direction=continuation_direction
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

            save_db = SessionLocal()
            try:
                new_scenario = Scenario(
                    user_id=user_id,
                    branch_data=branch_data,
                    tone=tone,
                    genre=genre,
                    detail_level=detail_level,
                    scope=scope,
                    scenario_text=cleaned_text,
                    word_count=len(cleaned_text.split()),
                    parent_scenario_id=parent_id
                )
                save_db.add(new_scenario)
                save_db.commit()
                save_db.refresh(new_scenario)

                yield f"data: {json.dumps({'type': 'done', 'scenario_id': str(new_scenario.id)}, ensure_ascii=False)}\n\n"
            finally:
                save_db.close()

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


# Phase 6: TTS 오디오 낭독
@router.post("/{scenario_id}/tts")
async def generate_tts(
    scenario_id: UUID,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """시나리오 텍스트를 음성으로 변환 (OpenAI TTS)"""

    scenario = db.query(Scenario).filter(Scenario.id == scenario_id).first()
    if not scenario:
        raise ScenarioNotFoundException(scenario_id=str(scenario_id))

    if scenario.user_id != current_user.id:
        raise PermissionDeniedException(message="다른 사용자의 시나리오에 접근할 수 없습니다.")

    try:
        audio_bytes = await tts_service.generate_audio(scenario.scenario_text)
    except AIServiceException:
        raise
    except Exception as e:
        logger.error(f"TTS generation failed: {type(e).__name__}: {e}", exc_info=True)
        error_str = str(e).lower()
        if any(kw in error_str for kw in ['quota', 'billing', 'insufficient_quota']):
            message = "API 크레딧이 부족합니다. 관리자에게 문의해주세요."
            error_type = "quota"
        elif 'rate_limit' in error_str or '429' in error_str:
            message = "요청이 너무 많습니다. 잠시 후 다시 시도해주세요."
            error_type = "rate_limit"
        else:
            message = "음성 생성 중 오류가 발생했습니다."
            error_type = "server_error"
        raise AIServiceException(
            message=message,
            details={"error": str(e), "error_type": error_type}
        )

    return StreamingResponse(
        iter([audio_bytes]),
        media_type="audio/mpeg",
        headers={"Content-Disposition": f"inline; filename=scenario_{scenario_id}.mp3"}
    )


# Phase 7: DALL-E 커버 이미지
@router.post("/{scenario_id}/generate-cover")
async def generate_cover(
    scenario_id: UUID,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """시나리오 커버 이미지 생성 (DALL-E)"""

    scenario = db.query(Scenario).filter(Scenario.id == scenario_id).first()
    if not scenario:
        raise ScenarioNotFoundException(scenario_id=str(scenario_id))

    if scenario.user_id != current_user.id:
        raise PermissionDeniedException(message="다른 사용자의 시나리오에 접근할 수 없습니다.")

    try:
        cover_url = await image_service.generate_cover(
            scenario_text=scenario.scenario_text,
            genre=scenario.genre,
            tone=scenario.tone,
        )
    except Exception as e:
        logger.error(f"Cover generation failed: {type(e).__name__}: {e}", exc_info=True)
        raise AIServiceException(
            message="커버 이미지 생성 중 오류가 발생했습니다.",
            details={"error": str(e)}
        )

    scenario.cover_image_url = cover_url
    db.commit()

    return {"cover_image_url": cover_url}
