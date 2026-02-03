from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    # 서버
    APP_ENV: str = "development"
    DEBUG: bool = True
    
    # DB (Phase 2에서 사용)
    DATABASE_URL: str = "postgresql://user:pass@localhost:5432/trnt"
    
    # AI API (Phase 2에서 사용)
    GROQ_API_KEY: str = ""
    
    class Config:
        env_file = ".env"


settings = Settings()