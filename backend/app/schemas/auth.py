"""인증 관련 스키마"""
from typing import Optional
from uuid import UUID
from pydantic import BaseModel, EmailStr, Field


class RegisterRequest(BaseModel):
    """이메일 회원가입 요청"""
    email: EmailStr
    password: str = Field(..., min_length=8, description="최소 8자 이상")
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
    auth_provider: str
    is_active: bool

    class Config:
        from_attributes = True
