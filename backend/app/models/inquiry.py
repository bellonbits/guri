from sqlalchemy import Column, String, DateTime, Enum as SQLEnum, Text
from sqlalchemy.dialects.postgresql import UUID
from datetime import datetime
import uuid
import enum
from app.database import Base

class InquiryStatus(str, enum.Enum):
    NEW = "new"
    CONTACTED = "contacted"
    CONVERTED = "converted"
    CLOSED = "closed"

class Inquiry(Base):
    __tablename__ = "inquiries"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    property_id = Column(UUID(as_uuid=True), nullable=False, index=True)
    user_id = Column(UUID(as_uuid=True), index=True)
    
    # Contact info
    name = Column(String(255), nullable=False)
    email = Column(String(255), nullable=False)
    phone = Column(String(20))
    message = Column(Text, nullable=False)
    
    # Status
    status = Column(SQLEnum(InquiryStatus), default=InquiryStatus.NEW, nullable=False, index=True)
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)
    
    def __repr__(self):
        return f"<Inquiry {self.id}>"
