# TRNT (The Road Not Taken) 개발 계획서

> 평행세계 인생 시뮬레이터 — 사업계획서 기반 구체 개발 로드맵  
> 최종 갱신: 2025년 1월

---

## 1. 프로젝트 요약

| 항목 | 내용 |
|------|------|
| **프로젝트명** | TRNT (The Road Not Taken) |
| **한줄 정의** | 과거 선택의 분기점을 입력하면, AI가 "다른 길을 택했을 때의 인생"을 소설형 시나리오로 생성하는 서비스 |
| **핵심 가치** | 성찰(Reflection), 위로(Comfort), 통찰(Insight), 재미(Fun) |
| **목표 사용자** | 20–30대 MZ세대, 생 전환기(이직/결혼/진학), 셀프케어·멘탈헬스 관심층 |

---

## 2. 기술 스택 (확정)

| 영역 | 기술 | 비고 |
|------|------|------|
| **프론트엔드** | Next.js, Vercel | Cloudflare 연동, 고성능 배포 |
| **백엔드** | Python, FastAPI, Docker | Synology NAS Container Manager 24h 구동 |
| **DB** | PostgreSQL | NAS 내부 Docker 컨테이너 |
| **AI** | LM Studio + 파인튜닝 LLM (Llama 3 기반) | M3 Pro 파인튜닝 → Groq/OpenRouter API 서빙 |
| **인프라** | Cloudflare Tunnel + Synology NAS | 외부 노출 비용 없이 보안 터널링 |

---

## 3. MVP 범위 (Phase 1 필수 기능)

- **인생 분기점 입력**
  - 시간(언제), 원래 선택, 대안 선택, 맥락(상황·고민·환경), 현재 자신 상태(직업·인적사항 등)
- **시나리오 생성**
  - 단기(선택 직후 1년), 중기(5년 후), 장기(현재 시점까지) 중 최소 1종 지원
- **톤/장르 선택**
  - 톤: 낙관적 / 현실적 / 비관적  
  - 장르: 로맨스 / 성공담 / 힐링 / 드라마  
  - 상세도: 요약본 / 일반 / 상세(소설형) 중 1~2단계
- **결과 표시**
  - 생성된 시나리오 텍스트 표시, 간단 저장(로컬/세션)
- **초기 유저 피드백**
  - 설문/피드백 폼 또는 간단 NPS

---

## 4. 단계별 개발 로드맵

### Phase 1: MVP 개발 (1월 ~ 3월)

**목표:** 웹 UI 프레임워크 구축, MVP 핵심 기능 구현, 초기 유저 피드백 수집

#### 4.1.1 인프라·프로젝트 셋업 (1월 1~2주)

| # | 작업 | 담당 | 산출물 | 완료 기준 |
|---|------|------|--------|-----------|
| 1.1 | 저장소 구조 설계 | PM/개발 | `README`, 디렉터리 구조 | frontend/backend/docs 분리 확정 |
| 1.2 | Next.js 프로젝트 초기화 | FE | `trnt-web` (또는 `frontend/`) | Vercel 배포 연동, ESLint/TS 설정 |
| 1.3 | FastAPI 프로젝트 초기화 | BE | `trnt-api` (또는 `backend/`) | Docker 이미지 빌드, 헬스체크 엔드포인트 |
| 1.4 | PostgreSQL 스키마 초기 설계 | BE | ERD, 마이그레이션 스크립트 | users, scenarios, branches 테이블 초안 |
| 1.5 | NAS Docker Compose 작성 | BE/인프라 | `docker-compose.yml` | API + DB 컨테이너 기동, 내부 통신 확인 |
| 1.6 | Cloudflare Tunnel 연동 | 인프라 | 터널 설정 문서 | 로컬/NAS API 외부 HTTPS 접근 가능 |

#### 4.1.2 백엔드 API (1월 3주 ~ 2월 2주)

| # | 작업 | 담당 | 산출물 | 완료 기준 |
|---|------|------|--------|-----------|
| 2.1 | 사용자·세션 모델 및 API | BE | `User`, `Session` API | 회원가입/로그인(이메일 또는 소셜) 또는 익명 세션 |
| 2.2 | 분기점(Branch) 모델 및 CRUD | BE | `Branch` API | 분기점 생성/조회/수정/삭제 |
| 2.3 | 시나리오 생성 API 스펙 | BE | API 명세서 | 입력(분기점 ID, 톤, 장르, 상세도), 출력(텍스트) 스키마 |
| 2.4 | AI 연동 1차: 외부 API (Groq/OpenRouter) | BE | `POST /scenarios/generate` | 실제 LLM 호출, 동기 또는 큐 기반 응답 |
| 2.5 | 시나리오 저장·조회 API | BE | `Scenario` CRUD | 생성된 시나리오 DB 저장 및 목록/상세 조회 |
| 2.6 | rate limit, 에러 핸들링 | BE | 미들웨어, 로깅 | 일 3회 무료 등 제한, 4xx/5xx 일관 처리 |

#### 4.1.3 프론트엔드 UI (2월 1주 ~ 3월 1주)

| # | 작업 | 담당 | 산출물 | 완료 기준 |
|---|------|------|--------|-----------|
| 3.1 | 디자인 시스템 기초 | FE | 색상, 타이포, 버튼/카드 컴포넌트 | Figma 또는 스타일 가이드 문서 |
| 3.2 | 랜딩·온보딩 페이지 | FE | `/`, `/onboarding` | 서비스 소개, CTA, 첫 분기점 입력 유도 |
| 3.3 | 분기점 입력 폼 | FE | `/branch/new`, `/branch/[id]/edit` | 시간, 원래/대안 선택, 맥락, 현재 상태 입력 |
| 3.4 | 톤/장르/상세도 선택 UI | FE | 모달 또는 스텝 폼 | 선택값 API로 전달 |
| 3.5 | 시나리오 생성 진행·결과 화면 | FE | `/scenario/[id]` | 로딩 상태, 생성된 텍스트 표시, 공유/저장 버튼 |
| 3.6 | 시나리오 목록·상세 | FE | `/scenarios`, `/scenario/[id]` | 내 시나리오 목록, 상세 읽기 |
| 3.7 | 반응형·접근성 점검 | FE | 체크리스트 | 모바일 뷰, 키보드/스크린리더 기본 대응 |

#### 4.1.4 AI 파이프라인 (2월 ~ 3월)

| # | 작업 | 담당 | 산출물 | 완료 기준 |
|---|------|------|--------|-----------|
| 4.1 | 프롬프트 템플릿 설계 | PM/AI | 선택–결과 시나리오용 프롬프트 세트 | 톤/장르별 1차 버전 |
| 4.2 | GPT-4o 등으로 시나리오 샘플 생성 | AI | 샘플 JSON/텍스트 50건 이상 | 파인튜닝용 "선택–결과" 쌍 수집 |
| 4.3 | LM Studio 로컬 추론 테스트 | AI | 실험 노트 | Llama 3 기반 동작 확인, 출력 품질 체크 |
| 4.4 | Groq/OpenRouter 프로덕션 연동 | BE | 환경변수, API 래퍼 | NAS에서 외부 API 호출, fallback 정책 |

#### 4.1.5 테스트·배포·피드백 (3월)

| # | 작업 | 담당 | 산출물 | 완료 기준 |
|---|------|------|--------|-----------|
| 5.1 | E2E 시나리오 1개 (분기점 입력 → 시나리오 생성 → 저장) | QA/FE | E2E 스크립트 또는 수동 시나리오 | 문서화된 테스트 케이스 |
| 5.2 | Vercel 프로덕션 배포, 도메인 연결 | FE/인프라 | https://trnt.도메인 | HTTPS, 환경변수 설정 |
| 5.3 | 베타 초대 및 피드백 폼 | PM | Google Form 또는 in-app 폼 | 응답 20건 이상 수집 목표 |
| 5.4 | Phase 1 회고 및 Phase 2 스코프 확정 | PM | 회고 문서, Phase 2 태스크 리스트 | 우선순위 반영된 백로그 |

---

### Phase 2: 품질·인프라 고도화 (3월 상반 ~ 4월 하반)

**목표:** 비용 절감·품질 고도화, 베타 테스트, 파인튜닝 최적화, NAS·Cloudflare 안정화

| # | 대분류 | 세부 작업 | 산출물 |
|---|--------|-----------|--------|
| 2.1 | AI | MLX + LM Studio LoRA 파인튜닝 (M3 Pro) | 파인튜닝된 LoRA 가중치, 추론 스크립트 |
| 2.2 | AI | 파인튜닝 모델 NAS 또는 Groq/OpenRouter 서빙 | 서빙 API 엔드포인트, A/B 테스트 준비 |
| 2.3 | AI | 사용자 피드백 기반 프롬프트·모델 개선 | 프롬프트 v2, 품질 메트릭 대시보드 |
| 2.4 | 인프라 | NAS Docker 고가용성, 로그·모니터링 | 알람, 재시작 정책, 로그 수집 |
| 2.5 | 인프라 | Cloudflare 캐시·보안 정책 | WAF, rate limit, 정적 자산 캐시 |
| 2.6 | 제품 | 베타 테스트 (초대 50~100명) | 버그 리스트, NPS/만족도 |
| 2.7 | 제품 | 단기/중기/장기 시나리오 전부 지원 | API·UI 연동 완료 |

---

### Phase 3: 정식 런칭·수익화 (5월 상반)

**목표:** 정식 서비스 런칭, 결제 연동, 마케팅 본격화, 데이터 기반 개선

| # | 대분류 | 세부 작업 | 산출물 |
|---|--------|-----------|--------|
| 3.1 | 결제 | 무료 3회/일, 베이직(월 4,900원), 프리미엄(월 9,900원) 정책 구현 | 구독 플랜 테이블, 결제 웹훅 |
| 3.2 | 결제 | 토스페이먼츠 또는 Stripe 연동 | 결제·환불 플로우, 영수증 |
| 3.3 | 제품 | 건당 결제(1회 1,500원) 옵션 | API·UI |
| 3.4 | 마케팅 | 랜딩 페이지 개선, ASO·리뷰 전략 | 캠페인 문서, Store 리스팅 |
| 3.5 | 데이터 | 대시보드 (DAU, 생성 수, 구독 전환) | Metabase 또는 간단 대시보드 |

---

### Phase 4: 확장 (6월 상반 ~)

**목표:** 서비스 확장, 수익 다변화, 다국어·모바일·B2B

| # | 대분류 | 세부 작업 | 산출물 |
|---|--------|-----------|--------|
| 4.1 | 제품 | 다국어 (영어, 일본어, 중국어) | i18n, 번역 API 또는 다국어 프롬프트 |
| 4.2 | 제품 | 모바일 앱 (iOS/Android) | React Native 또는 Flutter 검토 |
| 4.3 | 제품 | 시나리오 Book 변환 (실물책 15,000원) | 주문·제작 파이프라인 |
| 4.4 | B2B | HR·교육용 의사결정 훈련 프로그램 | B2B 요금제, 온보딩 자료 |

---

## 5. API 설계 초안

### 5.1 시나리오 생성

```
POST /api/v1/scenarios/generate
Content-Type: application/json

Request:
{
  "branch_id": "uuid",
  "tone": "optimistic" | "realistic" | "pessimistic",
  "genre": "romance" | "success" | "healing" | "drama",
  "detail_level": "summary" | "normal" | "novel",
  "scope": "short" | "medium" | "long"
}

Response (202 Accepted, polling 또는 200 with stream):
{
  "job_id": "uuid",
  "status": "pending" | "processing" | "completed" | "failed"
}

GET /api/v1/scenarios/jobs/{job_id}
Response:
{
  "status": "completed",
  "scenario_id": "uuid",
  "text": "..." // when completed
}
```

### 5.2 분기점(Branch)

```
POST   /api/v1/branches          — 생성
GET    /api/v1/branches          — 목록 (페이지네이션)
GET    /api/v1/branches/{id}     — 상세
PATCH  /api/v1/branches/{id}     — 수정
DELETE /api/v1/branches/{id}     — 삭제
```

**Branch body 예시:**

```json
{
  "occurred_at": "2015-03",
  "original_choice": "이과 선택",
  "alternative_choice": "문과 선택",
  "context": "고등학교 2학년 때 진로 고민",
  "current_state": "현재 30세, IT 기업 개발자"
}
```

---

## 6. DB 스키마 초안

- **users**: id, email, name, created_at, updated_at
- **branches**: id, user_id, occurred_at, original_choice, alternative_choice, context, current_state, created_at
- **scenarios**: id, branch_id, user_id, tone, genre, detail_level, scope, text, status, created_at
- **subscriptions**: id, user_id, plan (free/basic/premium), started_at, expires_at

(Phase 1에서는 users를 익명 세션으로 대체할 수 있음.)

---

## 7. 리스크·선행 조건

| 리스크 | 대응 |
|--------|------|
| LLM 비용 과다 | Groq 등 저비용 API 우선, 캐시·일 제한 |
| NAS 단일 장애점 | 백업·스냅샷, 재기동 자동화 |
| 파인튜닝 리소스 부족 | LoRA만 적용, 외부 API fallback 유지 |
| 개인정보·윤리 | 분기점·시나리오 암호화, 이용약관·개인정보처리방침 필수 |

---

## 8. 성공 지표 (Phase 1)

- [ ] 웹 MVP 배포 완료 (HTTPS, 도메인)
- [ ] 분기점 입력 → 시나리오 생성 → 저장 플로우 1회 성공
- [ ] 베타 피드백 20건 이상 수집
- [ ] Phase 2 태스크 우선순위 확정

---

이 문서는 사업계획서(TRNT_사업계획서.docx)를 바탕으로 개발 관점에서 구체화한 계획입니다.  
주간 단위로 태스크를 스프린트에 배치하고, 완료 여부는 이 문서 또는 프로젝트 이슈/칸반으로 추적하는 것을 권장합니다.
