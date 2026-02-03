import os
from typing import Optional

import httpx

from app.models.user import User
from app.schemas.scenario import BranchInput


class AIService:
    """AI 시나리오 생성 서비스"""
    
    def __init__(self):
        self.groq_api_key = os.getenv("GROQ_API_KEY")
        self.base_url = "https://api.groq.com/openai/v1/chat/completions"
    
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
        
        # 범위별 시간 설정
        scope_text = {
            "short": "선택 직후 1년간",
            "medium": "5년 후까지",
            "long": "현재 시점까지"
        }[scope]
        
        # 톤 설명
        tone_text = {
            "optimistic": "희망적이고 긍정적인",
            "realistic": "현실적이고 균형 잡힌",
            "pessimistic": "도전과 시련이 많은"
        }[tone]
        
        # 장르 설명
        genre_text = {
            "romance": "로맨스와 인간관계 중심의",
            "success": "성장과 성공 스토리",
            "healing": "치유와 자기발견의",
            "drama": "극적인 전개의"
        }[genre]
        
        # 상세도
        length_guide = {
            "summary": "300자 내외로 요약해서",
            "normal": "800자 내외로",
            "novel": "1500자 이상 소설처럼 상세하게"
        }[detail_level]
        
        prompt = f"""당신은 평행세계 인생 시나리오를 작성하는 작가입니다.

## 사용자 정보
- 이름: {user.name}
- 출생연도: {user.birth_year}
- 현재 직업: {user.occupation}
- 전공: {user.major or '없음'}
- 거주지: {user.residence or '미공개'}
- 배경: {user.life_background}
- 성격: {user.personality or '미공개'}
- 가치관: {user.values or '미공개'}

## 분기점
- 시점: {branch.occurred_at}
- 실제 선택: {branch.original_choice}
- 대안 선택: {branch.alternative_choice}
- 당시 상황: {branch.context or '추가 정보 없음'}

## 요청사항
"{branch.alternative_choice}"를 선택했다면 {scope_text}의 인생이 어떻게 펼쳐졌을지 시나리오를 작성해주세요.

- 톤: {tone_text}
- 장르: {genre_text}
- 분량: {length_guide}

## 작성 규칙
1. 2인칭 시점("당신은...")으로 작성
2. 구체적인 에피소드와 감정 묘사 포함
3. 현실적이면서도 몰입감 있게
4. 마지막에 현재 상태로 마무리

시나리오를 작성해주세요:"""
        
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
        
        # API 키가 없으면 목업 응답
        if not self.groq_api_key:
            return self._mock_response(user, branch, scope)
        
        # Groq API 호출
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
                        {"role": "user", "content": prompt}
                    ],
                    "temperature": 0.8,
                    "max_tokens": 2000
                },
                timeout=60.0
            )
            
            if response.status_code != 200:
                raise Exception(f"AI API 오류: {response.text}")
            
            data = response.json()
            return data["choices"][0]["message"]["content"]
    
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
⚠️ 이 시나리오는 테스트용 목업입니다.
.env 파일에 GROQ_API_KEY를 설정하면 AI가 생성한 실제 시나리오를 받을 수 있습니다.
"""