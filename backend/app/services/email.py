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

        # 개발 환경: 콘솔에 출력 (디버깅용)
        if settings.APP_ENV == "development":
            print(f"\n{'='*60}")
            print(f"[DEV] Password reset email for: {email}")
            print(f"Reset link: {reset_link}")
            print(f"{'='*60}\n")
        
        # 실제 전송 시도
        try:
            EmailService._send_email(email, "TRNT 비밀번호 재설정", html)
        except Exception as e:
            print(f"Failed to send email: {e}")

    @staticmethod
    def send_verification_email(email: str, code: str):
        """
        이메일 인증 코드 전송
        """
        html = f"""
        <html>
          <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
            <div style="max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px;">
              <h2 style="color: #4F46E5; text-align: center;">TRNT 이메일 인증</h2>
              <p>안녕하세요,</p>
              <p>TRNT에 가입해 주셔서 감사합니다. 아래 인증 코드를 입력하여 가입을 완료해주세요.</p>
              
              <div style="background-color: #F3F4F6; padding: 15px; text-align: center; border-radius: 8px; margin: 20px 0;">
                <span style="font-size: 24px; font-weight: bold; letter-spacing: 5px; color: #1F2937;">{code}</span>
              </div>
              
              <p style="font-size: 14px; color: #666;">이 코드는 10분간 유효합니다.</p>
              <p style="font-size: 12px; color: #999; margin-top: 20px; text-align: center;">본인이 요청하지 않았다면 이 이메일을 무시하세요.</p>
            </div>
          </body>
        </html>
        """

        # 개발 환경 로그
        if settings.APP_ENV == "development":
            print(f"\n{'='*60}")
            print(f"[DEV] Verification Code for {email}: {code}")
            print(f"{'='*60}\n")

        # 실제 전송
        EmailService._send_email(email, "TRNT 회원가입 인증 코드", html)

    @staticmethod
    def _send_email(to_email: str, subject: str, html_content: str):
        """SMTP를 이용한 실제 이메일 전송"""
        import smtplib
        from email.mime.text import MIMEText
        from email.mime.multipart import MIMEMultipart

        if not settings.SMTP_USERNAME or not settings.SMTP_PASSWORD:
            print("SMTP settings not configured. Skipping email send.")
            return

        try:
            msg = MIMEMultipart()
            msg["From"] = settings.SMTP_USERNAME
            msg["To"] = to_email
            msg["Subject"] = subject
            msg.attach(MIMEText(html_content, "html"))

            with smtplib.SMTP(settings.SMTP_SERVER, settings.SMTP_PORT) as server:
                server.starttls()
                server.login(settings.SMTP_USERNAME, settings.SMTP_PASSWORD)
                server.send_message(msg)
            
            print(f"Email sent successfully to {to_email}")
        except Exception as e:
            print(f"Failed to send email via SMTP: {e}")
            raise e
