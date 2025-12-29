from pydantic import BaseModel, Field, validator
from typing import Optional, List
from datetime import datetime
from decimal import Decimal
from app.models.property import PropertyType, PropertyPurpose, PropertyStatus

# Request schemas
class PropertyCreate(BaseModel):
    title: str = Field(..., min_length=10, max_length=500)
    description: str = Field(..., min_length=50)
    type: PropertyType
    purpose: PropertyPurpose
    price: Decimal = Field(..., gt=0)
    location: str = Field(..., min_length=3, max_length=255)
    address: Optional[str] = None
    latitude: Optional[Decimal] = None
    longitude: Optional[Decimal] = None
    bedrooms: Optional[int] = Field(None, ge=0)
    bathrooms: Optional[int] = Field(None, ge=0)
    area_sqft: Optional[int] = Field(None, gt=0)
    features: Optional[dict] = None
    images: Optional[List[str]] = None

class PropertyUpdate(BaseModel):
    title: Optional[str] = Field(None, min_length=10, max_length=500)
    description: Optional[str] = Field(None, min_length=50)
    type: Optional[PropertyType] = None
    purpose: Optional[PropertyPurpose] = None
    price: Optional[Decimal] = Field(None, gt=0)
    location: Optional[str] = Field(None, min_length=3, max_length=255)
    address: Optional[str] = None
    latitude: Optional[Decimal] = None
    longitude: Optional[Decimal] = None
    bedrooms: Optional[int] = Field(None, ge=0)
    bathrooms: Optional[int] = Field(None, ge=0)
    area_sqft: Optional[int] = Field(None, gt=0)
    features: Optional[dict] = None
    images: Optional[List[str]] = None
    status: Optional[PropertyStatus] = None

from uuid import UUID

# Response schemas
class PropertyResponse(BaseModel):
    id: UUID
    title: str
    slug: str
    description: Optional[str]
    type: PropertyType
    purpose: PropertyPurpose
    price: Decimal
    location: str
    address: Optional[str]
    latitude: Optional[Decimal]
    longitude: Optional[Decimal]
    bedrooms: Optional[int]
    bathrooms: Optional[int]
    area_sqft: Optional[int]
    features: Optional[dict]
    images: Optional[List[str]]
    status: PropertyStatus
    views: int
    agent_id: UUID
    created_at: datetime
    updated_at: datetime
    published_at: Optional[datetime]
    
    class Config:
        from_attributes = True

class PropertyListResponse(BaseModel):
    properties: List[PropertyResponse]
    total: int
    page: int
    page_size: int
