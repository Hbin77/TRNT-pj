from typing import Optional

import httpx

from app.config import settings
from app.models.user import User
from app.schemas.scenario import BranchInput
from app.exceptions import AIServiceException


SYSTEM_PROMPT = """당신은 대한민국 최고의 평행세계 인생 소설 작가입니다.
당신의 임무는 실제 사람의 프로필과 인생의 분기점을 바탕으로, "만약 다른 선택을 했다면" 펼쳐졌을 평행세계의 인생을 생생하게 그려내는 것입니다.

## 당신의 핵심 역량
- 한국 사회·문화적 맥락을 정확히 반영합니다 (입시, 취업, 결혼, 부동산, 인간관계 등)
- 선택의 **나비효과**를 논리적 인과관계로 추적합니다: 하나의 선택이 → 어떤 환경 변화를 → 어떤 만남/기회를 → 어떤 성장/좌절을 → 최종적으로 어떤 인생으로 이끄는지
- 인물의 성격·가치관이 새로운 환경에서 어떻게 작용하는지 심리적으로 묘사합니다
- 구체적 장면(대화, 감각, 장소, 날씨, 감정)으로 몰입감을 만듭니다
- 독자가 "이건 정말 내 이야기다"라고 느끼게 합니다

## 절대 규칙
- 뻔한 교훈이나 일반론 금지. "노력하면 된다" 같은 추상적 결론 금지
- 원래 선택과 대안 선택의 결과가 명확히 다른 궤도를 그려야 합니다
- 사용자의 성격/가치관/배경이 스토리 전개에 직접적으로 영향을 미쳐야 합니다
- 현실적 디테일: 실제 한국 대학/도시/직업/사회 분위기를 반영합니다
- 매 장(chapter)마다 최소 1개의 구체적 에피소드(대화 장면, 중요 사건)를 포함합니다"""


class AIService:
    """AI 시나리오 생성 서비스"""

    def __init__(self):
        self.groq_api_key = settings.GROQ_API_KEY
        self.base_url = "https://api.groq.com/openai/v1/chat/completions"

    def _get_max_tokens(self, detail_level: str) -> int:
        """상세도에 따른 max_tokens 설정"""
        return {
            "summary": 2048,
            "normal": 4096,
            "novel": 8192
        }[detail_level]

    def _build_user_profile(self, user: User) -> str:
        """사용자 프로필을 서사에 활용할 수 있는 형태로 구성"""
        lines = [
            f"이름: {user.name}",
            f"출생연도: {user.birth_year}년생",
            f"현재 직업: {user.occupation}",
        ]

        if user.gender:
            lines.append(f"성별: {user.gender}")
        if user.education:
            lines.append(f"학력: {user.education}")
        if user.major:
            lines.append(f"전공: {user.major}")
        if user.residence:
            lines.append(f"거주지: {user.residence}")
        if user.relationship_status:
            status_map = {
                "single": "미혼", "dating": "연애 중",
                "married": "기혼", "etc": "기타"
            }
            lines.append(f"연애/결혼: {status_map.get(user.relationship_status, user.relationship_status)}")

        lines.append(f"\n[인생 배경]\n{user.life_background}")

        if user.key_events:
            lines.append(f"\n[주요 사건들]\n{user.key_events}")
        if user.personality:
            lines.append(f"\n[성격/MBTI]: {user.personality}")
        if user.values:
            lines.append(f"[가치관]: {user.values}")

        return "\n".join(lines)

    def _build_narrative_structure(self, scope: str, detail_level: str) -> str:
        """범위와 상세도에 따른 서사 구조 가이드"""

        scope_structures = {
            "short": {
                "summary": """## 서사 구조 (요약)
1편: 선택의 순간과 직후 변화 (심리 변화, 첫 번째 분기)
2편: 1년 후의 달라진 일상 (구체적 생활, 새로운 인간관계)
에필로그: 이 1년이 남긴 것""",
                "normal": """## 서사 구조
**1장. 갈림길** — 선택의 순간. 왜 이 선택을 하게 되었는지, 그 순간의 감정과 주변 반응. 구체적 장면(대화, 장소)으로 시작.
**2장. 첫 번째 파문** — 선택 직후 1~3개월. 새로운 환경에 적응하는 과정. 예상과 다른 현실, 첫 번째 위기 또는 기회.
**3장. 전환** — 3~6개월. 이 선택으로 인해 만난 사람, 배운 것, 변화한 자신. 성격/가치관이 어떻게 작용하는지.
**4장. 1년 후** — 완전히 달라진 일상. 원래 선택을 했을 때와 구체적으로 비교.
에필로그: 이 1년이 인생의 방향을 어떻게 틀었는지.""",
                "novel": """## 서사 구조 (소설형 — 최소 5장)
**프롤로그** — 현재의 '나'가 과거를 회상하는 시점. 그날의 갈림길을 떠올리는 장면.
**1장. 그날** — 선택의 날. 감각적 묘사(날씨, 소리, 냄새). 주변 인물과의 대화. 내면 갈등. 결정의 순간.
**2장. 낯선 길** — 선택 직후 1~2개월. 새 환경의 구체적 묘사. 적응의 어려움과 작은 발견들.
**3장. 파문** — 2~4개월. 이 선택이 일으킨 연쇄 반응. 예상못한 인연, 위기, 갈등.
**4장. 변곡점** — 4~8개월. 중대한 사건. 성격/가치관이 시험받는 순간. 성장 또는 좌절.
**5장. 새로운 지도** — 8~12개월. 달라진 자신. 과거 선택과의 대비.
**에필로그** — 이 1년이 앞으로의 인생 궤도를 어떻게 바꿔놓았는지."""
            },
            "medium": {
                "summary": """## 서사 구조 (요약)
1편: 선택의 순간과 첫해의 변화
2편: 2~3년 차 — 선택이 만들어낸 인생 궤도
3편: 5년 후 — 완전히 달라진 인생
에필로그: 5년간의 나비효과 정리""",
                "normal": """## 서사 구조
**1장. 갈림길** — 선택의 순간. 구체적 장면과 감정. 주변 인물의 반응과 대화.
**2장. 첫해** — 새로운 환경 적응. 예상과 다른 현실. 첫 위기와 첫 기회. 새로운 인연.
**3장. 물결** — 2~3년 차. 이 선택으로 인해 열린 문과 닫힌 문. 직업/관계/거주지의 변화.
**4장. 분수령** — 3~4년 차. 인생을 다시 뒤흔든 중대 사건. 과거 선택의 결과가 예상못한 곳에서 나타남.
**5장. 5년 후** — 현재와 완전히 다른 인생. 직업, 인간관계, 거주지, 가치관의 변화를 구체적으로.
에필로그: 원래 선택을 했을 때의 '나'와 평행세계의 '나'를 대비.""",
                "novel": """## 서사 구조 (소설형 — 최소 7장)
**프롤로그** — 5년 후의 시점에서 그날을 회상.
**1장. 그날의 선택** — 분기점 당일. 감각적 묘사, 내면 독백, 주변인과의 대화 3개 이상.
**2장. 첫 번째 물결** — 선택 직후 ~ 6개월. 낯선 환경, 적응의 고통과 기쁨.
**3장. 새로운 인연** — 6개월 ~ 1년. 이 선택이 아니면 만나지 못했을 사람. 관계의 시작.
**4장. 시련** — 1~2년. 위기의 순간. 성격/가치관이 시험받음. 원래 선택을 후회하는 순간.
**5장. 전환** — 2~3년. 위기를 넘긴 후 찾아온 기회. 예상못한 성장.
**6장. 확장** — 3~4년. 삶의 영역이 넓어짐. 직업, 관계, 삶의 방식의 구체적 변화.
**7장. 5년 후의 나** — 완전히 달라진 일상. 아침에 눈을 뜨는 장면부터 하루를 묘사.
**에필로그** — 두 갈래 인생의 대비. "가지 않은 길"에 대한 성찰."""
            },
            "long": {
                "summary": """## 서사 구조 (요약)
1편: 선택의 순간과 첫해
2편: 2~5년 — 인생 궤도의 분기
3편: 5~10년 — 누적된 나비효과
4편: 현재 — 완전히 다른 오늘
에필로그: 두 인생의 대비""",
                "normal": """## 서사 구조
**1장. 갈림길** — 선택의 순간. 구체적 장면, 감정, 대화.
**2장. 첫해** — 새로운 시작. 적응, 위기, 기회. 만나게 된 사람들.
**3장. 3년 후** — 선택이 만들어낸 커리어/관계/생활의 변화. 첫 번째 큰 분수령.
**4장. 5년 후** — 누적된 나비효과. 원래 인생에서는 절대 일어나지 않았을 사건.
**5장. 10년 후** — 완전히 다른 궤도의 인생. 직업, 가족, 거주지, 정체성.
**6장. 현재** — 지금 이 순간의 평행세계 '나'. 하루의 일상을 구체적으로 묘사.
에필로그: 원래 인생과 평행세계 인생의 대비. "가지 않은 길"이 만들어낸 나비효과의 총합.""",
                "novel": """## 서사 구조 (소설형 — 최소 9장)
**프롤로그** — 현재 시점의 평행세계 '나'. 전혀 다른 오늘 아침의 풍경.
**1장. 그날** — 분기점. 감각적 묘사, 내면 갈등, 대화, 결정의 순간.
**2장. 낯선 길** — 선택 직후 ~ 6개월. 새 환경의 디테일한 묘사.
**3장. 뿌리내리기** — 6개월 ~ 2년. 적응과 성장. 새로운 인간관계 형성.
**4장. 폭풍** — 2~3년. 큰 위기. 이 선택을 후회하는 가장 어두운 순간.
**5장. 반전** — 3~5년. 위기 속에서 찾은 기회. 예상못한 전환점.
**6장. 확장** — 5~7년. 삶의 반경이 넓어짐. 커리어, 관계, 꿈의 변화.
**7장. 결실** — 7~10년. 선택의 결과가 누적되어 만들어낸 성과와 관계.
**8장. 성찰** — 10년 이후. 지나온 길을 돌아봄. 성장한 자신과 잃어버린 것들.
**9장. 오늘** — 현재 시점. 평행세계 '나'의 구체적 하루. 아침부터 밤까지.
**에필로그** — 가지 않은 길이 만들어낸 완전히 다른 인생. 두 세계의 '나'를 대비하며 마무리."""
            }
        }

        return scope_structures[scope][detail_level]

    def build_prompt(
        self,
        user: User,
        branch: BranchInput,
        tone: str,
        genre: str,
        detail_level: str,
        scope: str
    ) -> str:
        """프롬프트 생성"""

        # 톤 상세 지침
        tone_guide = {
            "optimistic": """[톤: 희망적/낙관적]
- 어려움이 있지만 결국 좋은 방향으로 전개
- 선택이 가져다준 예상치 못한 행운과 기회를 부각
- 성장과 긍정적 변화에 초점
- 단, 무조건 좋기만 한 건 비현실적이므로 적절한 갈등과 시련은 포함""",
            "realistic": """[톤: 현실적/균형]
- 좋은 일과 나쁜 일이 섞여 있음. 인생은 한쪽으로만 흐르지 않음
- 선택의 대가(trade-off)를 솔직하게 묘사: 얻은 것과 잃은 것
- 사회적 현실 반영: 경제 상황, 취업 시장, 부동산, 인간관계의 복잡함
- 완벽한 해피엔딩도, 비극도 아닌 '그럴 수 있는' 인생""",
            "pessimistic": """[톤: 도전적/비관적]
- 선택이 예상치 못한 어려움으로 이어짐
- 시련과 좌절이 반복되지만, 그 속에서 발견하는 것들이 있음
- 완전한 파멸이 아닌, 힘든 속에서도 살아가는 인간의 이야기
- 고통 속에서 깨닫는 자기 자신의 본질"""
        }[tone]

        # 장르 상세 지침
        genre_guide = {
            "romance": """[장르: 로맨스/인간관계]
- 이 선택으로 인해 만나게 된(또는 만나지 못한) 사람에 초점
- 사랑, 우정, 가족 관계의 변화를 중심으로 서사 전개
- 감정의 결과 구체적 묘사: 설렘, 그리움, 갈등, 화해
- 관계가 인생의 방향을 바꾸는 순간들""",
            "success": """[장르: 성장/성공담]
- 커리어, 학업, 자기실현의 여정에 초점
- 실패에서 배우고 성장하는 과정을 구체적으로
- 멘토, 동료, 라이벌 등 성장을 이끄는 인물 등장
- 성공의 기준이 사회적 지위만이 아닌, 자기 만족과 성취감 포함""",
            "healing": """[장르: 힐링/자기발견]
- 내면의 변화와 성찰에 초점
- 상처의 치유, 자기 수용, 삶의 의미 발견
- 일상의 소소한 행복과 깨달음을 감각적으로 묘사
- 느린 템포로 감정의 변화를 섬세하게 추적""",
            "drama": """[장르: 드라마]
- 극적인 반전과 갈등 중심
- 예상치 못한 사건, 운명적 만남, 갈등 구조
- 긴장감 있는 전개와 감정적 클라이맥스
- 인물 간의 갈등과 화해, 선택과 결과의 드라마틱한 대비"""
        }[genre]

        # 상세도별 분량/문체 지침
        detail_guide = {
            "summary": """[분량: 요약본 — 1,500~2,000자]
- 핵심 사건과 변화를 중심으로 압축
- 각 장을 2~3문단으로 요약
- 감정 묘사는 간결하게, 사건 중심으로""",
            "normal": """[분량: 일반 — 3,000~5,000자]
- 주요 장면마다 대화와 감정 묘사 포함
- 각 장을 4~6문단으로 구성
- 장면 전환은 시간/장소로 명확하게
- 핵심 에피소드는 장면(scene) 형태로 상세히""",
            "novel": """[분량: 소설형 — 6,000~10,000자 이상]
- 소설 수준의 문장력과 묘사력
- 감각 묘사: 시각, 청각, 촉각, 후각, 미각을 활용
- 내면 독백과 의식의 흐름 기법 사용
- 대화 장면은 실제 대화처럼 자연스럽게 (방언/말투 반영)
- 각 장마다 최소 2~3개의 구체적 에피소드
- 장면 전환 시 시간/장소/분위기를 감각적으로 묘사
- 복선과 반복 모티프 활용"""
        }[detail_level]

        # 사용자 프로필
        user_profile = self._build_user_profile(user)

        # 서사 구조
        narrative_structure = self._build_narrative_structure(scope, detail_level)

        prompt = f"""## 사용자 프로필
{user_profile}

## 분기점 정보
- 시점: {branch.occurred_at}
- 실제로 한 선택: {branch.original_choice}
- 평행세계의 선택: {branch.alternative_choice}
- 당시 상황/맥락: {branch.context or '추가 정보 없음'}

---

{tone_guide}

{genre_guide}

{detail_guide}

{narrative_structure}

## 핵심 작성 원칙

1. **나비효과 인과관계**: "{branch.alternative_choice}"를 선택한 순간부터 시작해서, 그 선택이 → 어떤 환경 변화를 → 어떤 만남을 → 어떤 기회/위기를 → 최종적으로 어떤 인생으로 이끌었는지 논리적으로 연결하세요.

2. **사용자 성격 반영**: 이 사람의 성격({user.personality or '정보 없음'})과 가치관({user.values or '정보 없음'})이 새로운 환경에서 어떻게 작용하는지 보여주세요. 같은 상황이라도 이 사람이기 때문에 다르게 반응하고, 다른 결과를 만들어내는 모습을 그리세요.

3. **구체적 디테일**: 추상적 서술 대신 구체적 장면을 쓰세요.
   - BAD: "새로운 사람들을 만났다"
   - GOOD: "OT에서 옆자리에 앉은 민준이가 말을 걸었다. '너도 재수생이야? 나 작년에 서울대 떨어졌어.' 그 한마디에 묘한 동질감을 느꼈다."

4. **2인칭 시점**: "당신은..."으로 시작하되, 몰입감을 위해 간간이 내면 독백을 넣으세요.

5. **원래 선택과의 대비**: 중간중간 "만약 {branch.original_choice}을 그대로 했다면..."이라는 대비를 자연스럽게 넣어 두 인생의 차이를 보여주세요.

6. **한국 사회적 맥락**: 한국의 교육, 취업, 문화, 지역 특성을 구체적으로 반영하세요.

---

위 프로필과 분기점을 바탕으로, 서사 구조에 따라 평행세계 시나리오를 작성해주세요.
장(chapter) 제목을 달고, 각 장을 충분한 분량으로 작성하세요.
시작하세요:"""

        return prompt

    async def generate_scenario(
        self,
        user: User,
        branch: BranchInput,
        tone: str,
        genre: str,
        detail_level: str,
        scope: str
    ) -> str:
        """시나리오 생성"""

        prompt = self.build_prompt(user, branch, tone, genre, detail_level, scope)
        max_tokens = self._get_max_tokens(detail_level)

        # API 키가 없으면 목업 응답
        if not self.groq_api_key:
            return self._mock_response(user, branch, scope)

        # Groq API 호출
        try:
            async with httpx.AsyncClient() as client:
                response = await client.post(
                    self.base_url,
                    headers={
                        "Authorization": f"Bearer {self.groq_api_key}",
                        "Content-Type": "application/json"
                    },
                    json={
                        "model": "llama-3.3-70b-versatile",
                        "messages": [
                            {"role": "system", "content": SYSTEM_PROMPT},
                            {"role": "user", "content": prompt}
                        ],
                        "temperature": 0.85,
                        "top_p": 0.9,
                        "max_tokens": max_tokens
                    },
                    timeout=120.0
                )

                if response.status_code != 200:
                    raise AIServiceException(
                        message=f"AI API 오류: HTTP {response.status_code}",
                        details={"status_code": response.status_code, "response": response.text[:200]}
                    )

                data = response.json()
                return data["choices"][0]["message"]["content"]
        except httpx.TimeoutException:
            raise AIServiceException(
                message="AI 서비스 요청 시간이 초과되었습니다. 잠시 후 다시 시도해주세요.",
                details={"error": "timeout"}
            )
        except httpx.RequestError as e:
            raise AIServiceException(
                message="AI 서비스 연결에 실패했습니다.",
                details={"error": str(e)}
            )
        except Exception as e:
            if isinstance(e, AIServiceException):
                raise
            raise AIServiceException(
                message="AI 시나리오 생성 중 예상치 못한 오류가 발생했습니다.",
                details={"error": str(e)}
            )

    def _mock_response(self, user: User, branch: BranchInput, scope: str) -> str:
        """테스트용 목업 응답"""
        return f"""[목업 시나리오 - API 키 설정 후 실제 생성됩니다]

{branch.occurred_at}, 당신은 중요한 갈림길에 섰습니다.

"{branch.original_choice}" 대신 "{branch.alternative_choice}"를 선택한 당신.

처음에는 불안했습니다. 익숙한 길을 벗어난다는 것이 두려웠으니까요. 하지만 그 선택은 당신의 인생을 완전히 다른 방향으로 이끌었습니다.

새로운 환경에서 당신은 예상치 못한 사람들을 만났고, 생각지도 못한 기회들이 찾아왔습니다. 물론 어려움도 있었지만, {user.name}님의 {user.personality or '강인한'} 성격은 그 모든 것을 극복하게 해주었습니다.

{user.occupation}이 아닌 다른 길을 걸으며, 당신은 "{branch.alternative_choice}"가 단순한 선택이 아니라 운명의 전환점이었음을 깨달았습니다.

지금 이 순간, 평행세계의 당신은 전혀 다른 모습으로 살아가고 있을지도 모릅니다.

---
이 시나리오는 테스트용 목업입니다.
.env 파일에 GROQ_API_KEY를 설정하면 AI가 생성한 실제 시나리오를 받을 수 있습니다.
"""
