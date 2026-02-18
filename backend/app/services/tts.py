import re
import asyncio
import logging
from openai import AsyncOpenAI
from app.config import settings
from app.exceptions import AIServiceException

logger = logging.getLogger(__name__)

MAX_RETRIES = 3


class TTSService:
    """OpenAI TTS 서비스"""

    def __init__(self):
        self.client = AsyncOpenAI(api_key=settings.OPENAI_API_KEY) if settings.OPENAI_API_KEY else None

    @staticmethod
    def _strip_markdown(text: str) -> str:
        """마크다운 기호를 제거하여 TTS에 적합한 텍스트로 변환"""
        # 헤더 (#, ##, ### 등)
        text = re.sub(r'^#{1,6}\s+', '', text, flags=re.MULTILINE)
        # 볼드/이탤릭 (**text**, *text*, __text__, _text_)
        text = re.sub(r'\*{1,3}(.*?)\*{1,3}', r'\1', text)
        text = re.sub(r'_{1,3}(.*?)_{1,3}', r'\1', text)
        # 취소선 (~~text~~)
        text = re.sub(r'~~(.*?)~~', r'\1', text)
        # 수평선 (---, ***, ___)
        text = re.sub(r'^[\-\*_]{3,}\s*$', '', text, flags=re.MULTILINE)
        # 목록 기호 (-, *, +, 1. 등)
        text = re.sub(r'^\s*[\-\*\+]\s+', '', text, flags=re.MULTILINE)
        text = re.sub(r'^\s*\d+\.\s+', '', text, flags=re.MULTILINE)
        # 인용문 (>)
        text = re.sub(r'^\s*>\s?', '', text, flags=re.MULTILINE)
        # 인라인 코드 (`code`)
        text = re.sub(r'`(.*?)`', r'\1', text)
        # 코드 블록 (```...```)
        text = re.sub(r'```[\s\S]*?```', '', text)
        # 링크 [text](url) → text
        text = re.sub(r'\[([^\]]*)\]\([^)]*\)', r'\1', text)
        # 이미지 ![alt](url) → 제거
        text = re.sub(r'!\[([^\]]*)\]\([^)]*\)', '', text)
        # 연속 빈 줄 정리
        text = re.sub(r'\n{3,}', '\n\n', text)
        return text.strip()

    async def generate_audio(self, scenario_text: str) -> bytes:
        """
        시나리오 텍스트를 음성으로 변환

        Args:
            scenario_text: 시나리오 텍스트 (최대 4096자)

        Returns:
            bytes: mp3 오디오 바이너리
        """
        if not self.client:
            raise RuntimeError("OPENAI_API_KEY가 설정되지 않았습니다.")

        # 마크다운 제거 후 4096자 truncate (제거 후 truncate해야 실제 콘텐츠가 더 많이 포함됨)
        text = self._strip_markdown(scenario_text)
        text = text[:4096] if len(text) > 4096 else text

        last_exception = None
        for attempt in range(1, MAX_RETRIES + 1):
            try:
                response = await self.client.audio.speech.create(
                    model="tts-1",
                    voice="nova",
                    input=text,
                )
                return response.content
            except Exception as e:
                error_str = str(e).lower()
                last_exception = e

                # quota/billing 에러는 재시도 없이 즉시 실패
                if any(kw in error_str for kw in ['quota', 'billing', 'insufficient_quota']):
                    logger.error(f"TTS quota/billing error: {e}")
                    raise AIServiceException(
                        message="API 크레딧이 부족합니다. 관리자에게 문의해주세요.",
                        details={"error": str(e), "error_type": "quota"}
                    )

                logger.warning(f"TTS attempt {attempt}/{MAX_RETRIES} failed: {type(e).__name__}: {e}")

                if attempt < MAX_RETRIES:
                    await asyncio.sleep(2 ** attempt)

        # 모든 재시도 실패
        raise last_exception
