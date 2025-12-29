from sqlalchemy import Column, String, Boolean, Integer, DateTime, Enum as SQLEnum, Table, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.dialects.postgresql import UUID
from datetime import datetime
import uuid
import enum
from app.database import Base

class UserRole(str, enum.Enum):
    USER = "user"
    AGENT = "agent"
    ADMIN = "admin"
    SUPER_ADMIN = "super_admin"

class UserStatus(str, enum.Enum):
    ACTIVE = "active"
    SUSPENDED = "suspended"
    BANNED = "banned"

class User(Base):
    __tablename__ = "users"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    email = Column(String(255), unique=True, nullable=False, index=True)
    password_hash = Column(String(255), nullable=False)
    name = Column(String(255), nullable=False)
    phone = Column(String(20))
    role = Column(SQLEnum(UserRole), default=UserRole.USER, nullable=False, index=True)
    status = Column(SQLEnum(UserStatus), default=UserStatus.ACTIVE, nullable=False, index=True)
    
    # Email verification
    email_verified = Column(Boolean, default=False, nullable=False)
    verification_token = Column(String(255), unique=True, index=True)
    verification_token_expires = Column(DateTime)
    
    # Password reset
    reset_token = Column(String(255), unique=True, index=True)
    reset_token_expires = Column(DateTime)
    
    # Profile
    location = Column(String(255))
    bio = Column(String)
    avatar_url = Column(String(500))
    
    # Security
    login_attempts = Column(Integer, default=0)
    locked_until = Column(DateTime)
    last_login = Column(DateTime)
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)
    
    # Relationships
    saved_properties = relationship("Property", secondary="saved_properties", backref="saved_by", lazy="selectin")
    viewed_properties = relationship("Property", secondary="viewed_properties", backref="viewed_by", lazy="selectin")
    
    def __repr__(self):
        return f"<User {self.email}>"

# Association table for saved properties
saved_properties = Table(
    "saved_properties",
    Base.metadata,
    Column("user_id", UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), primary_key=True),
    Column("property_id", UUID(as_uuid=True), ForeignKey("properties.id", ondelete="CASCADE"), primary_key=True),
    Column("saved_at", DateTime, default=datetime.utcnow)
)

# Association table for viewed properties (History)
viewed_properties = Table(
    "viewed_properties",
    Base.metadata,
    Column("user_id", UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), primary_key=True),
    Column("property_id", UUID(as_uuid=True), ForeignKey("properties.id", ondelete="CASCADE"), primary_key=True),
    Column("viewed_at", DateTime, default=datetime.utcnow)
)
