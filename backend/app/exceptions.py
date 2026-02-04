"""커스텀 예외 클래스"""
from typing import Optional


class TRNTException(Exception):
    """TRNT 베이스 예외"""

    def __init__(
        self,
        message: str,
        code: str,
        status_code: int = 500,
        details: Optional[dict] = None
    ):
        self.message = message
        self.code = code
        self.status_code = status_code
        self.details = details or {}
        super().__init__(self.message)


class UserNotFoundException(TRNTException):
    """사용자를 찾을 수 없음"""

    def __init__(self, user_id: str = None):
        message = "사용자를 찾을 수 없습니다."
        if user_id:
            message = f"사용자를 찾을 수 없습니다. (ID: {user_id})"
        super().__init__(
            message=message,
            code="USER_NOT_FOUND",
            status_code=404,
            details={"user_id": user_id} if user_id else {}
        )


class ScenarioNotFoundException(TRNTException):
    """시나리오를 찾을 수 없음"""

    def __init__(self, scenario_id: str = None):
        message = "시나리오를 찾을 수 없습니다."
        if scenario_id:
            message = f"시나리오를 찾을 수 없습니다. (ID: {scenario_id})"
        super().__init__(
            message=message,
            code="SCENARIO_NOT_FOUND",
            status_code=404,
            details={"scenario_id": scenario_id} if scenario_id else {}
        )


class AIServiceException(TRNTException):
    """AI 서비스 오류"""

    def __init__(self, message: str = "AI 시나리오 생성 중 오류가 발생했습니다.", details: dict = None):
        super().__init__(
            message=message,
            code="AI_SERVICE_ERROR",
            status_code=500,
            details=details or {}
        )


class RateLimitExceededException(TRNTException):
    """사용량 제한 초과"""

    def __init__(self, limit: int = 3, reset_time: str = "내일"):
        super().__init__(
            message=f"일일 무료 생성 횟수({limit}회)를 초과했습니다. {reset_time}에 초기화됩니다.",
            code="RATE_LIMIT_EXCEEDED",
            status_code=429,
            details={"limit": limit, "reset_time": reset_time}
        )


class DuplicateEmailException(TRNTException):
    """이메일 중복"""

    def __init__(self, email: str):
        super().__init__(
            message=f"이미 등록된 이메일입니다: {email}",
            code="DUPLICATE_EMAIL",
            status_code=400,
            details={"email": email}
        )


class AuthenticationException(TRNTException):
    """인증 실패"""

    def __init__(self, message: str = "인증에 실패했습니다."):
        super().__init__(
            message=message,
            code="AUTHENTICATION_FAILED",
            status_code=401
        )


class InvalidCredentialsException(TRNTException):
    """잘못된 인증 정보"""

    def __init__(self):
        super().__init__(
            message="이메일 또는 비밀번호가 올바르지 않습니다.",
            code="INVALID_CREDENTIALS",
            status_code=401
        )


class PermissionDeniedException(TRNTException):
    """권한 없음"""

    def __init__(self, message: str = "이 작업을 수행할 권한이 없습니다."):
        super().__init__(
            message=message,
            code="PERMISSION_DENIED",
            status_code=403
        )


class IncompleteProfileException(TRNTException):
    """프로필 미완성 (카카오 신규 가입자)"""

    def __init__(self):
        super().__init__(
            message="프로필을 완성해야 시나리오를 생성할 수 있습니다.",
            code="INCOMPLETE_PROFILE",
            status_code=403
        )
