from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.database import get_db
from app.models.inquiry import Inquiry
from app.models.property import Property
from app.models.user import User
from app.schemas.inquiry import InquiryCreate, InquiryResponse, InquiryStatusUpdate
from app.core.dependencies import get_current_user, get_current_active_user
from typing import Optional

router = APIRouter(prefix="/inquiries", tags=["Inquiries"])

@router.post("", response_model=InquiryResponse, status_code=status.HTTP_201_CREATED)
async def create_inquiry(
    inquiry_data: InquiryCreate,
    current_user: Optional[User] = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Create new inquiry"""
    
    # Verify property exists
    stmt = select(Property).where(Property.id == inquiry_data.property_id)
    result = await db.execute(stmt)
    property = result.scalar_one_or_none()
    
    if not property:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Property not found"
        )
    
    # Create inquiry
    new_inquiry = Inquiry(
        **inquiry_data.dict(),
        user_id=current_user.id if current_user else None
    )
    
    db.add(new_inquiry)
    await db.commit()
    await db.refresh(new_inquiry)
    
    # TODO: Send email notification to property agent
    
    return InquiryResponse.from_orm(new_inquiry)

@router.get("", response_model=list[InquiryResponse])
async def list_inquiries(
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    """List user's inquiries"""
    
    stmt = select(Inquiry).where(Inquiry.user_id == current_user.id).order_by(Inquiry.created_at.desc())
    result = await db.execute(stmt)
    inquiries = result.scalars().all()
    
    return [InquiryResponse.from_orm(i) for i in inquiries]

@router.get("/{inquiry_id}", response_model=InquiryResponse)
async def get_inquiry(
    inquiry_id: str,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    """Get inquiry details"""
    
    stmt = select(Inquiry).where(Inquiry.id == inquiry_id)
    result = await db.execute(stmt)
    inquiry = result.scalar_one_or_none()
    
    if not inquiry:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Inquiry not found"
        )
    
    # Check permissions
    if str(inquiry.user_id) != str(current_user.id) and current_user.role not in ["admin", "super_admin"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to view this inquiry"
        )
    
    return InquiryResponse.from_orm(inquiry)

@router.patch("/{inquiry_id}/status", response_model=InquiryResponse)
async def update_inquiry_status(
    inquiry_id: str,
    status_update: InquiryStatusUpdate,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    """Update inquiry status (agent/admin only)"""
    
    if current_user.role not in ["agent", "admin", "super_admin"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only agents and admins can update inquiry status"
        )
    
    stmt = select(Inquiry).where(Inquiry.id == inquiry_id)
    result = await db.execute(stmt)
    inquiry = result.scalar_one_or_none()
    
    if not inquiry:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Inquiry not found"
        )
    
    inquiry.status = status_update.status
    await db.commit()
    await db.refresh(inquiry)
    
    return InquiryResponse.from_orm(inquiry)
