from fastapi import Depends, HTTPException, status, Cookie
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import Optional
from app.database import get_db
from app.models.user import User
from app.core.security import decode_token

async def get_current_user(
    access_token: Optional[str] = Cookie(None),
    db: AsyncSession = Depends(get_db)
) -> Optional[User]:
    """Get current user from JWT token in cookie"""
    
    if not access_token:
        return None
    
    # Decode token
    payload = decode_token(access_token)
    if not payload:
        return None
    
    user_id = payload.get("sub")
    if not user_id:
        return None
    
    # Get user from database
    stmt = select(User).where(User.id == user_id)
    result = await db.execute(stmt)
    user = result.scalar_one_or_none()
    
    return user

async def get_current_active_user(
    current_user: User = Depends(get_current_user)
) -> User:
    """Get current active user or raise exception"""
    
    if not current_user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authenticated"
        )
    
    if current_user.status != "active":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=f"Account is {current_user.status}"
        )
    
    if not current_user.email_verified:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Email not verified"
        )
    
    return current_user

async def get_current_admin_user(
    current_user: User = Depends(get_current_active_user)
) -> User:
    """Get current admin user or raise exception"""
    
    if current_user.role not in ["admin", "super_admin"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access required"
        )
    
    return current_user
