from typing import Optional
from config import settings
import sendgrid
from sendgrid.helpers.mail import Mail, Email, To, Content


class EmailService:
    def __init__(self):
        self.sg = sendgrid.SendGridAPIClient(api_key=settings.SENDGRID_API_KEY) if settings.SENDGRID_API_KEY else None
    
    def send_email(self, to_email: str, subject: str, html_content: str) -> bool:
        """Send an email using SendGrid."""
        if not self.sg:
            print(f"[Email Service] Would send email to {to_email}: {subject}")
            return False
        
        try:
            message = Mail(
                from_email=Email(settings.EMAIL_FROM),
                to_emails=To(to_email),
                subject=subject,
                html_content=Content("text/html", html_content)
            )
            response = self.sg.send(message)
            return response.status_code in [200, 201, 202]
        except Exception as e:
            print(f"Error sending email: {e}")
            return False
    
    def send_password_reset(self, to_email: str, reset_token: str) -> bool:
        """Send password reset email."""
        reset_url = f"{settings.FRONTEND_URL}/reset-password?token={reset_token}"
        html_content = f"""
        <html>
        <body>
            <h2>Password Reset Request</h2>
            <p>You requested to reset your password. Click the link below to reset it:</p>
            <a href="{reset_url}">Reset Password</a>
            <p>This link will expire in 1 hour.</p>
            <p>If you didn't request this, please ignore this email.</p>
        </body>
        </html>
        """
        return self.send_email(to_email, "Password Reset Request", html_content)
    
    def send_alert(self, to_email: str, alert_title: str, alert_message: str, severity: str = "info") -> bool:
        """Send alert email."""
        color = {
            "info": "#3B82F6",
            "warning": "#F59E0B",
            "critical": "#EF4444"
        }.get(severity, "#3B82F6")
        
        html_content = f"""
        <html>
        <body style="font-family: Arial, sans-serif;">
            <div style="border-left: 4px solid {color}; padding: 16px; background-color: #F9FAFB;">
                <h2 style="color: {color}; margin-top: 0;">{alert_title}</h2>
                <p>{alert_message}</p>
            </div>
        </body>
        </html>
        """
        return self.send_email(to_email, f"Budget Alert: {alert_title}", html_content)


email_service = EmailService()

