from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.api import health, users  # users 추가

app = FastAPI(
    title="TRNT API",
    description="평행세계 인생 시뮬레이터",
    version="0.1.0",
    debug=settings.DEBUG,
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 라우터 등록
app.include_router(health.router)
app.include_router(users.router, prefix="/api/v1")  # 추가


@app.get("/")
def root():
    return {"message": "TRNT API", "docs": "/docs"}