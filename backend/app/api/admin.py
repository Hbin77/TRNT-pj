import uuid
import logging
from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func, cast, Date

from app.database import get_db
from app.models.user import User
from app.models.scenario import Scenario
from app.dependencies.admin import get_admin_user

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/admin", tags=["Admin"])


@router.get("/stats")
def get_stats(
    db: Session = Depends(get_db),
    _: User = Depends(get_admin_user),
):
    """전체 통계 요약"""
    today = datetime.now(timezone.utc).date()

    total_users = db.query(func.count(User.id)).scalar() or 0
    total_scenarios = db.query(func.count(Scenario.id)).scalar() or 0
    today_users = (
        db.query(func.count(User.id))
        .filter(cast(User.created_at, Date) == today)
        .scalar() or 0
    )
    today_scenarios = (
        db.query(func.count(Scenario.id))
        .filter(cast(Scenario.created_at, Date) == today)
        .scalar() or 0
    )
    verified_users = db.query(func.count(User.id)).filter(User.is_verified == True).scalar() or 0
    kakao_users = db.query(func.count(User.id)).filter(User.auth_provider == "kakao").scalar() or 0
    google_users = db.query(func.count(User.id)).filter(User.auth_provider == "google").scalar() or 0
    email_users = db.query(func.count(User.id)).filter(User.auth_provider == "email").scalar() or 0

    return {
        "total_users": total_users,
        "total_scenarios": total_scenarios,
        "today_new_users": today_users,
        "today_scenarios": today_scenarios,
        "verified_users": verified_users,
        "auth_providers": {
            "email": email_users,
            "kakao": kakao_users,
            "google": google_users,
        },
    }


@router.get("/users")
def get_admin_users(
    skip: int = 0,
    limit: int = 50,
    db: Session = Depends(get_db),
    _: User = Depends(get_admin_user),
):
    """전체 회원 목록 (시나리오 수 포함)"""
    users = (
        db.query(User)
        .order_by(User.created_at.desc())
        .offset(skip)
        .limit(limit)
        .all()
    )
    total = db.query(func.count(User.id)).scalar() or 0

    result = []
    for user in users:
        scenario_count = (
            db.query(func.count(Scenario.id))
            .filter(Scenario.user_id == user.id)
            .scalar() or 0
        )
        result.append({
            "id": str(user.id),
            "name": user.name,
            "email": user.email or "-",
            "auth_provider": user.auth_provider,
            "is_verified": user.is_verified,
            "is_active": user.is_active,
            "birth_year": user.birth_year,
            "occupation": user.occupation,
            "residence": user.residence or "-",
            "scenario_count": scenario_count,
            "created_at": user.created_at.isoformat(),
        })

    return {"users": result, "total": total}


@router.get("/users/{user_id}")
def get_admin_user_detail(
    user_id: uuid.UUID,
    db: Session = Depends(get_db),
    _: User = Depends(get_admin_user),
):
    """회원 상세 정보 + 시나리오 목록"""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="사용자를 찾을 수 없습니다.")

    scenarios = (
        db.query(Scenario)
        .filter(Scenario.user_id == user_id)
        .order_by(Scenario.created_at.desc())
        .limit(20)
        .all()
    )

    return {
        "id": str(user.id),
        "name": user.name,
        "email": user.email or "-",
        "auth_provider": user.auth_provider,
        "is_verified": user.is_verified,
        "is_active": user.is_active,
        "birth_year": user.birth_year,
        "occupation": user.occupation,
        "residence": user.residence or "-",
        "personality": user.personality or "-",
        "values": user.values or "-",
        "created_at": user.created_at.isoformat(),
        "scenarios": [
            {
                "id": str(s.id),
                "genre": s.genre,
                "tone": s.tone,
                "rating": s.rating,
                "word_count": s.word_count,
                "created_at": s.created_at.isoformat(),
            }
            for s in scenarios
        ],
    }


@router.delete("/users/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
def admin_delete_user(
    user_id: uuid.UUID,
    db: Session = Depends(get_db),
    admin: User = Depends(get_admin_user),
):
    """회원 강제 탈퇴"""
    if str(user_id) == str(admin.id):
        raise HTTPException(status_code=400, detail="자기 자신은 삭제할 수 없습니다.")

    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="사용자를 찾을 수 없습니다.")

    db.delete(user)
    db.commit()
    logger.info(f"Admin {admin.email} deleted user {user.email} ({user_id})")
    return None
