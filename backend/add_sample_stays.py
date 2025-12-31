import asyncio
import uuid
import sys
import os
from datetime import datetime
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
from sqlalchemy import select

# Updated with correct password found in .env via python
DATABASE_URL = "postgresql+asyncpg://admin:12345678@localhost:5432/guri24"
# Fallback URLs
FALLBACK_URLS = [
    "postgresql+asyncpg://postgres:12345678@localhost:5432/guri24",
    "postgresql+asyncpg://admin:admin123@localhost:5432/guri24"
]

# Add parent directory to path
sys.path.append(os.getcwd())

from app.models.property import Property, PropertyType, PropertyPurpose, PropertyStatus
from app.models.user import User

sample_stays = [
    {
        "title": "Oceanfront Infinity Villa - Malindi",
        "description": "Experience peak luxury in this stunning oceanfront villa. Features an infinity pool, private beach access, and 24/7 butler service. Perfect for high-end retreats.",
        "type": PropertyType.VILLA,
        "purpose": PropertyPurpose.STAY,
        "price": 45000,
        "location": "Malindi, Coastal",
        "address": "Casuarina Road, Malindi, Kenya",
        "bedrooms": 5,
        "bathrooms": 6,
        "area_sqft": 4500,
        "features": {"pool": True, "beach_access": True, "wifi": True, "chef": True, "ac": True},
        "images": [
            "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=1200",
            "https://images.unsplash.com/photo-1576013551627-0cc20b96c2a7?w=1200"
        ]
    },
    {
        "title": "Modern Boho Loft in Kilimani",
        "description": "A stylish, plant-filled loft in the heart of Kilimani. High ceilings, industrial windows, and a dedicated workspace. Ideal for digital nomads.",
        "type": PropertyType.APARTMENT,
        "purpose": PropertyPurpose.STAY,
        "price": 8500,
        "location": "Kilimani, Nairobi",
        "address": "Argwings Kodhek Rd, Nairobi, Kenya",
        "bedrooms": 1,
        "bathrooms": 1,
        "area_sqft": 950,
        "features": {"wifi": True, "workspace": True, "gym": True, "balcony": True, "parking": True},
        "images": [
            "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=1200",
            "https://images.unsplash.com/photo-1484154218962-a197022b5858?w=1200"
        ]
    },
    {
        "title": "Glass Treehouse - Karen Forest",
        "description": "Sleep among the trees in this architectural masterpiece. Floor-to-ceiling glass walls offer breathtaking views of the Karen forest.",
        "type": PropertyType.HOUSE,
        "purpose": PropertyPurpose.STAY,
        "price": 22000,
        "location": "Karen, Nairobi",
        "address": "Mbagathi Ridge, Nairobi, Kenya",
        "bedrooms": 2,
        "bathrooms": 2,
        "area_sqft": 1800,
        "features": {"forest_view": True, "fireplace": True, "wifi": True, "deck": True, "privacy": True},
        "images": [
            "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=1200",
            "https://images.unsplash.com/photo-1449156001533-cb39c85244f0?w=1200"
        ]
    },
    {
        "title": "Minimalist Penthouse with City View",
        "description": "Sleek, black-and-white minimalist penthouse on the 24th floor. Rooftop lounge and 360-degree views of the Nairobi skyline.",
        "type": PropertyType.APARTMENT,
        "purpose": PropertyPurpose.STAY,
        "price": 15000,
        "location": "Westlands, Nairobi",
        "address": "Gochi St, Westlands, Kenya",
        "bedrooms": 2,
        "bathrooms": 2,
        "area_sqft": 1600,
        "features": {"rooftop": True, "wifi": True, "security": True, "pool": True, "elevator": True},
        "images": [
            "https://images.unsplash.com/photo-1512918766671-ad651939634b?w=1200",
            "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=1200"
        ]
    },
    {
        "title": "Rustic Farmhouse Cottage - Naivasha",
        "description": "Charming colonial-style farmhouse located near Lake Naivasha. Perfect for weekend getaways with fresh air and roaming wildlife.",
        "type": PropertyType.HOUSE,
        "purpose": PropertyPurpose.STAY,
        "price": 12500,
        "location": "Naivasha, Rift Valley",
        "address": "Moi South Lake Rd, Naivasha, Kenya",
        "bedrooms": 3,
        "bathrooms": 2,
        "area_sqft": 2400,
        "features": {"garden": True, "fireplace": True, "wildlife": True, "kitchen": True, "parking": True},
        "images": [
            "https://images.unsplash.com/photo-1500315331616-db4f707c24d1?w=1200",
            "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=1200"
        ]
    }
]

async def try_inject(url):
    print(f"Trying URL: {url.split('@')[0]}@...")
    try:
        engine = create_async_engine(url)
        async_session = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)
        
        async with async_session() as session:
            # Get admin user
            stmt = select(User).where(User.role.in_(["admin", "super_admin"])).limit(1)
            result = await session.execute(stmt)
            admin = result.scalar_one_or_none()
            
            if not admin:
                print("No admin user found. Creating one...")
                admin = User(
                    id=uuid.uuid4(),
                    email="admin@guri24.com",
                    name="Admin",
                    password_hash="dev-hash",
                    role="super_admin",
                    status="active"
                )
                session.add(admin)
                await session.flush()

            for s in sample_stays:
                slug = "-".join(s["title"].lower().split())
                
                # Check if exists
                stmt = select(Property).where(Property.slug == slug)
                result = await session.execute(stmt)
                if result.scalar_one_or_none():
                    print(f"Skipping: {s['title']} (exists)")
                    continue

                new_prop = Property(
                    id=uuid.uuid4(),
                    title=s["title"],
                    slug=slug,
                    description=s["description"],
                    type=s["type"],
                    purpose=s["purpose"],
                    price=s["price"],
                    location=s["location"],
                    address=s["address"],
                    bedrooms=s["bedrooms"],
                    bathrooms=s["bathrooms"],
                    area_sqft=s["area_sqft"],
                    features=s["features"],
                    images=s["images"],
                    status=PropertyStatus.PUBLISHED,
                    agent_id=admin.id,
                    created_at=datetime.utcnow(),
                    updated_at=datetime.utcnow(),
                    published_at=datetime.utcnow()
                )
                session.add(new_prop)
                print(f"Added: {s['title']}")
            
            await session.commit()
            print("Successfully added all sample stays.")
            return True
    except Exception as e:
        print(f"Failed: {e}")
        return False
    finally:
        await engine.dispose()

async def main():
    if not await try_inject(DATABASE_URL):
        for url in FALLBACK_URLS:
            if await try_inject(url):
                break

if __name__ == "__main__":
    asyncio.run(main())
