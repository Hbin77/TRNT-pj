# TRNT Database Schema

## 컨셉

- **사용자 프로필 저장** — 회원가입 시 계정+인구통계, 이후 프로필 위저드로 성격/가치관/배경 완성
- **시나리오 결과 저장** — 생성된 시나리오 DB 저장, 목록/상세 조회, 피드백(좋아요/싫어요)
- **이어쓰기 지원** — 기존 시나리오를 기반으로 후속 이야기 생성 (parent_scenario_id)

## ERD 요약
```
users ──< scenarios
users ──< usage_logs
scenarios ──< scenarios (self-ref: parent_scenario_id)
```

## 서비스 흐름
```
1. 회원가입 (계정 + 인구통계 → DB 저장)
   ↓
2. 이메일 인증 (6자리 코드)
   ↓
3. 프로필 위저드 (3단계: 성격 → 가치관 → 나의 이야기)
   → personality, values, life_background 필드에 구조화 포맷으로 저장
   ↓
4. 분기점 입력 + 톤/장르/분량/시간범위 선택
   ↓
5. AI가 [프로필 + 분기점 + RAG 시대맥락] 조합해서 시나리오 생성 (SSE 스트리밍)
   ↓
6. 결과 표시 + DB 저장 + 피드백(좋아요 → RAG 자동 축적)
```

## 테이블 정의

### users

| 컬럼 | 타입 | 제약조건 | 설명 |
|------|------|----------|------|
| **id** | UUID | PK | 고유 식별자 |
| **email** | VARCHAR(255) | UNIQUE, NULL 허용 | 로그인/계정용 |
| **hashed_password** | VARCHAR(255) | NULL 허용 | bcrypt 해싱 (OAuth 유저는 null) |
| **auth_provider** | VARCHAR(20) | DEFAULT 'email' | 인증 방식 (email/kakao/google) |
| **kakao_id** | VARCHAR(50) | NULL 허용 | 카카오 고유 ID |
| **google_id** | VARCHAR(50) | NULL 허용 | 구글 고유 ID |
| **is_active** | BOOLEAN | DEFAULT true | 계정 활성 상태 |
| **is_verified** | BOOLEAN | DEFAULT false | 이메일 인증 여부 |
| | | | |
| **── 기본 정보 ──** | | | |
| name | VARCHAR(100) | NOT NULL | 이름 |
| birth_year | INT | NOT NULL | 출생연도 (예: 1995) |
| gender | VARCHAR(20) | NULL 허용 | 남성/여성/기타/비공개 |
| | | | |
| **── 현재 상태 ──** | | | |
| occupation | VARCHAR(100) | NOT NULL | 직업 (드롭다운: 학생, 회사원, 공무원 등 12종 + 기타) |
| education | VARCHAR(50) | NULL 허용 | 학력 (고등학교~대학원(박사) + 기타) |
| major | VARCHAR(100) | NULL 허용 | 전공 (대학 이상일 때만) |
| residence | VARCHAR(100) | NULL 허용 | 거주지 (서울~제주 + 해외) |
| relationship_status | VARCHAR(50) | NULL 허용 | 미혼/연애중/기혼/기타 |
| | | | |
| **── 심리 프로파일링 (구조화 포맷) ──** | | | |
| personality | VARCHAR(100) | NULL 허용 | `결정:직감형/변화:도전형/관계:소수깊게/실패:분석개선\|ENFP\|감성적,모험적` |
| values | VARCHAR(200) | NULL 허용 | `자유,성장,도전\|삶의중심:자기성장과배움\|10년후:비전텍스트` |
| | | | |
| **── 배경 스토리 (가이드 질문) ──** | | | |
| life_background | TEXT | NOT NULL | `[인생 전환점] ...\n[현재 고민] ...\n[다시 선택한다면] ...` |
| key_events | TEXT | NULL 허용 | 인생 전환점 답변 |
| | | | |
| **── 시스템 ──** | | | |
| created_at | TIMESTAMP | NOT NULL, DEFAULT NOW() | 생성일 |
| updated_at | TIMESTAMP | NOT NULL, DEFAULT NOW() | 수정일 |

### scenarios

| 컬럼 | 타입 | 제약조건 | 설명 |
|------|------|----------|------|
| **id** | UUID | PK | 고유 식별자 |
| **user_id** | UUID | FK → users.id | 작성자 |
| **branch_data** | JSONB | NOT NULL | 분기점 정보 (occurred_at, original_choice, alternative_choice, context) |
| **tone** | VARCHAR(20) | NOT NULL | optimistic / realistic / pessimistic |
| **genre** | VARCHAR(20) | NOT NULL | romance / success / healing / drama |
| **detail_level** | VARCHAR(20) | NOT NULL | summary / normal / novel |
| **scope** | VARCHAR(20) | NOT NULL | short / medium / long |
| **scenario_text** | TEXT | NOT NULL | 생성된 시나리오 본문 |
| **word_count** | INT | | 단어 수 |
| **rating** | VARCHAR(10) | NULL 허용 | like / dislike |
| **parent_scenario_id** | UUID | FK → scenarios.id, NULL 허용 | 이어쓰기 원본 |
| **created_at** | TIMESTAMP | NOT NULL, DEFAULT NOW() | 생성일 |

### usage_logs

| 컬럼 | 타입 | 제약조건 | 설명 |
|------|------|----------|------|
| **id** | UUID | PK | 고유 식별자 |
| **user_id** | UUID | FK → users.id | 사용자 |
| **used_at** | TIMESTAMP | NOT NULL | 사용 시간 |

## 프로필 구조화 포맷 상세

### personality 필드 (max 100자)
```
시나리오응답|MBTI|성격키워드
결정:직감형/변화:도전형/관계:소수깊게/실패:분석개선|ENFP|감성적,모험적,낙천적
```

**시나리오 질문 (4개, 각 단일 선택):**
- 결정: 직감형 / 분석형 / 의견수렴형 / 신중형
- 변화: 설렘형 / 도전형 / 안전형 / 관찰형
- 관계: 다양형 / 소수깊게 / 독립형 / 유연형
- 실패: 회복형 / 분석개선 / 성찰형 / 방향전환

### values 필드 (max 200자)
```
핵심가치(콤마)|삶의중심:값|10년후:값
자유,성장,도전,창의성,자아실현|삶의중심:자기성장과배움|10년후:내 사업을 운영하며 가족과 함께
```

### life_background 필드
```
[인생 전환점] 대학교 때 전공을 바꿨어요
[현재 고민] 이직을 할지 말지
[다시 선택한다면] 유학을 갔을 거예요
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
| **detail_level** | `summary` | 요약본 (2048 tokens) |
| | `normal` | 일반 (4096 tokens) |
| | `novel` | 상세/소설형 (8192 tokens) |
| **scope** | `short` | 단기 (1년) |
| | `medium` | 중기 (5년) |
| | `long` | 장기 (10년+) |

## 시나리오 생성 API 요청 예시
```json
POST /api/v1/scenarios/generate/stream

{
  "branch": {
    "occurred_at": "2015년 고2",
    "original_choice": "이과 선택",
    "alternative_choice": "문과 선택",
    "context": "부모님은 이과를 권했지만 국어를 좋아했음"
  },
  "tone": "realistic",
  "genre": "drama",
  "detail_level": "normal",
  "scope": "medium"
}
```
