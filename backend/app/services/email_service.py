import aiosmtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from jinja2 import Environment, FileSystemLoader, select_autoescape
from pathlib import Path
from app.config import settings
from app.models.user import User
import logging

logger = logging.getLogger(__name__)

class EmailService:
    def __init__(self):
        self.smtp_host = settings.SMTP_HOST
        self.smtp_port = settings.SMTP_PORT
        self.smtp_user = settings.SMTP_USER
        self.smtp_password = settings.SMTP_PASSWORD
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
        """Send an email"""
        if not settings.EMAILS_ENABLED:
            logger.info(f"Email sending disabled. Would send to {to_email}: {subject}")
            return
        
        try:
            message = MIMEMultipart("alternative")
            message["Subject"] = subject
            message["From"] = f"{self.from_name} <{self.from_email}>"
            message["To"] = to_email
            
            html_part = MIMEText(html_content, "html")
            message.attach(html_part)
            
            # Send email using aiosmtplib
            # Use TLS for 465, STARTTLS for 587
            is_ssl = self.smtp_port == 465
            is_starttls = self.smtp_port == 587
            
            await aiosmtplib.send(
                message,
                hostname=self.smtp_host,
                port=self.smtp_port,
                username=self.smtp_user,
                password=self.smtp_password,
                use_tls=is_ssl,
                start_tls=is_starttls
            )
            
            logger.info(f"Email sent successfully to {to_email}")
        except Exception as e:
            logger.error(f"Failed to send email to {to_email}: {str(e)}")
            raise
    
    async def send_verification_email(self, user: User, verification_code: str):
        """Send email verification code"""
        try:
            template = self.template_env.get_template("verification.html")
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
                    <p>If you didn't create an account, please ignore this email.</p>
                    <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
                    <p style="color: #999; font-size: 12px;">
                        {settings.APP_NAME} - Premium Real Estate Platform
                    </p>
                </body>
            </html>
            """
        else:
            html_content = template.render(
                name=user.name,
                verification_code=verification_code,
                app_name=settings.APP_NAME
            )
        
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
                <p>We received a request to reset your password. Click the button below to create a new password:</p>
                <p style="text-align: center; margin: 30px 0;">
                    <a href="{reset_url}" 
                       style="background-color: #6366f1; color: white; padding: 12px 30px; 
                              text-decoration: none; border-radius: 8px; display: inline-block;">
                        Reset Password
                    </a>
                </p>
                <p>Or copy and paste this link in your browser:</p>
                <p style="word-break: break-all; color: #666;">{reset_url}</p>
                <p>This link will expire in 1 hour.</p>
                <p>If you didn't request a password reset, please ignore this email.</p>
                <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
                <p style="color: #999; font-size: 12px;">
                    {settings.APP_NAME} - Premium Real Estate Platform
                </p>
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
                <p>Your email has been verified successfully. You can now access all features of our platform.</p>
                <p>Start exploring premium properties in Kenya:</p>
                <ul>
                    <li>Browse thousands of properties</li>
                    <li>Save your favorites</li>
                    <li>Contact agents directly</li>
                    <li>Get personalized recommendations</li>
                </ul>
                <p style="text-align: center; margin: 30px 0;">
                    <a href="http://localhost:5173" 
                       style="background-color: #6366f1; color: white; padding: 12px 30px; 
                              text-decoration: none; border-radius: 8px; display: inline-block;">
                        Start Browsing
                    </a>
                </p>
                <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
                <p style="color: #999; font-size: 12px;">
                    {settings.APP_NAME} - Premium Real Estate Platform
                </p>
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
