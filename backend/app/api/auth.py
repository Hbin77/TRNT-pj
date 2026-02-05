"""인증 API 라우터"""
from datetime import datetime, timedelta
from typing import Optional
from fastapi import APIRouter, Depends, Query, status
from fastapi.security import HTTPAuthorizationCredentials
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.user import User
from app.schemas.auth import (
    RegisterRequest,
    LoginRequest,
    VerifyEmailRequest,
    TokenResponse,
    TokenRefreshRequest,
    CurrentUserResponse,
    ForgotPasswordRequest,
    ResetPasswordRequest
)
from app.services.auth import AuthService
from app.services.kakao import KakaoOAuthService
from app.services.email import EmailService
from app.dependencies.auth import get_current_active_user, security
from app.exceptions import UserNotFoundException
from app.exceptions import (
    DuplicateEmailException,
    InvalidCredentialsException,
    AuthenticationException
)

from app.config import settings

router = APIRouter(prefix="/auth", tags=["Authentication"])

auth_service = AuthService()
kakao_service = KakaoOAuthService()
email_service = EmailService()


@router.post("/register", status_code=status.HTTP_201_CREATED)
def register(request: RegisterRequest, db: Session = Depends(get_db)):
    """이메일 회원가입 (인증 메일 전송)"""

    # 이메일 중복 체크
    existing = db.query(User).filter(User.email == request.email).first()
    if existing:
        # 이미 인증된 계정이면 에러
        if existing.is_verified:
            raise DuplicateEmailException(email=request.email)
        
        # 소셜 로그인 계정이면 에러 (정책상 분리)
        if existing.auth_provider != "email":
            raise DuplicateEmailException(email=request.email)
            
        # 미인증 계정이면 업데이트 진행 (재가입 허용)
        # 기존 user 객체를 new logic에서 재사용하기 위해 아래에서 처리

    # Turnstile 검증
    import httpx
    if settings.TURNSTILE_SECRET_KEY:
        if not request.turnstile_token:
            # 테스트 키가 설정되어 있어도 토큰이 없으면 에러 (클라이언트 강제)
            raise AuthenticationException(message="로봇 인증 토큰이 필요합니다.")
        
        try:
            verify_response = httpx.post(
                "https://challenges.cloudflare.com/turnstile/v0/siteverify",
                data={
                    "secret": settings.TURNSTILE_SECRET_KEY,
                    "response": request.turnstile_token
                },
                timeout=5.0
            )
            verification = verify_response.json()
            if not verification.get("success"):
                raise AuthenticationException(message="로봇 인증에 실패했습니다.")
        except Exception as e:
            if isinstance(e, AuthenticationException):
                raise
            raise AuthenticationException(message="로봇 인증 서버 연결 실패")

    # 비밀번호 해싱
    hashed_password = auth_service.hash_password(request.password)

    # 인증 코드 생성 (6자리 숫자)
    import secrets
    verification_code = "".join([str(secrets.randbelow(10)) for _ in range(6)])

    if existing:
        # 기존 미인증 사용자 업데이트
        user = existing
        user.hashed_password = hashed_password
        user.name = request.name
        user.birth_year = request.birth_year
        user.occupation = request.occupation
        user.life_background = request.life_background
        
        # 선택 필드 업데이트
        user.gender = request.gender
        user.education = request.education
        user.major = request.major
        user.residence = request.residence
        user.relationship_status = request.relationship_status
        user.key_events = request.key_events
        user.personality = request.personality
        user.values = request.values
        
        # 인증 코드 갱신
        user.verification_code = verification_code
        # 혹시 비활성화 되어있다면 활성화
        user.is_active = True
        
    else:
        # 신규 사용자 생성 (미인증 상태)
        user_data = request.model_dump(exclude={"password", "turnstile_token"})
        user = User(
            **user_data,
            hashed_password=hashed_password,
            auth_provider="email",
            is_active=True,
            is_verified=False,  # 미인증
            verification_code=verification_code
        )
        db.add(user)

    db.commit()
    db.refresh(user)

    # 인증 메일 전송
    email_service.send_verification_email(user.email, verification_code)

    return {"message": "인증 메일이 전송되었습니다. 이메일을 확인해주세요."}


@router.post("/verify-email", response_model=TokenResponse)
def verify_email(request: VerifyEmailRequest, db: Session = Depends(get_db)):
    """이메일 인증 코드 확인 및 로그인 처리"""
    
    user = db.query(User).filter(User.email == request.email).first()
    if not user:
        raise UserNotFoundException(user_id=request.email)
    
    if user.is_verified:
        raise AuthenticationException(message="이미 인증된 계정입니다.")
        
    if user.verification_code != request.code:
        raise AuthenticationException(message="인증 코드가 올바르지 않습니다.")
        
    # 인증 완료 처리
    user.is_verified = True
    user.verification_code = None  # 코드 파기
    db.commit()
    
    # 토큰 생성 (자동 로그인)
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
        
    # 이메일 인증 확인
    if user.auth_provider == "email" and not user.is_verified:
        raise AuthenticationException(message="이메일 인증이 완료되지 않았습니다.")

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


@router.post("/logout")
async def logout(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """로그아웃 (토큰 무효화)"""

    token = credentials.credentials

    # 토큰 만료 시간 추출
    payload = auth_service.verify_token(token, token_type="access")
    expires_timestamp = payload.get("exp")
    expires_at = datetime.fromtimestamp(expires_timestamp)

    # 블랙리스트에 추가
    auth_service.blacklist_token(token, expires_at, db)

    return {"message": "로그아웃되었습니다"}


@router.post("/forgot-password")
async def forgot_password(
    request: ForgotPasswordRequest,
    db: Session = Depends(get_db)
):
    """비밀번호 재설정 이메일 전송"""

    # 사용자 조회
    user = db.query(User).filter(User.email == request.email).first()

    # 보안: 사용자가 없어도 동일한 응답 (이메일 존재 여부 노출 방지)
    if user and user.auth_provider == "email":
        # 재설정 토큰 생성 (15분 유효)
        reset_token = auth_service.create_access_token(
            user.id,
            expires_delta=timedelta(minutes=15)
        )

        # 이메일 전송
        email_service.send_password_reset_email(user.email, reset_token)

    return {"message": "비밀번호 재설정 이메일을 전송했습니다"}


@router.post("/reset-password")
async def reset_password(
    request: ResetPasswordRequest,
    db: Session = Depends(get_db)
):
    """비밀번호 재설정"""

    # 토큰 검증
    try:
        user_id = auth_service.get_user_id_from_token(request.token)
    except AuthenticationException:
        raise AuthenticationException(message="유효하지 않거나 만료된 링크입니다")

    # 사용자 조회
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise UserNotFoundException(user_id=str(user_id))

    # OAuth 사용자는 비밀번호 재설정 불가
    if user.auth_provider != "email":
        raise AuthenticationException(message="소셜 로그인 사용자는 비밀번호를 재설정할 수 없습니다")

    # 비밀번호 변경
    user.hashed_password = auth_service.hash_password(request.new_password)
    db.commit()

    return {"message": "비밀번호가 변경되었습니다"}


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
