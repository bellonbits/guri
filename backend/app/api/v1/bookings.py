from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_, or_
from typing import List
from datetime import datetime, timezone
from app.database import get_db
from app.models.property import Property, PropertyPurpose
from app.models.booking import Booking, BookingStatus
from app.models.user import User
from app.schemas.booking import BookingCreate, BookingResponse, BookingUpdate
from app.core.dependencies import get_current_active_user

router = APIRouter(prefix="/bookings", tags=["Bookings"])

@router.post("", response_model=BookingResponse, status_code=status.HTTP_201_CREATED)
async def create_booking(
    booking_data: BookingCreate,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    """Create a new booking after checking availability and property type"""
    
    # Normalize dates to naive UTC for Postgres TIMESTAMP WITHOUT TIME ZONE
    # Pydantic parses JSON dates as aware, but DB expects naive (implicit UTC)
    check_in_naive = booking_data.check_in.astimezone(timezone.utc).replace(tzinfo=None)
    check_out_naive = booking_data.check_out.astimezone(timezone.utc).replace(tzinfo=None)

    # 1. Fetch property
    stmt = select(Property).where(Property.id == booking_data.property_id)
    result = await db.execute(stmt)
    property = result.scalar_one_or_none()
    
    if not property:
        raise HTTPException(status_code=404, detail="Property not found")
    
    if property.purpose != PropertyPurpose.STAY:
        raise HTTPException(
            status_code=400, 
            detail="This property is not available for short-term stays"
        )
    
    # 2. Check date validity
    if check_in_naive >= check_out_naive:
        raise HTTPException(status_code=400, detail="Check-out must be after check-in")
        
    if check_in_naive < datetime.utcnow():
        raise HTTPException(status_code=400, detail="Cannot book in the past")

    # 3. Check for overlapping bookings
    overlap_stmt = select(Booking).where(
        and_(
            Booking.property_id == booking_data.property_id,
            Booking.status == BookingStatus.CONFIRMED,
            or_(
                and_(Booking.check_in <= check_in_naive, Booking.check_out > check_in_naive),
                and_(Booking.check_in < check_out_naive, Booking.check_out >= check_out_naive),
                and_(Booking.check_in >= check_in_naive, Booking.check_out <= check_out_naive)
            )
        )
    )
    overlap_result = await db.execute(overlap_stmt)
    if overlap_result.scalar_one_or_none():
        raise HTTPException(status_code=400, detail="Property is already booked for these dates")

    # 4. Calculate total price
    # Basic logic: price stored in property is nightly price for STAYs
    nights = (check_out_naive - check_in_naive).days
    total_price = property.price * nights

    # 5. Create booking
    new_booking = Booking(
        id=None, # Let DB generate UUID or use default
        property_id=booking_data.property_id,
        check_in=check_in_naive,
        check_out=check_out_naive,
        guest_count=booking_data.guest_count,
        user_id=current_user.id,
        total_price=total_price,
        status=BookingStatus.CONFIRMED # Auto-confirming for now
    )
    
    db.add(new_booking)
    await db.commit()
    await db.refresh(new_booking)
    
    return new_booking

@router.get("/me", response_model=List[BookingResponse])
async def list_my_bookings(
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    """List bookings for the current user"""
    stmt = select(Booking).where(Booking.user_id == current_user.id).order_by(Booking.check_in.desc())
    result = await db.execute(stmt)
    return result.scalars().all()

@router.get("/property/{property_id}/availability")
async def check_availability(
    property_id: str,
    db: AsyncSession = Depends(get_db)
):
    """Get list of booked dates for a property to show in calendar"""
    stmt = select(Booking).where(
        and_(
            Booking.property_id == property_id,
            Booking.status == BookingStatus.CONFIRMED,
            Booking.check_out >= datetime.now(timezone.utc)
        )
    )
    result = await db.execute(stmt)
    bookings = result.scalars().all()
    
    # Return date ranges
    return [{"check_in": b.check_in, "check_out": b.check_out} for b in bookings]
