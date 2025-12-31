from sqlalchemy import Column, String, Integer, Numeric, Boolean, DateTime, Enum as SQLEnum, Text
from sqlalchemy.dialects.postgresql import UUID, JSONB
from datetime import datetime
import uuid
import enum
from app.database import Base

class PropertyType(str, enum.Enum):
    APARTMENT = "apartment"
    HOUSE = "house"
    VILLA = "villa"
    COMMERCIAL = "commercial"
    LAND = "land"

class PropertyPurpose(str, enum.Enum):
    SALE = "sale"
    RENT = "rent"
    STAY = "stay" # Airbnb style short-term stay

class PropertyStatus(str, enum.Enum):
    DRAFT = "draft"
    PUBLISHED = "published"
    ARCHIVED = "archived"

class Property(Base):
    __tablename__ = "properties"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    title = Column(String(500), nullable=False)
    slug = Column(String(500), unique=True, nullable=False, index=True)
    description = Column(Text)
    type = Column(SQLEnum(PropertyType), nullable=False, index=True)
    purpose = Column(SQLEnum(PropertyPurpose), nullable=False, index=True)
    price = Column(Numeric(15, 2), nullable=False, index=True)
    
    # Location
    location = Column(String(255), nullable=False, index=True)
    address = Column(Text)
    latitude = Column(Numeric(10, 8))
    longitude = Column(Numeric(11, 8))
    
    # Details
    bedrooms = Column(Integer)
    bathrooms = Column(Integer)
    area_sqft = Column(Integer)
    features = Column(JSONB)  # amenities, parking, etc.
    images = Column(JSONB)  # array of image URLs
    
    # Status & Analytics
    status = Column(SQLEnum(PropertyStatus), default=PropertyStatus.DRAFT, nullable=False, index=True)
    views = Column(Integer, default=0)
    
    # Relationships
    agent_id = Column(UUID(as_uuid=True), nullable=False)
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)
    published_at = Column(DateTime)
    
    def __repr__(self):
        return f"<Property {self.title}>"
