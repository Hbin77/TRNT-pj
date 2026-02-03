from datetime import datetime
from typing import Optional
from uuid import UUID

from pydantic import BaseModel, EmailStr


class UserBase(BaseModel):
    name: str
    birth_year: int
    gender: Optional[str] = None
    email: Optional[EmailStr] = None

    # 현재 상태
    occupation: str
    education: Optional[str] = None
    major: Optional[str] = None
    residence: Optional[str] = None
    relationship_status: Optional[str] = None

    # 배경 스토리
    life_background: str
    key_events: Optional[str] = None

    # 성향
    personality: Optional[str] = None
    values: Optional[str] = None


class UserCreate(UserBase):
    """사용자 생성 요청"""
    pass


class UserUpdate(BaseModel):
    """사용자 수정 요청 (모두 선택)"""
    name: Optional[str] = None
    birth_year: Optional[int] = None
    gender: Optional[str] = None
    email: Optional[EmailStr] = None
    occupation: Optional[str] = None
    education: Optional[str] = None
    major: Optional[str] = None
    residence: Optional[str] = None
    relationship_status: Optional[str] = None
    life_background: Optional[str] = None
    key_events: Optional[str] = None
    personality: Optional[str] = None
    values: Optional[str] = None


class UserResponse(UserBase):
    """사용자 응답"""
    id: UUID
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True