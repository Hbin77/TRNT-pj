# TRNT Database Schema (MVP)

## 컨셉

- **사용자 프로필만 저장** — 시나리오 결과는 저장하지 않음 (실시간 생성)
- **분기점은 매번 입력** — DB에 저장 X, API 요청 시 전달
- **프로필 기반 시나리오** — 사용자의 배경/성향에 맞는 "그 사람다운" 이야기 생성

## ERD 요약
```
users (단일 테이블)
```

## 서비스 흐름
```
1. 사용자 프로필 입력 (최초 1회, DB 저장)
   ↓
2. 분기점 입력 (저장 X, 실시간 전달)
   예: "2015년에 문과 갔으면?"
   ↓
3. AI가 [프로필 + 분기점] 조합해서 시나리오 생성
   ↓
4. 결과 표시 (저장 X)
```

## 테이블 정의

### users

| 컬럼 | 타입 | 제약조건 | 설명 |
|------|------|----------|------|
| **id** | UUID | PK | 고유 식별자 |
| **email** | VARCHAR(255) | UNIQUE, NULL 허용 | 로그인/계정용 (익명은 null) |
| | | | |
| **── 기본 정보 ──** | | | |
| name | VARCHAR(100) | NOT NULL | 이름 (닉네임 가능) |
| birth_year | INT | NOT NULL | 출생연도 (예: 1995) |
| gender | VARCHAR(20) | NULL 허용 | 남/여/기타 |
| | | | |
| **── 현재 상태 ──** | | | |
| occupation | VARCHAR(100) | NOT NULL | 직업 (예: 개발자, 학생) |
| education | VARCHAR(50) | NULL 허용 | 학력 (고졸/대졸/대학원) |
| major | VARCHAR(100) | NULL 허용 | 전공 |
| residence | VARCHAR(100) | NULL 허용 | 거주지 |
| relationship_status | VARCHAR(50) | NULL 허용 | 연애/결혼 상태 |
| | | | |
| **── 배경 스토리 ──** | | | |
| life_background | TEXT | NOT NULL | 인생 배경 (살아온 이야기) |
| key_events | TEXT | NULL 허용 | 주요 사건들 (선택적 상세) |
| | | | |
| **── 성향 ──** | | | |
| personality | VARCHAR(100) | NULL 허용 | 성격/MBTI |
| values | VARCHAR(200) | NULL 허용 | 가치관 (안정/도전/관계 등) |
| | | | |
| **── 시스템 ──** | | | |
| created_at | TIMESTAMP | NOT NULL, DEFAULT NOW() | 생성일 |
| updated_at | TIMESTAMP | NOT NULL, DEFAULT NOW() | 수정일 |

## 시나리오 생성 API 요청 예시 (DB 저장 X)
```json
POST /api/v1/scenarios/generate

{
  "user_id": "abc-123",
  
  "branch": {
    "occurred_at": "2015년 고2",
    "original_choice": "이과 선택",
    "alternative_choice": "문과 선택",
    "context": "부모님은 이과를 권했지만 국어를 좋아했음"
  },
  
  "options": {
    "tone": "realistic",
    "genre": "drama",
    "detail_level": "normal",
    "scope": "long"
  }
}
```

## ENUM 값 (API 요청 시 사용)

| 항목 | 값 | 설명 |
|------|-----|------|
| **tone** | `optimistic` | 낙관적 |
| | `realistic` | 현실적 |
| | `pessimistic` | 비관적 |
| **genre** | `romance` | 로맨스 |
| | `success` | 성공담 |
| | `healing` | 힐링 |
| | `drama` | 드라마 |
| **detail_level** | `summary` | 요약본 |
| | `normal` | 일반 |
| | `novel` | 상세 (소설형) |
| **scope** | `short` | 단기 (1년) |
| | `medium` | 중기 (5년) |
| | `long` | 장기 (현재까지) |
| **relationship_status** | `single` | 미혼 |
| | `dating` | 연애 중 |
| | `married` | 기혼 |
| | `etc` | 기타 |

## Phase 3에서 추가 예정

- `subscriptions` 테이블 — 구독 플랜 관리
- `usage_logs` 테이블 — 일일 사용량 추적 (무료 3회 제한)

## 장점

1. **DB 용량 절약** — 사용자 프로필만 저장, 시나리오는 일회성
2. **구조 단순** — 테이블 1개로 관리 용이
3. **유연함** — 분기점을 자유롭게 변경 가능
4. **개인화** — 프로필 기반으로 "그 사람다운" 시나리오 생성
5. **확장성** — email 있어서 나중에 로그인 기능 추가 가능