"""요청/응답 로깅 미들웨어"""
import time
import logging
from fastapi import Request

logger = logging.getLogger(__name__)


async def logging_middleware(request: Request, call_next):
    """요청/응답 로깅 미들웨어"""

    # 요청 시작 시간
    start_time = time.time()

    # 민감한 파라미터 필터링
    sensitive_params = {'password', 'token', 'api_key', 'secret', 'authorization'}
    safe_params = {
        k: v for k, v in request.query_params.items()
        if k.lower() not in sensitive_params
    }

    # 요청 정보 로깅
    logger.info(
        f"Request started: {request.method} {request.url.path}",
        extra={
            "method": request.method,
            "path": request.url.path,
            "query_params": safe_params,
            "client": request.client.host if request.client else None,
            "user_agent": request.headers.get("user-agent")
        }
    )

    # 요청 처리
    response = await call_next(request)

    # 처리 시간 계산
    process_time = time.time() - start_time

    # 응답 정보 로깅
    logger.info(
        f"Request completed: {request.method} {request.url.path} - {response.status_code}",
        extra={
            "method": request.method,
            "path": request.url.path,
            "status_code": response.status_code,
            "process_time": f"{process_time:.3f}s",
            "client": request.client.host if request.client else None
        }
    )

    # 응답 헤더에 처리 시간 추가
    response.headers["X-Process-Time"] = f"{process_time:.3f}"

    return response
