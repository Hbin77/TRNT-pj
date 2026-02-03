from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api import health, users, scenarios  # scenarios 추가

app = FastAPI(
    title="TRNT API",
    description="평행세계 인생 시뮬레이터 API",
    version="0.1.0",
)

# CORS 설정
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "https://*.vercel.app"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 라우터 등록
app.include_router(health.router, tags=["Health"])
app.include_router(users.router, prefix="/api/v1")
app.include_router(scenarios.router, prefix="/api/v1")  # 추가!


@app.get("/")
async def root():
    return {"message": "TRNT API", "docs": "/docs"}