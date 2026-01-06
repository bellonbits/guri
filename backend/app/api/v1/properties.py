from fastapi import APIRouter, Depends, HTTPException, status, Query, File, UploadFile
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, or_
from typing import Optional, List
from datetime import datetime
from app.database import get_db
from app.models.property import Property, PropertyType, PropertyPurpose, PropertyStatus
from app.models.user import User
from app.schemas.property import PropertyCreate, PropertyUpdate, PropertyResponse, PropertyListResponse
from app.core.dependencies import get_current_user, get_current_active_user
from app.services.storage_service import storage_service
import re

router = APIRouter(prefix="/properties", tags=["Properties"])

def create_slug(title: str) -> str:
    """Create URL-friendly slug from title"""
    slug = title.lower()
    slug = re.sub(r'[^a-z0-9]+', '-', slug)
    slug = slug.strip('-')
    return slug

@router.get("", response_model=PropertyListResponse)
async def list_properties(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    type: Optional[PropertyType] = None,
    purpose: Optional[PropertyPurpose] = None,
    status: Optional[PropertyStatus] = None,
    min_price: Optional[float] = None,
    max_price: Optional[float] = None,
    location: Optional[str] = None,
    bedrooms: Optional[int] = None,
    search: Optional[str] = None,
    current_user: Optional[User] = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """List properties with filters and pagination"""
    
    # Build query
    query = select(Property)
    
    # Visibility Logic
    is_admin = current_user and current_user.role in ["admin", "super_admin", "agent"]
    
    if not is_admin:
        # Public: Only show published
        query = query.where(Property.status == PropertyStatus.PUBLISHED)
    else:
        # Admin: Filter by status if provided, otherwise show all
        if status:
            query = query.where(Property.status == status)

    # Apply other filters
    if type:
        query = query.where(Property.type == type)
    if purpose:
        query = query.where(Property.purpose == purpose)
    if min_price:
        query = query.where(Property.price >= min_price)
    if max_price:
        query = query.where(Property.price <= max_price)
    if location:
        query = query.where(Property.location.ilike(f"%{location}%"))
    if bedrooms:
        query = query.where(Property.bedrooms >= bedrooms)
    if search:
        query = query.where(
            or_(
                Property.title.ilike(f"%{search}%"),
                Property.description.ilike(f"%{search}%"),
                Property.location.ilike(f"%{search}%")
            )
        )
    
    # Get total count
    count_query = select(func.count()).select_from(query.subquery())
    total_result = await db.execute(count_query)
    total = total_result.scalar()
    
    # Apply pagination
    offset = (page - 1) * page_size
    query = query.offset(offset).limit(page_size).order_by(Property.created_at.desc())
    
    # Execute query
    result = await db.execute(query)
    properties = result.scalars().all()
    
    return PropertyListResponse(
        properties=[PropertyResponse.from_orm(p) for p in properties],
        total=total,
        page=page,
        page_size=page_size
    )

@router.get("/{slug}", response_model=PropertyResponse)
async def get_property(
    slug: str,
    current_user: Optional[User] = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Get property by slug"""
    
    stmt = select(Property).where(Property.slug == slug)
    result = await db.execute(stmt)
    property = result.scalar_one_or_none()
    
    if not property:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Property not found"
        )
    
    # Check visibility
    if property.status != PropertyStatus.PUBLISHED:
        is_admin = current_user and current_user.role in ["admin", "super_admin", "agent"]
        if not is_admin:
             raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Property not found"
            )
    
    # Increment views
    property.views += 1
    await db.commit()
    
    return PropertyResponse.from_orm(property)

@router.get("/id/{property_id}", response_model=PropertyResponse)
async def get_property_by_id(
    property_id: str,
    db: AsyncSession = Depends(get_db)
):
    """Get property by ID"""
    stmt = select(Property).where(Property.id == property_id)
    result = await db.execute(stmt)
    property = result.scalar_one_or_none()
    
    if not property:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Property not found"
        )
    return PropertyResponse.from_orm(property)

@router.post("", response_model=PropertyResponse, status_code=status.HTTP_201_CREATED)
async def create_property(
    property_data: PropertyCreate,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    """Create new property (agent/admin only)"""
    
    # Check if user is agent or admin
    if current_user.role not in ["agent", "admin", "super_admin"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only agents and admins can create properties"
        )
    
    # Create slug
    base_slug = create_slug(property_data.title)
    slug = base_slug
    counter = 1
    
    # Ensure unique slug
    while True:
        stmt = select(Property).where(Property.slug == slug)
        result = await db.execute(stmt)
        if not result.scalar_one_or_none():
            break
        slug = f"{base_slug}-{counter}"
        counter += 1
    
    # Create property
    new_property = Property(
        **property_data.dict(),
        slug=slug,
        agent_id=current_user.id
    )
    
    db.add(new_property)
    await db.commit()
    await db.refresh(new_property)
    
    return PropertyResponse.from_orm(new_property)

@router.put("/{property_id}", response_model=PropertyResponse)
async def update_property(
    property_id: str,
    property_data: PropertyUpdate,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    """Update property"""
    
    stmt = select(Property).where(Property.id == property_id)
    result = await db.execute(stmt)
    property = result.scalar_one_or_none()
    
    if not property:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Property not found"
        )
    
    # Check permissions
    if current_user.role not in ["admin", "super_admin"] and str(property.agent_id) != str(current_user.id):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to update this property"
        )
    
    # Update fields
    update_data = property_data.dict(exclude_unset=True)
    
    # Update slug if title changed
    if "title" in update_data:
        base_slug = create_slug(update_data["title"])
        slug = base_slug
        counter = 1
        
        while True:
            stmt = select(Property).where(Property.slug == slug, Property.id != property_id)
            result = await db.execute(stmt)
            if not result.scalar_one_or_none():
                break
            slug = f"{base_slug}-{counter}"
            counter += 1
        
        update_data["slug"] = slug
    
    # Set published_at if status changed to published
    if update_data.get("status") == PropertyStatus.PUBLISHED and property.status != PropertyStatus.PUBLISHED:
        update_data["published_at"] = datetime.utcnow()
    
    for key, value in update_data.items():
        setattr(property, key, value)
    
    await db.commit()
    await db.refresh(property)
    
    return PropertyResponse.from_orm(property)

@router.delete("/{property_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_property(
    property_id: str,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    """Delete property"""
    
    stmt = select(Property).where(Property.id == property_id)
    result = await db.execute(stmt)
    property = result.scalar_one_or_none()
    
    if not property:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Property not found"
        )
    
    # Check permissions
    if current_user.role not in ["admin", "super_admin"] and str(property.agent_id) != str(current_user.id):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to delete this property"
        )
    
    await db.delete(property)
    await db.commit()
    
    return None

@router.post("/{property_id}/view", status_code=status.HTTP_204_NO_CONTENT)
async def track_property_view(
    property_id: str,
    db: AsyncSession = Depends(get_db)
):
    """Track property view"""
    
    stmt = select(Property).where(Property.id == property_id)
    result = await db.execute(stmt)
    property = result.scalar_one_or_none()
    
    if property:
        property.views += 1
        await db.commit()
    
    return None

@router.post("/{property_id}/images", response_model=PropertyResponse)
async def upload_property_images(
    property_id: str,
    files: List[UploadFile] = File(...),
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    """Upload images for a property"""
    
    stmt = select(Property).where(Property.id == property_id)
    result = await db.execute(stmt)
    property = result.scalar_one_or_none()
    
    if not property:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Property not found"
        )
        
    # Check permissions
    if current_user.role not in ["admin", "super_admin"] and str(property.agent_id) != str(current_user.id):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to upload images for this property"
        )
    
    uploaded_urls = []
    for file in files:
        url = await storage_service.upload_file(file)
        uploaded_urls.append(url)
    
    # Update property images list
    current_images = property.images or []
    property.images = current_images + uploaded_urls
    
    await db.commit()
    await db.refresh(property)
    
    return property
