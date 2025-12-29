from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from typing import List, Optional
from datetime import datetime
from app.database import get_db
from app.models.user import User, UserRole
from app.schemas.user import UserResponse
from app.core.dependencies import get_current_admin_user

router = APIRouter(prefix="/admin", tags=["Admin"])

@router.get("/users", response_model=List[UserResponse])
async def list_users(
    skip: int = 0,
    limit: int = 50,
    role: Optional[str] = None,
    search: Optional[str] = None,
    current_user: User = Depends(get_current_admin_user),
    db: AsyncSession = Depends(get_db)
):
    """List all users with filters (Admin only)"""
    
    query = select(User)
    
    if role:
        query = query.where(User.role == role)
        
    if search:
        query = query.where(User.email.ilike(f"%{search}%") | User.name.ilike(f"%{search}%"))
        
    query = query.offset(skip).limit(limit).order_by(User.created_at.desc())
    
    result = await db.execute(query)
    users = result.scalars().all()
    
    return [UserResponse.from_orm(u) for u in users]

@router.get("/users/{user_id}", response_model=UserResponse)
async def get_user_details(
    user_id: str,
    current_user: User = Depends(get_current_admin_user),
    db: AsyncSession = Depends(get_db)
):
    """Get detailed user info"""
    
    stmt = select(User).where(User.id == user_id)
    result = await db.execute(stmt)
    user = result.scalar_one_or_none()
    
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
        
    return UserResponse.from_orm(user)

@router.patch("/users/{user_id}/role")
async def update_user_role(
    user_id: str,
    role: str,
    current_user: User = Depends(get_current_admin_user),
    db: AsyncSession = Depends(get_db)
):
    """Update user role"""
    
    if current_user.role != "super_admin" and role == "admin":
         raise HTTPException(status_code=403, detail="Only super admins can promote users to admin")
         
    stmt = select(User).where(User.id == user_id)
    result = await db.execute(stmt)
    user = result.scalar_one_or_none()
    
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
        
    # Validate role
    try:
        new_role = UserRole(role)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid role")
        
    user.role = new_role
    await db.commit()
    
    return {"message": f"User role updated to {role}"}

@router.get("/system/health")
async def get_system_health(
    current_user: User = Depends(get_current_admin_user),
    db: AsyncSession = Depends(get_db)
):
    """Get system health status for monitoring"""
    
    # Check Database
    try:
        await db.execute(select(1))
        db_status = "healthy"
        db_latency = "12ms" # Mock latency
    except Exception:
        db_status = "degraded"
        db_latency = "timeout"
        
    # Mock other services for now
    return {
        "status": "operational",
        "timestamp": datetime.utcnow(),
        "services": {
            "api": {"status": "healthy", "uptime": "99.9%"},
            "database": {"status": db_status, "latency": db_latency},
            "cache": {"status": "healthy", "latency": "2ms"},
            "email": {"status": "healthy", "queue": 0}
        },
        "resources": {
            "cpu": 45,
            "memory": 60,
            "disk": 28
        }
    }
