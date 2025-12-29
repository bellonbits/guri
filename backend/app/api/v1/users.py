from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.database import get_db
from app.models.user import User
from app.schemas.user import UserUpdate, UserResponse, PasswordChange, MessageResponse
from app.core.dependencies import get_current_active_user
from app.core.security import verify_password, get_password_hash

router = APIRouter(prefix="/users", tags=["Users"])

@router.get("/me", response_model=UserResponse)
async def read_users_me(
    current_user: User = Depends(get_current_active_user)
):
    """Get current user profile"""
    return UserResponse.from_orm(current_user)

@router.put("/me", response_model=UserResponse)
async def update_user_me(
    user_data: UserUpdate,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    """Update current user profile"""
    
    # Update allowed fields
    if user_data.name is not None:
        current_user.name = user_data.name
    if user_data.phone is not None:
        current_user.phone = user_data.phone
    
    # Handle avatar upload later
    
    await db.commit()
    await db.refresh(current_user)
    
    return UserResponse.from_orm(current_user)

@router.post("/me/password", response_model=MessageResponse)
async def change_password(
    password_data: PasswordChange,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    """Change current user password"""
    
    if not verify_password(password_data.current_password, current_user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Incorrect password"
        )
    
    current_user.password_hash = get_password_hash(password_data.new_password)
    
    await db.commit()
    
    return {"message": "Password updated successfully"}

# Saved Properties
@router.get("/me/saved")
async def get_saved_properties(
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    """Get saved properties for current user"""
    # Force refresh to ensure relationship is loaded
    # Using specific query to load options would be better but lazy='selectin' helps
    return current_user.saved_properties

@router.post("/me/saved/{property_id}", response_model=MessageResponse)
async def save_property(
    property_id: str,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    """Save a property to favorites"""
    from app.models.property import Property
    
    # Check if exists
    stmt = select(Property).where(Property.id == property_id)
    result = await db.execute(stmt)
    property_item = result.scalar_one_or_none()
    
    if not property_item:
        raise HTTPException(status_code=404, detail="Property not found")
    
    # Check if already saved
    if property_item in current_user.saved_properties:
        return {"message": "Property already saved"}
    
    current_user.saved_properties.append(property_item)
    await db.commit()
    
    return {"message": "Property saved successfully"}

@router.delete("/me/saved/{property_id}", response_model=MessageResponse)
async def unsave_property(
    property_id: str,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    """Remove a property from favorites"""
    from app.models.property import Property

    # Check if exists
    stmt = select(Property).where(Property.id == property_id)
    result = await db.execute(stmt)
    property_item = result.scalar_one_or_none()
    
    if not property_item:
        raise HTTPException(status_code=404, detail="Property not found")
        
    if property_item in current_user.saved_properties:
        current_user.saved_properties.remove(property_item)
        await db.commit()
    
    return {"message": "Property removed from favorites"}

@router.post("/me/viewed/{property_id}", status_code=status.HTTP_204_NO_CONTENT)
async def track_user_view(
    property_id: str,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    """Track property view for user history"""
    from app.models.property import Property
    
    # Check if exists
    stmt = select(Property).where(Property.id == property_id)
    result = await db.execute(stmt)
    property_item = result.scalar_one_or_none()
    
    if property_item and property_item not in current_user.viewed_properties:
        current_user.viewed_properties.append(property_item)
        await db.commit()
    
    return None

@router.get("/me/stats")
async def get_user_stats(
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    """Get user dashboard stats"""
    from app.models.inquiry import Inquiry
    from sqlalchemy import func

    # Get inquiries count (Scheduled Visits)
    inquiry_stmt = select(func.count()).select_from(Inquiry).where(Inquiry.user_id == current_user.id)
    inquiry_result = await db.execute(inquiry_stmt)
    inquiries_count = inquiry_result.scalar()

    return {
        "saved_properties": len(current_user.saved_properties),
        "properties_viewed": len(current_user.viewed_properties),
        "scheduled_visits": inquiries_count
    }
