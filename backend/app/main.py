import logging
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api import health, users, scenarios, auth
from app.config import settings
from app.middleware.error_handler import setup_exception_handlers
from app.middleware.logging import logging_middleware

# 로깅 설정
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)

app = FastAPI(
    title="TRNT API",
    description="평행세계 인생 시뮬레이터 API",
    version="0.1.0",
)

# CORS 설정
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        settings.FRONTEND_URL
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 로깅 미들웨어 추가
app.middleware("http")(logging_middleware)

# 예외 핸들러 등록
setup_exception_handlers(app)

# 라우터 등록
app.include_router(health.router, tags=["Health"])
app.include_router(auth.router, prefix="/api/v1")
app.include_router(users.router, prefix="/api/v1")
app.include_router(scenarios.router, prefix="/api/v1")


@app.get("/")
async def root():
    return {"message": "TRNT API", "docs": "/docs"}
