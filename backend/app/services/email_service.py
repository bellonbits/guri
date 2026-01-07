import resend
from jinja2 import Environment, FileSystemLoader, select_autoescape
from pathlib import Path
from app.config import settings
from app.models.user import User
import logging

logger = logging.getLogger(__name__)

class EmailService:
    def __init__(self):
        # Configure Resend with API Key
        resend.api_key = settings.RESEND_API_KEY
        
        self.from_email = settings.EMAIL_FROM
        self.from_name = settings.EMAIL_FROM_NAME
        
        # Setup Jinja2 for email templates
        template_dir = Path(__file__).parent.parent / "templates" / "emails"
        template_dir.mkdir(parents=True, exist_ok=True)
        
        self.template_env = Environment(
            loader=FileSystemLoader(str(template_dir)),
            autoescape=select_autoescape(['html', 'xml'])
        )
    
    async def send_email(
        self,
        to_email: str,
        subject: str,
        html_content: str
    ):
        """Send an email using Resend"""
        if not settings.EMAILS_ENABLED:
            logger.info(f"Email sending disabled. Would send to {to_email}: {subject}")
            return
        
        try:
            params = {
                "from": f"{self.from_name} <{self.from_email}>",
                "to": [to_email],
                "subject": subject,
                "html": html_content
            }

            r = resend.Emails.send(params)
            logger.info(f"Email sent successfully to {to_email}. ID: {r.get('id')}")
            return r
            
        except Exception as e:
            logger.error(f"Failed to send email to {to_email}: {str(e)}")
            raise
    
    async def send_verification_email(self, user: User, verification_code: str):
        """Send email verification code"""
        try:
            template = self.template_env.get_template("verification.html")
            html_content = template.render(
                name=user.name,
                verification_code=verification_code,
                app_name=settings.APP_NAME
            )
        except:
            # Fallback to simple HTML if template doesn't exist
            html_content = f"""
            <html>
                <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2>Welcome to {settings.APP_NAME}!</h2>
                    <p>Hi {user.name},</p>
                    <p>Thank you for registering. Please use the following code to verify your email address:</p>
                    <p style="text-align: center; margin: 30px 0;">
                        <span style="background-color: #f3f4f6; color: #1f2937; padding: 12px 24px; 
                                   font-size: 24px; font-weight: bold; letter-spacing: 4px; border-radius: 8px; display: inline-block; border: 1px solid #e5e7eb;">
                            {verification_code}
                        </span>
                    </p>
                    <p>This code will expire in 24 hours.</p>
                    <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
                    <p style="color: #999; font-size: 12px;">{settings.APP_NAME}</p>
                </body>
            </html>
            """
        
        await self.send_email(
            to_email=user.email,
            subject=f"Your Verification Code - {settings.APP_NAME}",
            html_content=html_content
        )
    
    async def send_password_reset_email(self, user: User, reset_url: str):
        """Send password reset link"""
        html_content = f"""
        <html>
            <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2>Password Reset Request</h2>
                <p>Hi {user.name},</p>
                <p>Click the button below to reset your password:</p>
                <p style="text-align: center; margin: 30px 0;">
                    <a href="{reset_url}" 
                       style="background-color: #6366f1; color: white; padding: 12px 30px; 
                              text-decoration: none; border-radius: 8px; display: inline-block;">
                        Reset Password
                    </a>
                </p>
                <p>Link expires in 1 hour.</p>
                <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
                <p style="color: #999; font-size: 12px;">{settings.APP_NAME}</p>
            </body>
        </html>
        """
        
        await self.send_email(
            to_email=user.email,
            subject=f"Reset your {settings.APP_NAME} password",
            html_content=html_content
        )
    
    async def send_welcome_email(self, user: User):
        """Send welcome email after verification"""
        html_content = f"""
        <html>
            <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2>Welcome to {settings.APP_NAME}!</h2>
                <p>Hi {user.name},</p>
                <p>Your email has been verified successfully.</p>
                <p style="text-align: center; margin: 30px 0;">
                    <a href="http://localhost:5173" 
                       style="background-color: #6366f1; color: white; padding: 12px 30px; 
                              text-decoration: none; border-radius: 8px; display: inline-block;">
                        Start Browsing
                    </a>
                </p>
                <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
                <p style="color: #999; font-size: 12px;">{settings.APP_NAME}</p>
            </body>
        </html>
        """
        
        await self.send_email(
            to_email=user.email,
            subject=f"Welcome to {settings.APP_NAME}!",
            html_content=html_content
        )

# Create singleton instance
email_service = EmailService()
