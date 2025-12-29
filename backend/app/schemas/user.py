from pydantic import BaseModel, EmailStr, Field, validator
from typing import Optional
from datetime import datetime
from uuid import UUID
from app.models.user import UserRole, UserStatus

# Request schemas
class UserRegister(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=8, max_length=100)
    name: str = Field(..., min_length=2, max_length=255)
    phone: Optional[str] = Field(None, max_length=20)
    
    @validator('password')
    def validate_password(cls, v):
        if len(v) < 8:
            raise ValueError('Password must be at least 8 characters')
        if not any(char.isdigit() for char in v):
            raise ValueError('Password must contain at least one digit')
        if not any(char.isupper() for char in v):
            raise ValueError('Password must contain at least one uppercase letter')
        return v

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=2, max_length=255)
    phone: Optional[str] = Field(None, max_length=20)
    location: Optional[str] = Field(None, max_length=255)
    bio: Optional[str] = None

class PasswordChange(BaseModel):
    current_password: str
    new_password: str = Field(..., min_length=8, max_length=100)
    
    @validator('new_password')
    def validate_password(cls, v):
        if len(v) < 8:
            raise ValueError('Password must be at least 8 characters')
        if not any(char.isdigit() for char in v):
            raise ValueError('Password must contain at least one digit')
        if not any(char.isupper() for char in v):
            raise ValueError('Password must contain at least one uppercase letter')
        return v

class PasswordResetRequest(BaseModel):
    email: EmailStr

class PasswordReset(BaseModel):
    token: str
    new_password: str = Field(..., min_length=8, max_length=100)

class EmailVerification(BaseModel):
    token: str

# Response schemas
class UserResponse(BaseModel):
    id: UUID
    email: str
    name: str
    phone: Optional[str]
    role: UserRole
    status: UserStatus
    email_verified: bool
    location: Optional[str]
    bio: Optional[str]
    avatar_url: Optional[str]
    created_at: datetime
    last_login: Optional[datetime]
    
    class Config:
        from_attributes = True

class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"

class MessageResponse(BaseModel):
    message: str
