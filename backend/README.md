# TRNT Backend API

> 평행세계 인생 시뮬레이터 백엔드 API

TRNT는 사용자의 인생 분기점을 기반으로 "만약 다른 선택을 했다면?" 이라는 질문에 대한 답을 AI 시나리오로 생성하는 서비스입니다.

## 🚀 시작하기

### 필수 요구사항

- Python 3.12+
- PostgreSQL 14+
- Groq API Key

### 설치 및 실행

#### 1. 가상환경 생성 및 활성화

```bash
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
```

#### 2. 의존성 설치

```bash
pip install -r requirements.txt

# 개발 환경 (테스트 포함)
pip install -r requirements-dev.txt
```

#### 3. 환경 변수 설정

```bash
cp .env.example .env
# .env 파일을 편집하여 실제 값 입력
```

`.env` 파일 예시:
```env
# 서버 설정
APP_ENV=development
DEBUG=true

# DB
DATABASE_URL=postgresql://localhost:5432/trnt

# AI API
GROQ_API_KEY=your_groq_api_key_here

# JWT 인증
SECRET_KEY=your_secret_key_here
JWT_ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
REFRESH_TOKEN_EXPIRE_DAYS=7

# 카카오 OAuth
KAKAO_CLIENT_ID=your_kakao_client_id_here
KAKAO_CLIENT_SECRET=your_kakao_client_secret_here
KAKAO_REDIRECT_URI=http://localhost:8000/api/v1/auth/kakao/callback

# Frontend URL
FRONTEND_URL=http://localhost:3000

# Rate Limiting
DAILY_FREE_LIMIT=3
```

#### 4. 데이터베이스 생성

```bash
# PostgreSQL 접속
psql postgres

# 데이터베이스 생성
CREATE DATABASE trnt;
CREATE DATABASE trnt_test;  # 테스트용

# 종료
\q
```

#### 5. 데이터베이스 마이그레이션

```bash
alembic upgrade head
```

#### 6. 서버 실행

```bash
uvicorn app.main:app --reload
```

서버가 http://localhost:8000 에서 실행됩니다.

## 📖 API 문서

### 대화형 API 문서

- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

### 주요 엔드포인트

#### 인증 (`/api/v1/auth`)

| Method | Endpoint | 설명 | 인증 필요 |
|--------|----------|------|-----------|
| POST | `/register` | 이메일 회원가입 | ❌ |
| POST | `/login` | 로그인 | ❌ |
| POST | `/logout` | 로그아웃 | ✅ |
| POST | `/refresh` | 토큰 갱신 | ❌ |
| GET | `/me` | 현재 사용자 정보 | ✅ |
| POST | `/forgot-password` | 비밀번호 재설정 요청 | ❌ |
| POST | `/reset-password` | 비밀번호 재설정 | ❌ |
| GET | `/kakao/login` | 카카오 로그인 URL | ❌ |
| GET | `/kakao/callback` | 카카오 OAuth 콜백 | ❌ |

#### 시나리오 (`/api/v1/scenarios`)

| Method | Endpoint | 설명 | 인증 필요 |
|--------|----------|------|-----------|
| POST | `/generate` | 시나리오 생성 | ✅ |
| GET | `/` | 내 시나리오 목록 | ✅ |
| GET | `/{id}` | 시나리오 상세 | ✅ |
| DELETE | `/{id}` | 시나리오 삭제 | ✅ |

#### 사용자 (`/api/v1/users`)

| Method | Endpoint | 설명 | 인증 필요 |
|--------|----------|------|-----------|
| GET | `/` | 사용자 목록 | ✅ |
| GET | `/{id}` | 사용자 조회 | ❌ |
| PATCH | `/{id}` | 프로필 수정 (본인만) | ✅ |
| DELETE | `/{id}` | 계정 삭제 (본인만) | ✅ |

### 인증 방법

JWT 기반 Bearer 토큰 인증을 사용합니다.

```bash
# 1. 회원가입 또는 로그인
curl -X POST http://localhost:8000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com", "password":"Password123!"}'

# 2. 응답에서 access_token 추출
{
  "access_token": "eyJhbG...",
  "refresh_token": "eyJhbG...",
  "token_type": "bearer",
  "user_id": "..."
}

# 3. 보호된 엔드포인트 호출 시 헤더에 토큰 포함
curl -X GET http://localhost:8000/api/v1/auth/me \
  -H "Authorization: Bearer eyJhbG..."
```

## 🧪 테스트

### 테스트 실행

```bash
# 모든 테스트 실행
pytest

# 커버리지와 함께 실행
pytest --cov=app tests/

# 특정 테스트 파일만 실행
pytest tests/test_auth.py

# 상세 출력
pytest -v

# 특정 테스트 클래스만 실행
pytest tests/test_auth.py::TestLogin
```

### 테스트 구조

```
tests/
├── __init__.py
├── conftest.py          # pytest 설정 및 공통 픽스처
├── test_auth.py         # 인증 API 테스트
└── test_scenarios.py    # 시나리오 API 테스트
```

## 🔒 보안

### 비밀번호 정책

- 최소 8자 이상
- 대문자 포함 필수
- 숫자 포함 필수
- 특수문자 포함 필수 (!@#$%^&*(),.?":{}|<>)

### JWT 토큰

- **액세스 토큰**: 30분 유효
- **리프레시 토큰**: 7일 유효
- 로그아웃 시 토큰 블랙리스트에 추가

### 데이터 보호

- 비밀번호는 bcrypt로 해싱
- 민감한 정보는 로그에서 자동 필터링
- CORS는 허용된 도메인만 접근 가능

## 📊 Rate Limiting

- 일일 무료 생성 횟수: **3회**
- 자정(UTC 00:00)에 초기화
- 초과 시 429 에러 반환

## 🗄️ 데이터베이스

### 스키마

#### Users
- 이메일 및 소셜 로그인 지원
- 필수 프로필 정보: 이름, 출생연도, 직업, 배경 스토리

#### Scenarios
- 사용자별 생성된 시나리오 저장
- 분기점 데이터, 커스터마이징 옵션, 생성된 텍스트

#### UsageLogs
- 일일 사용량 추적
- Rate limiting에 사용

#### TokenBlacklist
- 로그아웃된 토큰 저장
- 만료 시간까지 무효화

### 마이그레이션

```bash
# 새 마이그레이션 생성 (자동)
alembic revision --autogenerate -m "description"

# 새 마이그레이션 생성 (수동)
alembic revision -m "description"

# 마이그레이션 적용
alembic upgrade head

# 이전 버전으로 롤백
alembic downgrade -1

# 마이그레이션 히스토리 확인
alembic history
```

## 📝 에러 코드

| 코드 | 설명 | HTTP 상태 |
|------|------|-----------|
| USER_NOT_FOUND | 사용자를 찾을 수 없음 | 404 |
| SCENARIO_NOT_FOUND | 시나리오를 찾을 수 없음 | 404 |
| INVALID_CREDENTIALS | 잘못된 이메일 또는 비밀번호 | 401 |
| AUTHENTICATION_FAILED | 인증 실패 | 401 |
| DUPLICATE_EMAIL | 이미 등록된 이메일 | 400 |
| RATE_LIMIT_EXCEEDED | 일일 사용량 초과 | 429 |
| INCOMPLETE_PROFILE | 프로필 미완성 | 403 |
| PERMISSION_DENIED | 권한 없음 | 403 |
| AI_SERVICE_ERROR | AI 서비스 오류 | 500 |

### 에러 응답 형식

```json
{
  "error": {
    "message": "사용자를 찾을 수 없습니다.",
    "code": "USER_NOT_FOUND",
    "details": {
      "user_id": "..."
    }
  }
}
```

## 🏗️ 프로젝트 구조

```
backend/
├── alembic/                # 데이터베이스 마이그레이션
│   └── versions/           # 마이그레이션 파일들
├── app/
│   ├── api/                # API 라우터
│   │   ├── auth.py         # 인증 엔드포인트
│   │   ├── scenarios.py    # 시나리오 엔드포인트
│   │   └── users.py        # 사용자 엔드포인트
│   ├── dependencies/       # FastAPI 의존성
│   │   ├── auth.py         # 인증 의존성
│   │   └── profile.py      # 프로필 완성 체크
│   ├── middleware/         # 미들웨어
│   │   ├── error_handler.py # 예외 처리
│   │   └── logging.py      # 요청/응답 로깅
│   ├── models/             # SQLAlchemy 모델
│   │   ├── user.py
│   │   ├── scenario.py
│   │   ├── usage_log.py
│   │   └── token_blacklist.py
│   ├── schemas/            # Pydantic 스키마
│   │   ├── auth.py         # 인증 스키마
│   │   ├── scenario.py     # 시나리오 스키마
│   │   ├── user.py         # 사용자 스키마
│   │   └── validators.py   # 공통 검증 함수
│   ├── services/           # 비즈니스 로직
│   │   ├── ai.py           # AI 시나리오 생성
│   │   ├── auth.py         # 인증 서비스
│   │   ├── email.py        # 이메일 전송
│   │   ├── kakao.py        # 카카오 OAuth
│   │   └── rate_limiter.py # 사용량 제한
│   ├── config.py           # 설정
│   ├── database.py         # DB 연결
│   ├── exceptions.py       # 커스텀 예외
│   └── main.py             # FastAPI 앱
├── tests/                  # 테스트
│   ├── conftest.py
│   ├── test_auth.py
│   └── test_scenarios.py
├── .env                    # 환경 변수 (git 제외)
├── .env.example            # 환경 변수 템플릿
├── .gitignore
├── alembic.ini             # Alembic 설정
├── requirements.txt        # 프로덕션 의존성
├── requirements-dev.txt    # 개발 의존성
└── README.md
```

## 🛠️ 개발

### 코드 스타일

- PEP 8 준수
- 타입 힌트 사용
- Docstring 작성 (Google 스타일)

### 새 기능 추가

1. 모델 변경 시 마이그레이션 생성
2. 스키마 정의
3. 서비스 로직 구현
4. API 라우터 추가
5. 테스트 작성

## 📄 라이선스

이 프로젝트는 MIT 라이선스를 따릅니다.

## 🤝 기여

이슈와 PR을 환영합니다!

## 📧 문의

프로젝트 관련 문의사항은 이슈를 통해 남겨주세요.

---

**TRNT** - Time Reversal Narrative Therapy
