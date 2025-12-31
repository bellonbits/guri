from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime
from uuid import UUID
from decimal import Decimal
from app.models.booking import BookingStatus

class BookingBase(BaseModel):
    property_id: UUID
    check_in: datetime
    check_out: datetime
    guest_count: int = Field(1, ge=1)

class BookingCreate(BookingBase):
    pass

class BookingUpdate(BaseModel):
    status: Optional[BookingStatus] = None
    check_in: Optional[datetime] = None
    check_out: Optional[datetime] = None
    guest_count: Optional[int] = None

class BookingResponse(BookingBase):
    id: UUID
    user_id: UUID
    total_price: Decimal
    status: BookingStatus
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
