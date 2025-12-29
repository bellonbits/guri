from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, desc
from datetime import datetime, timedelta
from app.database import get_db
from app.models.property import Property
from app.models.user import User
from app.models.inquiry import Inquiry
from app.core.dependencies import get_current_admin_user
from typing import List, Dict, Any

router = APIRouter(prefix="/analytics", tags=["Analytics"])

@router.get("/dashboard")
async def get_dashboard_stats(
    period: str = Query("30d"),
    current_user: User = Depends(get_current_admin_user),
    db: AsyncSession = Depends(get_db)
):
    """Get summarized dashboard stats"""
    
    # Determine date range
    now = datetime.utcnow()
    if period == "7d":
        start_date = now - timedelta(days=7)
    elif period == "30d":
        start_date = now - timedelta(days=30)
    elif period == "90d":
        start_date = now - timedelta(days=90)
    else:
        start_date = now - timedelta(days=30)
        
    # Get total counts
    total_users_result = await db.execute(select(func.count(User.id)))
    total_users = total_users_result.scalar() or 0
    
    total_properties_result = await db.execute(select(func.count(Property.id)))
    total_properties = total_properties_result.scalar() or 0
    
    total_inquiries_result = await db.execute(select(func.count(Inquiry.id)))
    total_inquiries = total_inquiries_result.scalar() or 0
    
    # Get new counts in period
    new_users_result = await db.execute(select(func.count(User.id)).where(User.created_at >= start_date))
    new_users = new_users_result.scalar() or 0
    
    new_properties_result = await db.execute(select(func.count(Property.id)).where(Property.created_at >= start_date))
    new_properties = new_properties_result.scalar() or 0
    
    return {
        "users": {
            "total": total_users,
            "new": new_users,
            "growth": round((new_users / max(1, (total_users - new_users))) * 100, 1)
        },
        "properties": {
            "total": total_properties,
            "new": new_properties,
            "growth": round((new_properties / max(1, (total_properties - new_properties))) * 100, 1)
        },
        "inquiries": {
            "total": total_inquiries,
            "pending": 0  # To be implemented with status filtering
        },
        "revenue": {
            "total": 0,
            "growth": 0
        }
    }

@router.get("/traffic")
async def get_traffic_data(
    period: str = Query("7d"),
    current_user: User = Depends(get_current_admin_user),
    db: AsyncSession = Depends(get_db)
):
    """Get traffic data for charts using real viewed_properties history"""
    try:
        from app.models.user import viewed_properties
        from sqlalchemy import cast, Date

        days = 30 if period == "30d" else 7
        start_date = datetime.utcnow() - timedelta(days=days)
        
        stmt = select(viewed_properties).where(viewed_properties.c.viewed_at >= start_date)
        result = await db.execute(stmt)
        rows = result.fetchall() 
        
        data_map = {}
        now = datetime.utcnow()
        for i in range(days):
            d = (now - timedelta(days=days-1-i)).strftime("%Y-%m-%d")
            data_map[d] = {"views": 0, "visitors": set()}

        for row in rows:
            # row access: viewed_at is column 2
            # Safe access: use integer index if mapping is uncertain, or attribute check
            v_at = row[2] # user_id, property_id, viewed_at
            
            if v_at:
                d_str = v_at.strftime("%Y-%m-%d")
                if d_str in data_map:
                    data_map[d_str]["views"] += 1
                    data_map[d_str]["visitors"].add(row[0]) # user_id is index 0

        labels = []
        views = []
        visitors = []
        
        for date_str in sorted(data_map.keys()):
            labels.append(date_str)
            views.append(data_map[date_str]["views"])
            visitors.append(len(data_map[date_str]["visitors"]))
            
        return {
            "labels": labels,
            "visitors": visitors,
            "views": views
        }
    except Exception as e:
        import traceback
        traceback.print_exc()
        # Return empty structure to prevent frontend crash
        return {"labels": [], "visitors": [], "views": []}

@router.get("/views-by-category")
async def get_property_views_by_category(
    current_user: User = Depends(get_current_admin_user),
    db: AsyncSession = Depends(get_db)
):
    """Aggregate property views by type"""
    try:
        stmt = (
            select(Property.type, func.sum(Property.views))
            .group_by(Property.type)
            .order_by(func.sum(Property.views).desc())
        )
        
        result = await db.execute(stmt)
        rows = result.all()
        
        return [
            {
                "category": (row[0].value.title() if hasattr(row[0], 'value') else str(row[0]).title()) if row[0] else "Uncategorized", 
                "views": row[1] or 0
            }
            for row in rows
        ]
    except Exception as e:
        import traceback
        traceback.print_exc()
        return []

@router.get("/recent-activity")
async def get_recent_activity(
    limit: int = 10,
    current_user: User = Depends(get_current_admin_user),
    db: AsyncSession = Depends(get_db)
):
    """Combine recent events from Users, Properties, Inquiries"""
    try:
        # Fetch recent users
        users_stmt = select(User).order_by(User.created_at.desc()).limit(limit)
        users_res = await db.execute(users_stmt)
        users = users_res.scalars().all()
        
        # Fetch recent properties
        props_stmt = select(Property).order_by(Property.created_at.desc()).limit(limit)
        props_res = await db.execute(props_stmt)
        props = props_res.scalars().all()
        
        # Fetch recent inquiries
        inq_stmt = select(Inquiry).order_by(Inquiry.created_at.desc()).limit(limit)
        inq_res = await db.execute(inq_stmt)
        inqs = inq_res.scalars().all()
        
        activities = []
        
        for u in users:
            activities.append({
                "id": f"u-{u.id}",
                "type": "user",
                "action": "New User Signed Up",
                "detail": u.name,
                "time": u.created_at
            })
            
        for p in props:
             activities.append({
                "id": f"p-{p.id}",
                "type": "property",
                "action": "New Property Listed",
                "detail": p.title,
                "time": p.created_at
            })
            
        for i in inqs:
            activities.append({
                "id": f"i-{i.id}",
                "type": "inquiry",
                "action": "New Inquiry Received",
                "detail": i.message[:30] + "..." if i.message else "Contact Request",
                "time": i.created_at
            })
            
        activities.sort(key=lambda x: x["time"], reverse=True)
        
        final_list = activities[:limit]
        
        return [
            {
                "id": item["id"],
                "action": item["action"],
                "user": item["detail"] if item["type"] == "user" else None,
                "property": item["detail"] if item["type"] != "user" else None,
                "time": item["time"].isoformat()
            }
            for item in final_list
        ]
    except Exception as e:
        import traceback
        traceback.print_exc()
        return []

@router.get("/top-properties")
async def get_top_properties(
    limit: int = 5,
    current_user: User = Depends(get_current_admin_user),
    db: AsyncSession = Depends(get_db)
):
    """Get most viewed properties"""
    
    stmt = select(Property).order_by(desc(Property.views)).limit(limit)
    result = await db.execute(stmt)
    properties = result.scalars().all()
    
    return [
        {
            "id": str(p.id),
            "title": p.title,
            "location": p.location,
            "views": p.views,
            "inquiries": 0 # Join with inquiries count later
        }
        for p in properties
    ]
