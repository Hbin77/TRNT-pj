"""인증 관련 스키마"""
import re
from datetime import datetime
from typing import Optional
from uuid import UUID
from pydantic import BaseModel, EmailStr, Field, field_validator


class RegisterRequest(BaseModel):
    """이메일 회원가입 요청"""
    email: EmailStr
    password: str = Field(..., min_length=8, max_length=128, description="최소 8자 이상, 대문자/숫자/특수문자 포함")
    name: str
    birth_year: int = Field(..., ge=1900, le=datetime.now().year, description="출생연도 (1900-현재)")
    gender: Optional[str] = None
    occupation: str
    education: Optional[str] = None
    major: Optional[str] = None
    residence: Optional[str] = None
    relationship_status: Optional[str] = None
    life_background: str
    key_events: Optional[str] = None
    personality: Optional[str] = None
    values: Optional[str] = None

    @field_validator('password')
    @classmethod
    def validate_password(cls, v: str) -> str:
        """비밀번호 복잡도 검증"""
        if len(v) < 8:
            raise ValueError('비밀번호는 최소 8자 이상이어야 합니다')
        if not re.search(r'[A-Z]', v):
            raise ValueError('비밀번호는 대문자를 포함해야 합니다')
        if not re.search(r'\d', v):
            raise ValueError('비밀번호는 숫자를 포함해야 합니다')
        if not re.search(r'[!@#$%^&*(),.?":{}|<>]', v):
            raise ValueError('비밀번호는 특수문자를 포함해야 합니다')
        return v


class LoginRequest(BaseModel):
    """로그인 요청"""
    email: EmailStr
    password: str


class TokenResponse(BaseModel):
    """토큰 응답"""
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    user_id: UUID


class TokenRefreshRequest(BaseModel):
    """토큰 갱신 요청"""
    refresh_token: str


class CurrentUserResponse(BaseModel):
    """현재 사용자 정보 응답"""
    id: UUID
    email: Optional[str]
    name: str
    birth_year: int
    gender: Optional[str] = None
    occupation: str
    education: Optional[str] = None
    major: Optional[str] = None
    residence: Optional[str] = None
    relationship_status: Optional[str] = None
    life_background: str
    key_events: Optional[str] = None
    personality: Optional[str] = None
    values: Optional[str] = None
    auth_provider: str
    is_active: bool

    class Config:
        from_attributes = True


class ForgotPasswordRequest(BaseModel):
    """비밀번호 재설정 요청"""
    email: EmailStr


class ResetPasswordRequest(BaseModel):
    """비밀번호 재설정"""
    token: str
    new_password: str = Field(..., min_length=8, max_length=128, description="새 비밀번호")

    @field_validator('new_password')
    @classmethod
    def validate_new_password(cls, v: str) -> str:
        """비밀번호 복잡도 검증"""
        if len(v) < 8:
            raise ValueError('비밀번호는 최소 8자 이상이어야 합니다')
        if not re.search(r'[A-Z]', v):
            raise ValueError('비밀번호는 대문자를 포함해야 합니다')
        if not re.search(r'\d', v):
            raise ValueError('비밀번호는 숫자를 포함해야 합니다')
        if not re.search(r'[!@#$%^&*(),.?":{}|<>]', v):
            raise ValueError('비밀번호는 특수문자를 포함해야 합니다')
        return v
