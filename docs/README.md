# TRNT (The Road Not Taken)

**평행세계 인생 시뮬레이터** — 과거의 "가지 않았던 길"을 AI가 소설형 시나리오로 그려주는 서비스.

## 문서

| 문서 | 설명 |
|------|------|
| [사업계획서](etc/TRNT_사업계획서.docx) | 사업 개요, 비전, 시장·비즈니스 모델, 기술 스택, 로드맵 |
| [개발 계획서](docs/DEVELOPMENT_PLAN.md) | 사업계획서 기반 **구체 개발 로드맵** (Phase 1~4, API·DB 초안, MVP 태스크) |

## 기술 스택 (예정)

- **Frontend:** Next.js, Vercel
- **Backend:** Python, FastAPI, Docker
- **DB:** PostgreSQL (NAS Docker)
- **AI:** Llama 3 기반 파인튜닝 → Groq/OpenRouter 서빙
- **Infra:** Cloudflare Tunnel, Synology NAS

## 빠른 시작

개발 환경 셋업 및 실행 방법은 [개발 계획서](docs/DEVELOPMENT_PLAN.md) Phase 1의 인프라·프로젝트 셋업 섹션을 참고하세요.
