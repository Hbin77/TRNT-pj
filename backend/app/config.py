from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    # 서버
    APP_ENV: str = "development"
    DEBUG: bool = True

    # DB
    DATABASE_URL: str = "postgresql://user:pass@localhost:5432/trnt"

    # AI API
    GROQ_API_KEY: str = ""

    # Rate Limiting
    DAILY_FREE_LIMIT: int = 3

    # JWT 인증
    SECRET_KEY: str = "your-secret-key-change-this-in-production"
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7

    # 카카오 OAuth
    KAKAO_CLIENT_ID: str = ""
    KAKAO_CLIENT_SECRET: str = ""
    KAKAO_REDIRECT_URI: str = "http://localhost:8000/api/v1/auth/kakao/callback"

    # Frontend URL (CORS)
    FRONTEND_URL: str = "http://localhost:3000"

    # Cloudflare Turnstile
    TURNSTILE_SECRET_KEY: str = "1x0000000000000000000000000000000AA"  # Test Key

    # Email (Gmail SMTP)
    SMTP_SERVER: str = "smtp.gmail.com"
    SMTP_PORT: int = 587
    SMTP_USERNAME: str = ""
    SMTP_PASSWORD: str = ""

    class Config:
        env_file = ".env"


settings = Settings()