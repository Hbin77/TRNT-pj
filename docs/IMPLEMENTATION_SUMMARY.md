# TRNT Implementation Summary

## 완료된 구현 내용

---

### Phase 1: Scenario 모델 + DB 테이블 생성
- `app/models/scenario.py` - Scenario SQLAlchemy 모델 생성
- `app/models/__init__.py` - Scenario import 추가
- `alembic/env.py` - Scenario 모델 import 추가
- Migration: `create_scenarios_table`

### Phase 2: 시나리오 저장/조회 API
- `app/schemas/scenario.py` - 스키마 확장 (ScenarioDBResponse, ScenarioListItem 등)
- `app/api/scenarios.py` - CRUD 엔드포인트
  - `POST /api/v1/scenarios/generate` - 시나리오 생성 + 자동 저장
  - `GET /api/v1/scenarios` - 내 시나리오 목록 조회
  - `GET /api/v1/scenarios/{scenario_id}` - 상세 조회
  - `DELETE /api/v1/scenarios/{scenario_id}` - 삭제

### Phase 3: 에러 핸들링 + 로깅
- `app/exceptions.py` - 커스텀 예외 클래스 (TRNTException, AIServiceException, RateLimitExceededException 등)
- `app/middleware/error_handler.py` - 전역 예외 핸들러
- `app/middleware/logging.py` - 요청/응답 로깅 미들웨어 (X-Process-Time 헤더)

### Phase 4: Rate Limiting (일 3회 무료 제한)
- `app/models/usage_log.py` - UsageLog 모델
- `app/services/rate_limiter.py` - RateLimiterService
- Migration: `create_usage_logs_table`

### Phase 5: 회원가입/로그인/JWT
- `app/services/auth.py` - bcrypt 해싱, JWT 생성/검증
- `app/dependencies/auth.py` - `get_current_user`, `get_current_active_user`
- `app/schemas/auth.py` - RegisterRequest, LoginRequest, TokenResponse 등
- `app/api/auth.py` - 인증 라우터
  - `POST /auth/register` - 회원가입
  - `POST /auth/login` - 로그인
  - `POST /auth/refresh` - 토큰 갱신
  - `GET /auth/me` - 현재 사용자 정보
- Migration: `add_auth_columns_to_users`

### Phase 6: 카카오 OAuth 로그인
- `app/services/kakao.py` - KakaoOAuthService
- `app/dependencies/profile.py` - `require_complete_profile` 의존성
- `GET /auth/kakao/login` - 카카오 인증 URL 반환
- `GET /auth/kakao/callback` - 카카오 콜백 처리

### Phase 7: 정리 및 보안
- 중복 파일 삭제, `.env` 업데이트, `.gitignore` 확인

---

### Phase 8: 이메일 인증 시스템
- `app/services/email.py` - EmailService 구현
  - `send_verification_email()` - 6자리 인증 코드 발송
  - `send_password_reset_email()` - 비밀번호 재설정 링크 발송
  - SMTP UTF-8 인코딩 지원
- `app/api/auth.py` - 인증 엔드포인트 추가
  - `POST /auth/verify-email` - 6자리 코드로 이메일 인증
- `app/models/user.py` - `is_verified`, `verification_code` 컬럼 추가
- Turnstile CAPTCHA 검증 (회원가입 시)
- Migration: `add_email_verification_columns`

### Phase 9: 구글 OAuth 로그인
- `app/services/google.py` - GoogleOAuthService 구현
  - `get_authorization_url()`, `exchange_code()`, `get_user_info()`
- `app/api/auth.py` - 구글 엔드포인트 추가
  - `GET /auth/google/login` - 구글 인증 URL 반환
  - `GET /auth/google/callback` - 구글 콜백 처리
- OAuth 유저는 `is_verified=true` 자동 설정
- 기존 이메일과 계정 연결 지원
- Migration: `add_google_id_to_users`

### Phase 10: 토큰 블랙리스트 & 비밀번호 관리
- `app/models/token_blacklist.py` - TokenBlacklist 모델
- `app/services/auth.py` - `is_token_blacklisted()`, `blacklist_token()` 추가
- `app/api/auth.py` - 엔드포인트 추가
  - `POST /auth/logout` - 토큰 블랙리스트 등록
  - `POST /auth/forgot-password` - 비밀번호 재설정 이메일 요청
  - `POST /auth/reset-password` - 토큰으로 비밀번호 재설정
  - `POST /auth/change-password` - 로그인 상태에서 비밀번호 변경
- Migration: `add_token_blacklist_table`

### Phase 11: 시나리오 피드백 & 이어쓰기
- `app/models/scenario.py` - `rating`, `parent_scenario_id` 컬럼 추가
- `app/api/scenarios.py` - 피드백 / 이어쓰기 엔드포인트
  - `POST /scenarios/{id}/rate` - 좋아요/싫어요 피드백
  - `POST /scenarios/generate/stream` - SSE 스트리밍 시나리오 생성
  - `POST /scenarios/{id}/continue/stream` - 이어쓰기 스트리밍
- 좋아요 시나리오 → RAG 자동 축적 (`liked_{genre}_{tone}_{id}.md`)
- Migration: `add_rating_and_parent_scenario`

### Phase 12: AI 서비스 강화
- `app/services/ai.py` - AIService 대폭 확장
  - **프롬프트 엔지니어링**: SYSTEM_PROMPT (한국어 문학 전문가 페르소나)
  - **build_prompt()**: 톤/장르/상세도/범위별 세분화된 가이드라인 주입
  - **_build_user_profile()**: 구조화된 personality/values/life_background → 자연어 변환
  - **RAG 시스템**:
    - `_load_era_context()` - 시대별 맥락 자동 로드 (1990s/2000s/2010s/2020s)
    - `_load_writing_guide()` - 문체/톤/장르 심화 가이드 로드
    - `_load_example_scenarios()` - 장르×톤 예시 시나리오 로드
    - `_save_liked_scenario()` - 좋아요 시나리오 자동 축적
  - **9가지 서사 구조 템플릿** (scope × detail_level 조합)
  - **이어쓰기**: `continue_scenario()`, `continue_scenario_stream()` — user_profile 포함
  - Groq API (qwen/qwen3-32b, temp=0.85, top_p=0.9)

### Phase 13: 프론트엔드 전체 구현
- **페이지 라우팅** (Next.js App Router):
  - `/` - 랜딩 페이지 (히어로, 기능 소개, 미리보기)
  - `/login` - 로그인 (이메일 + 카카오/구글 OAuth)
  - `/register` - 회원가입 (간소화: 계정 + 인구통계만)
  - `/auth/callback` - OAuth 콜백 핸들러
  - `/dashboard` - 대시보드
  - `/profile/edit` - 프로필 편집 / 위저드
  - `/profile/password` - 비밀번호 변경
  - `/scenarios` - 시나리오 목록
  - `/scenarios/new` - 시나리오 생성 (분기점 + 톤/장르/범위/상세도)
  - `/scenarios/[id]` - 시나리오 상세
  - `/about`, `/terms`, `/privacy` - 정보 페이지
  - `/sitemap.ts` - 사이트맵 생성
- **인증 시스템** (Zustand store):
  - JWT 토큰 localStorage 관리
  - 401 자동 리프레시 + 요청 큐
  - 카카오/구글 OAuth 콜백 처리
  - `VerificationModal` - 6자리 인증 코드 입력 모달
- **UI 컴포넌트** (글래스모피즘 디자인):
  - GlassCard, Button, Input, Textarea, GradientButton
  - Logo (logo_nb.webp + TRNT 텍스트)
  - LanguageSwitcher (4개국어)

### Phase 14: 프로필 위저드 시스템
- **`lib/profileConstants.ts`** - 전체 옵션 상수
  - 시나리오 질문 4개 (의사결정/변화대응/대인관계/회복력)
  - MBTI 4차원, 성격 키워드 16개
  - 핵심 가치 16개, 삶의 중심 6개
  - 이야기 가이드 질문 3개
- **`lib/profileSerializer.ts`** - 위저드 데이터 ↔ DB 필드 변환
  - `serializePersonality()` → `결정:직감형/변화:도전형/...|ENFP|감성적,모험적`
  - `serializeValues()` → `자유,성장|삶의중심:자기성장|10년후:비전`
  - `serializeLifeBackground()` → `[인생 전환점] ...\n[현재 고민] ...\n[다시 선택한다면] ...`
  - 역직렬화: 구조화 포맷 + 자유 텍스트 하위호환
- **위저드 UI 컴포넌트**:
  - `ChipGroup` - 복수 선택 칩 (min/max 제약, Framer Motion)
  - `ScenarioSelect` - 시나리오 질문 단일 선택 카드
  - `MbtiSelector` - 4차원 바이너리 토글 + "모르겠어요"
  - `StepIndicator` - 3단계 프로그레스 인디케이터
- **`profile/edit/page.tsx`** (863줄):
  - Setup 모드 (`?setup=true`): 3단계 위저드 (성격 → 가치관 → 이야기)
  - Edit 모드: 아코디언 레이아웃 4섹션 (기본정보 + 위저드 3섹션)
  - 기존 자유 텍스트 데이터 하위호환

### Phase 15: 다국어 지원 (i18n)
- `lib/i18n/translations.ts` - 4개국어 번역 데이터 (ko, en, ja, zh)
- `lib/i18n/LanguageContext.tsx` - 언어 컨텍스트 프로바이더
- `components/ui/LanguageSwitcher.tsx` - 언어 전환 UI
- 번역 범위: hero, nav, features, preview, footer, about

### Phase 16: 이미지 최적화 & 브랜딩
- hero-visual: PNG 8.1MB → WebP 287KB (96.5% 감소), Next.js `<Image>` + `priority`
- ogtag: PNG 3.3MB → WebP 182KB (94.5% 감소)
- 로고: logo_nb.webp (64KB) 통일 사용
- favicon.ico: Pillow로 생성 (16x16 + 32x32)
- apple-icon.png: 180x180
- icon.svg: 펜촉 포크 디자인
- OG 태그 이미지 (`/ogtag.png`) 전체 적용
- DB 성능 인덱스 추가 (Migration: `add_performance_indexes`)

---

## 파일 구조

```
backend/
├── app/
│   ├── main.py                    # CORS, 라우터, 미들웨어 등록
│   ├── config.py                  # JWT, OAuth, Rate Limit, AI, SMTP 설정
│   ├── database.py                # SQLAlchemy 세션 관리
│   ├── exceptions.py              # 커스텀 예외 클래스
│   ├── api/
│   │   ├── health.py              # GET /health
│   │   ├── auth.py                # 회원가입/로그인/OAuth/인증/비밀번호
│   │   ├── users.py               # 사용자 CRUD (인증 보호)
│   │   └── scenarios.py           # 시나리오 생성/조회/피드백/이어쓰기
│   ├── models/
│   │   ├── user.py                # User (인증, 프로필, OAuth ID)
│   │   ├── scenario.py            # Scenario (rating, parent_scenario_id)
│   │   ├── usage_log.py           # UsageLog
│   │   └── token_blacklist.py     # TokenBlacklist
│   ├── schemas/
│   │   ├── auth.py                # Register/Login/Token/Verify/Password
│   │   ├── user.py                # User CRUD
│   │   ├── scenario.py            # Scenario 생성/목록/상세
│   │   └── validators.py          # 유효성 검증 유틸
│   ├── services/
│   │   ├── ai.py                  # AIService (프롬프트/RAG/스트리밍)
│   │   ├── auth.py                # JWT/bcrypt/블랙리스트
│   │   ├── email.py               # SMTP 이메일 발송
│   │   ├── kakao.py               # 카카오 OAuth
│   │   ├── google.py              # 구글 OAuth
│   │   └── rate_limiter.py        # 일일 사용량 제한
│   ├── dependencies/
│   │   ├── auth.py                # get_current_user, get_current_active_user
│   │   └── profile.py             # require_complete_profile
│   └── middleware/
│       ├── error_handler.py       # 전역 예외 핸들러
│       └── logging.py             # 요청/응답 로깅
├── alembic/versions/              # 19개 마이그레이션 파일
├── novels/trnt_ref/
│   ├── settings/
│   │   ├── era_1990s.md           # 1990년대 시대 맥락
│   │   ├── era_2000s.md           # 2000년대 시대 맥락
│   │   ├── era_2010s.md           # 2010년대 시대 맥락
│   │   ├── era_2020s.md           # 2020년대 시대 맥락
│   │   └── writing_guide.md       # 문체/톤/장르 심화 가이드
│   └── contents/examples/         # 장르×톤 예시 시나리오 (4종)
└── requirements.txt

frontend/
├── app/
│   ├── layout.tsx                 # 루트 레이아웃 (메타데이터, OG 태그)
│   ├── page.tsx                   # 랜딩 페이지
│   ├── login/page.tsx             # 로그인
│   ├── register/page.tsx          # 회원가입 (간소화)
│   ├── auth/callback/page.tsx     # OAuth 콜백
│   ├── dashboard/page.tsx         # 대시보드
│   ├── profile/
│   │   ├── edit/page.tsx          # 프로필 위저드 / 편집 (863줄)
│   │   └── password/page.tsx      # 비밀번호 변경
│   ├── scenarios/
│   │   ├── page.tsx               # 시나리오 목록
│   │   ├── new/page.tsx           # 시나리오 생성
│   │   └── [id]/page.tsx          # 시나리오 상세
│   ├── about/page.tsx             # 소개
│   ├── terms/page.tsx             # 이용약관
│   ├── privacy/page.tsx           # 개인정보처리방침
│   ├── sitemap.ts                 # 사이트맵
│   ├── favicon.ico                # 파비콘
│   ├── apple-icon.png             # Apple 터치 아이콘
│   └── icon.svg                   # SVG 아이콘
├── components/
│   ├── auth/
│   │   └── VerificationModal.tsx  # 이메일 인증 모달
│   └── ui/
│       ├── Button.tsx             # 버튼
│       ├── Input.tsx              # 입력 필드
│       ├── Textarea.tsx           # 텍스트 영역
│       ├── GlassCard.tsx          # 글래스모피즘 카드
│       ├── GradientButton.tsx     # 그라디언트 버튼
│       ├── Logo.tsx               # 로고 (logo_nb.webp)
│       ├── LanguageSwitcher.tsx   # 4개국어 전환
│       ├── ChipGroup.tsx          # 복수 선택 칩
│       ├── ScenarioSelect.tsx     # 시나리오 질문 카드
│       ├── MbtiSelector.tsx       # MBTI 토글
│       └── StepIndicator.tsx      # 단계 인디케이터
├── lib/
│   ├── api.ts                     # Axios + 토큰 자동 리프레시
│   ├── utils.ts                   # cn() (clsx + tailwind-merge)
│   ├── profileConstants.ts        # 프로필 옵션 상수
│   ├── profileSerializer.ts       # 구조화 데이터 직렬화/역직렬화
│   └── i18n/
│       ├── translations.ts        # 4개국어 번역 데이터
│       └── LanguageContext.tsx     # 언어 컨텍스트
├── store/
│   └── authStore.ts               # Zustand 인증 상태
├── types/
│   └── index.ts                   # API 타입 정의
└── public/
    ├── hero-visual.webp           # 히어로 이미지 (287KB)
    ├── logo_nb.webp               # 로고 (투명 배경, 64KB)
    └── ogtag.png                  # OG 태그 이미지
```

---

## API 엔드포인트 전체 목록

### 인증 (`/api/v1/auth`)
| Method | Path | 설명 |
|--------|------|------|
| POST | `/register` | 회원가입 (Turnstile 인증) |
| POST | `/verify-email` | 이메일 인증 (6자리 코드) |
| POST | `/login` | 로그인 |
| POST | `/refresh` | 토큰 갱신 |
| GET | `/me` | 현재 사용자 정보 |
| POST | `/logout` | 로그아웃 (토큰 블랙리스트) |
| POST | `/forgot-password` | 비밀번호 재설정 이메일 |
| POST | `/reset-password` | 비밀번호 재설정 |
| POST | `/change-password` | 비밀번호 변경 |
| GET | `/kakao/login` | 카카오 인증 URL |
| GET | `/kakao/callback` | 카카오 콜백 |
| GET | `/google/login` | 구글 인증 URL |
| GET | `/google/callback` | 구글 콜백 |

### 시나리오 (`/api/v1/scenarios`)
| Method | Path | 설명 |
|--------|------|------|
| POST | `/generate` | 시나리오 생성 (동기) |
| POST | `/generate/stream` | 시나리오 생성 (SSE 스트리밍) |
| GET | `/` | 내 시나리오 목록 |
| GET | `/{id}` | 시나리오 상세 |
| DELETE | `/{id}` | 시나리오 삭제 |
| POST | `/{id}/rate` | 좋아요/싫어요 피드백 |
| POST | `/{id}/continue/stream` | 이어쓰기 (SSE 스트리밍) |

### 사용자 (`/api/v1/users`)
| Method | Path | 설명 |
|--------|------|------|
| GET | `/` | 사용자 목록 |
| GET | `/{id}` | 사용자 상세 |
| PUT | `/{id}` | 사용자 정보 수정 |

---

## 보안 설정

### .env 필수 항목
```env
# DB
DATABASE_URL=postgresql+asyncpg://user:pass@host/trnt

# JWT
SECRET_KEY=<32자 이상 랜덤 문자열>
JWT_ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=15
REFRESH_TOKEN_EXPIRE_DAYS=30

# 카카오 OAuth
KAKAO_CLIENT_ID=<카카오 REST API 키>
KAKAO_CLIENT_SECRET=<카카오 Client Secret>
KAKAO_REDIRECT_URI=https://domain/api/v1/auth/kakao/callback

# 구글 OAuth
GOOGLE_CLIENT_ID=<구글 Client ID>
GOOGLE_CLIENT_SECRET=<구글 Client Secret>
GOOGLE_REDIRECT_URI=https://domain/api/v1/auth/google/callback

# SMTP (이메일 인증)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=<이메일>
SMTP_PASSWORD=<앱 비밀번호>

# AI
GROQ_API_KEY=<Groq API 키>
RAG_ENABLED=true
RAG_NOVELS_DIR=novels/trnt_ref

# Rate Limiting
DAILY_FREE_LIMIT=3

# Turnstile (CAPTCHA)
TURNSTILE_SECRET_KEY=<Cloudflare Turnstile Secret>
```

### 프로덕션 배포 시 주의사항
1. `SECRET_KEY` 반드시 변경
2. 카카오/구글 개발자 콘솔에서 실제 키 발급 + redirect URI 설정
3. CORS origins를 프로덕션 도메인으로 제한
4. `.env` 파일은 git에 커밋하지 않기 (`.gitignore`에 포함됨)

---

## 주요 기능 요약

### 인증 & 권한
- 이메일 회원가입 + 6자리 코드 이메일 인증
- Turnstile CAPTCHA (봇 방지)
- JWT 액세스/리프레시 토큰 + 토큰 블랙리스트
- 카카오/구글 OAuth 2.0 로그인
- 비밀번호 재설정 (이메일 링크)
- 프로필 완성 체크 (미완성 시 시나리오 생성 차단)

### 프로필 시스템
- 회원가입: 계정 + 인구통계만 (간소화)
- 프로필 위저드 3단계: 성격(시나리오 질문+MBTI+키워드) → 가치관 → 나의 이야기
- 구조화 포맷으로 DB 저장 (personality, values, life_background)
- AI가 구조화 데이터를 자연어로 변환하여 프롬프트에 활용

### AI 시나리오 생성
- Groq API (qwen/qwen3-32b) SSE 스트리밍
- 톤(3) × 장르(4) × 범위(3) × 상세도(3) = 108가지 조합
- 사용자 프로필 기반 개인화 시나리오
- RAG: 시대 맥락 + 문체 가이드 + 예시 시나리오 + 좋아요 자동 축적
- 이어쓰기: 기존 시나리오 + 사용자 프로필 일관성 유지

### 사용량 제한
- 일일 무료 3회 제한
- DB 기반 추적, 429 에러 + 리셋 시간 안내

### 프론트엔드
- Next.js App Router + TypeScript + Tailwind CSS
- 글래스모피즘 다크 테마 디자인
- 4개국어 지원 (ko, en, ja, zh)
- 이미지 WebP 최적화 (총 93%+ 용량 감소)
- SEO: OG 태그, 사이트맵, 메타데이터

---

## 다음 단계

1. **테스트 코드**: pytest + httpx API 테스트
2. **결제 시스템**: 무제한 플랜 (토스페이먼츠/Stripe)
3. **시나리오 공유**: SNS 공유 + 공개 시나리오
4. **모니터링**: 에러 추적, 사용량 대시보드
5. **모바일 앱**: React Native 또는 Flutter
