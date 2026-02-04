"""인증 API 라우터"""
from typing import Optional
from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.user import User
from app.schemas.auth import (
    RegisterRequest,
    LoginRequest,
    TokenResponse,
    TokenRefreshRequest,
    CurrentUserResponse
)
from app.services.auth import AuthService
from app.services.kakao import KakaoOAuthService
from app.dependencies.auth import get_current_active_user
from app.exceptions import (
    DuplicateEmailException,
    InvalidCredentialsException,
    AuthenticationException
)

router = APIRouter(prefix="/auth", tags=["Authentication"])

auth_service = AuthService()
kakao_service = KakaoOAuthService()


@router.post("/register", response_model=TokenResponse, status_code=status.HTTP_201_CREATED)
def register(request: RegisterRequest, db: Session = Depends(get_db)):
    """이메일 회원가입"""

    # 이메일 중복 체크
    existing = db.query(User).filter(User.email == request.email).first()
    if existing:
        raise DuplicateEmailException(email=request.email)

    # 비밀번호 해싱
    hashed_password = auth_service.hash_password(request.password)

    # 사용자 생성
    user_data = request.model_dump(exclude={"password"})
    user = User(
        **user_data,
        hashed_password=hashed_password,
        auth_provider="email",
        is_active=True
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    # 토큰 생성
    access_token = auth_service.create_access_token(user.id)
    refresh_token = auth_service.create_refresh_token(user.id)

    return TokenResponse(
        access_token=access_token,
        refresh_token=refresh_token,
        user_id=user.id
    )


@router.post("/login", response_model=TokenResponse)
def login(request: LoginRequest, db: Session = Depends(get_db)):
    """이메일 로그인"""

    # 사용자 조회
    user = db.query(User).filter(User.email == request.email).first()
    if not user:
        raise InvalidCredentialsException()

    # 비밀번호 검증
    if not user.hashed_password or not auth_service.verify_password(
        request.password, user.hashed_password
    ):
        raise InvalidCredentialsException()

    # 활성 사용자 확인
    if not user.is_active:
        raise AuthenticationException(message="비활성화된 계정입니다.")

    # 토큰 생성
    access_token = auth_service.create_access_token(user.id)
    refresh_token = auth_service.create_refresh_token(user.id)

    return TokenResponse(
        access_token=access_token,
        refresh_token=refresh_token,
        user_id=user.id
    )


@router.post("/refresh", response_model=TokenResponse)
def refresh_token(request: TokenRefreshRequest, db: Session = Depends(get_db)):
    """토큰 갱신"""

    # 리프레시 토큰 검증
    payload = auth_service.verify_token(request.refresh_token, token_type="refresh")
    user_id_str = payload.get("sub")

    if not user_id_str:
        raise AuthenticationException(message="유효하지 않은 토큰입니다.")

    # 사용자 존재 확인
    from uuid import UUID
    user_id = UUID(user_id_str)
    user = db.query(User).filter(User.id == user_id).first()
    if not user or not user.is_active:
        raise AuthenticationException(message="사용자를 찾을 수 없거나 비활성화되었습니다.")

    # 새 토큰 생성
    new_access_token = auth_service.create_access_token(user_id)
    new_refresh_token = auth_service.create_refresh_token(user_id)

    return TokenResponse(
        access_token=new_access_token,
        refresh_token=new_refresh_token,
        user_id=user_id
    )


@router.get("/me", response_model=CurrentUserResponse)
async def get_me(current_user: User = Depends(get_current_active_user)):
    """현재 사용자 정보 조회"""
    return CurrentUserResponse.model_validate(current_user)


# ===== 카카오 OAuth =====

@router.get("/kakao/login")
def kakao_login():
    """카카오 로그인 URL 반환"""
    auth_url = kakao_service.get_authorization_url()
    return {"authorization_url": auth_url}


@router.get("/kakao/callback", response_model=TokenResponse)
async def kakao_callback(code: str = Query(..., description="카카오 인가 코드"), db: Session = Depends(get_db)):
    """
    카카오 OAuth 콜백 처리

    1. 인가 코드로 카카오 액세스 토큰 받기
    2. 카카오 사용자 정보 조회
    3. 기존 사용자 조회 or 신규 생성
    4. JWT 토큰 발급
    """

    # 1. 카카오 액세스 토큰 받기
    kakao_access_token = await kakao_service.exchange_code(code)

    # 2. 카카오 사용자 정보 조회
    kakao_user_info = await kakao_service.get_user_info(kakao_access_token)
    kakao_id = kakao_user_info["kakao_id"]
    email = kakao_user_info.get("email")
    nickname = kakao_user_info.get("nickname", "카카오사용자")

    # 3. 기존 사용자 조회
    user = db.query(User).filter(User.kakao_id == kakao_id).first()

    if not user:
        # 신규 사용자 생성 (플레이스홀더 값)
        user = User(
            email=email,
            name=nickname,
            birth_year=0,  # 프로필 미완성 플래그
            occupation="미입력",  # 프로필 미완성 플래그
            life_background="프로필을 완성해주세요.",
            auth_provider="kakao",
            kakao_id=kakao_id,
            is_active=True
        )
        db.add(user)
        db.commit()
        db.refresh(user)

    # 4. JWT 토큰 생성
    access_token = auth_service.create_access_token(user.id)
    refresh_token = auth_service.create_refresh_token(user.id)

    return TokenResponse(
        access_token=access_token,
        refresh_token=refresh_token,
        user_id=user.id
    )
