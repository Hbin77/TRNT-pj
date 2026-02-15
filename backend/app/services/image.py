import logging
from openai import AsyncOpenAI
from app.config import settings

logger = logging.getLogger(__name__)


class ImageService:
    """OpenAI DALL-E 이미지 생성 서비스"""

    def __init__(self):
        self.client = AsyncOpenAI(api_key=settings.OPENAI_API_KEY) if settings.OPENAI_API_KEY else None

    async def generate_cover(self, scenario_text: str, genre: str, tone: str) -> str:
        """
        시나리오 텍스트에서 커버 이미지 생성

        Args:
            scenario_text: 시나리오 전문
            genre: 장르 (romance, success, healing, drama)
            tone: 톤 (optimistic, realistic, pessimistic)

        Returns:
            str: 생성된 이미지 URL
        """
        if not self.client:
            raise RuntimeError("OPENAI_API_KEY가 설정되지 않았습니다.")

        # 1단계: GPT-4o-mini로 시나리오 핵심 장면 1줄 요약
        summary_response = await self.client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {
                    "role": "system",
                    "content": "You are an image prompt generator. Given a Korean scenario text, extract the single most visually striking scene and describe it in one English sentence for DALL-E image generation. Focus on mood, setting, and atmosphere. Do not include any text or characters' names."
                },
                {
                    "role": "user",
                    "content": f"Genre: {genre}, Tone: {tone}\n\nScenario excerpt:\n{scenario_text[:2000]}"
                }
            ],
            temperature=0.7,
            max_tokens=150,
        )
        scene_description = summary_response.choices[0].message.content or ""

        # 2단계: DALL-E 3로 이미지 생성
        tone_style = {
            "optimistic": "warm, hopeful lighting, soft golden tones",
            "realistic": "natural lighting, muted earth tones",
            "pessimistic": "dramatic shadows, cool blue-grey tones",
        }.get(tone, "cinematic lighting")

        genre_style = {
            "romance": "soft, dreamy atmosphere",
            "success": "dynamic, ambitious composition",
            "healing": "serene, peaceful nature elements",
            "drama": "intense, cinematic mood",
        }.get(genre, "artistic composition")

        dall_e_prompt = f"A cinematic book cover illustration: {scene_description}. Style: {tone_style}, {genre_style}. Digital art, high quality, no text, no words, no letters."

        image_response = await self.client.images.generate(
            model="dall-e-3",
            prompt=dall_e_prompt,
            size="1024x1024",
            quality="standard",
            n=1,
        )

        return image_response.data[0].url
