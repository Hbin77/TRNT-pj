# TRNT (The Road Not Taken)

**평행세계 인생 시뮬레이터** — 과거의 "가지 않았던 길"을 AI가 소설형 시나리오로 그려주는 서비스.

## 기술 스택

| 영역 | 기술 |
|------|------|
| **Frontend** | Next.js (App Router), TypeScript, Tailwind CSS, Framer Motion, Zustand |
| **Backend** | Python, FastAPI, SQLAlchemy (async), Alembic |
| **DB** | PostgreSQL (Docker) |
| **AI** | Groq API (qwen/qwen3-32b), RAG (시대 맥락 + 문체 가이드 + 예시 시나리오) |
| **인증** | JWT + Refresh Token, 카카오/구글 OAuth 2.0, 이메일 인증 (6자리 코드) |
| **인프라** | Vercel (Frontend), Synology NAS + Docker (Backend), Cloudflare Tunnel |

## 문서

| 문서 | 설명 |
|------|------|
| [**구현 요약**](IMPLEMENTATION_SUMMARY.md) | Phase 1~16 구현 내역, 파일 구조, API 목록 |
| [DB 스키마](schema.md) | 테이블 정의, 구조화 포맷, ENUM 값 |
| [개발 계획서](DEVELOPMENT_PLAN.md) | Phase 1~4 로드맵, API·DB 초안 |
| [작업 순서](TASK_ORDER.md) | 의존성 반영 체크리스트 |
| [소셜 로그인 설정](SOCIAL_LOGIN_SETUP.md) | 카카오/구글 OAuth 설정 가이드 |

## 빠른 시작

### Backend
```bash
cd backend
python -m venv venv && source venv/bin/activate
pip install -r requirements.txt
cp .env.example .env  # .env 설정 후
alembic upgrade head
uvicorn app.main:app --reload
```

### Frontend
```bash
cd frontend
npm install
cp .env.local.example .env.local  # API URL 설정 후
npm run dev
```

### 서비스 URL
- Frontend: `http://localhost:3000`
- Backend API: `http://localhost:8000`
- API 문서: `http://localhost:8000/docs`
- Production: `https://trnt.hbinserver.cloud`
