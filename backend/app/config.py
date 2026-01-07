from pydantic_settings import BaseSettings
from typing import List

class Settings(BaseSettings):
    # Application
    APP_NAME: str = "Guri24"
    APP_ENV: str = "development"
    DEBUG: bool = True
    API_VERSION: str = "v1"
    SECRET_KEY: str
    ALLOWED_HOSTS: str = "localhost,127.0.0.1"
    
    # Database
    POSTGRES_USER: str
    POSTGRES_PASSWORD: str
    POSTGRES_DB: str
    POSTGRES_HOST: str = "localhost"
    POSTGRES_PORT: int = 5432
    DATABASE_URL: str
    
    # Redis
    REDIS_HOST: str = "localhost"
    REDIS_PORT: int = 6379
    REDIS_PASSWORD: str = ""
    REDIS_DB: int = 0
    REDIS_URL: str
    
    # JWT
    JWT_SECRET_KEY: str
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7
    
    # Email
    SMTP_HOST: str
    SMTP_PORT: int
    SMTP_USER: str
    SMTP_PASSWORD: str
    SMTP_USE_TLS: bool = True
    EMAIL_FROM: str
    EMAIL_FROM_NAME: str
    EMAILS_ENABLED: bool = True
    EMAIL_VERIFICATION_EXPIRE_HOURS: int = 24
    RESEND_API_KEY: str = "re_gs1mGZ2G_47yAXVNbVBaWvuXwRgcqwgen"
    
    # Security
    RATE_LIMIT_PER_MINUTE: int = 60
    RATE_LIMIT_PER_HOUR: int = 1000
    CORS_ORIGINS: str
    COOKIE_SECURE: bool = False
    COOKIE_SAMESITE: str = "lax"
    
    # Analytics
    MIXPANEL_TOKEN: str = ""
    
    # File Upload
    MAX_FILE_SIZE: int = 10485760
    ALLOWED_EXTENSIONS: str = "jpg,jpeg,png,pdf"
    UPLOAD_DIR: str = "./uploads"

    # MinIO / S3 Storage

    @property
    def cookie_samesite_lower(self) -> str:
        return self.COOKIE_SAMESITE.lower()
    S3_ENDPOINT: str = "http://localhost:9000"
    S3_ACCESS_KEY: str = "minioadmin"
    S3_SECRET_KEY: str = "minioadmin"
    S3_BUCKET: str = "guri24"
    S3_USE_SSL: bool = False
    S3_REGION: str = "us-east-1"
    S3_PUBLIC_URL_OVERRIDE: str = "" # Useful for Docker
    
    # Admin
    ADMIN_EMAIL: str
    ADMIN_PASSWORD: str
    
    @property
    def cors_origins_list(self) -> List[str]:
        return [origin.strip() for origin in self.CORS_ORIGINS.split(",")]
    
    @property
    def allowed_extensions_list(self) -> List[str]:
        return [ext.strip() for ext in self.ALLOWED_EXTENSIONS.split(",")]
    
    class Config:
        env_file = ".env"
        case_sensitive = True

settings = Settings()
