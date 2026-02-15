import logging
from openai import AsyncOpenAI
from app.config import settings

logger = logging.getLogger(__name__)


class TTSService:
    """OpenAI TTS 서비스"""

    def __init__(self):
        self.client = AsyncOpenAI(api_key=settings.OPENAI_API_KEY) if settings.OPENAI_API_KEY else None

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

        # OpenAI TTS는 최대 4096자 제한
        text = scenario_text[:4096] if len(scenario_text) > 4096 else scenario_text

        response = await self.client.audio.speech.create(
            model="tts-1",
            voice="nova",
            input=text,
        )

        return response.content
