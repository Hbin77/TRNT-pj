"""이메일 전송 서비스"""
from app.config import settings


class EmailService:
    """이메일 전송 서비스"""

    @staticmethod
    def send_password_reset_email(email: str, reset_token: str):
        """
        비밀번호 재설정 이메일 전송

        Args:
            email: 수신자 이메일
            reset_token: 재설정 토큰

        Note:
            개발 환경에서는 콘솔에 출력
            프로덕션 환경에서는 실제 이메일 서비스 사용 (SMTP, SendGrid, AWS SES 등)
        """

        reset_link = f"{settings.FRONTEND_URL}/reset-password?token={reset_token}"

        # 이메일 내용
        html = f"""
        <html>
          <body>
            <h2>TRNT 비밀번호 재설정</h2>
            <p>아래 링크를 클릭하여 비밀번호를 재설정하세요:</p>
            <a href="{reset_link}">비밀번호 재설정하기</a>
            <p>이 링크는 15분 후 만료됩니다.</p>
            <p>본인이 요청하지 않았다면 이 이메일을 무시하세요.</p>
          </body>
        </html>
        """

        # 개발 환경: 콘솔에 출력
        if settings.APP_ENV == "development":
            print(f"\n{'='*60}")
            print(f"[DEV] Password reset email for: {email}")
            print(f"Reset link: {reset_link}")
            print(f"{'='*60}\n")
        else:
            # 프로덕션: 실제 이메일 전송
            # TODO: SMTP, SendGrid, AWS SES 등 구현
            pass
