import asyncio
import uuid
import sys
import os

# Add current directory to path to allow imports
sys.path.append(os.getcwd())

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.database import engine
from app.models.property import Property, PropertyType, PropertyPurpose, PropertyStatus
from app.models.user import User, UserRole, UserStatus
from app.core.security import get_password_hash
from datetime import datetime

# Sample Stays Data
sample_stays = [
    {
        "title": "Oceanfront Infinity Villa - Malindi",
        "slug": "oceanfront-infinity-villa-malindi",
        "description": "Experience peak luxury in this stunning oceanfront villa. Features an infinity pool, private beach access, and 24/7 butler service. Perfect for high-end retreats.",
        "type": PropertyType.VILLA,
        "purpose": PropertyPurpose.STAY,
        "price": 45000,
        "currency": "KSh",
        "price_unit": "per night",
        "location": "Malindi, Coastal",
        "address": "Casuarina Road, Malindi, Kenya",
        "bedrooms": 5,
        "bathrooms": 6,
        "area_sqft": 4500,
        "features": {"pool": True, "beach_access": True, "wifi": True, "chef": True, "ac": True},
        "images": ["https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=1200", "https://images.unsplash.com/photo-1576013551627-0cc20b96c2a7?w=1200"],
        "status": PropertyStatus.PUBLISHED
    },
    {
        "title": "Modern Boho Loft in Kilimani",
        "slug": "modern-boho-loft-kilimani",
        "description": "A stylish, plant-filled loft in the heart of Kilimani. High ceilings, industrial windows, and a dedicated workspace. Ideal for digital nomads.",
        "type": PropertyType.APARTMENT,
        "purpose": PropertyPurpose.STAY,
        "price": 8500,
        "currency": "KSh",
        "price_unit": "per night",
        "location": "Kilimani, Nairobi",
        "address": "Argwings Kodhek Rd, Nairobi, Kenya",
        "bedrooms": 1,
        "bathrooms": 1,
        "area_sqft": 950,
        "features": {"wifi": True, "workspace": True, "gym": True, "balcony": True},
        "images": ["https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=1200", "https://images.unsplash.com/photo-1484154218962-a197022b5858?w=1200"],
        "status": PropertyStatus.PUBLISHED
    },
    {
        "title": "Glass Treehouse - Karen Forest",
        "slug": "glass-treehouse-karen-forest",
        "description": "Sleep among the trees in this architectural masterpiece. Floor-to-ceiling glass walls offer breathtaking views of the forest.",
        "type": PropertyType.HOUSE,
        "purpose": PropertyPurpose.STAY,
        "price": 22000,
        "currency": "KSh",
        "price_unit": "per night",
        "location": "Karen, Nairobi",
        "address": "Mbagathi Ridge, Nairobi, Kenya",
        "bedrooms": 2,
        "bathrooms": 2,
        "area_sqft": 1800,
        "features": {"forest_view": True, "fireplace": True, "wifi": True, "deck": True},
        "images": ["https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=1200", "https://images.unsplash.com/photo-1449156001533-cb39c85244f0?w=1200"],
        "status": PropertyStatus.PUBLISHED
    },
    {
        "title": "Skyline Minimalist Penthouse",
        "slug": "skyline-minimalist-penthouse",
        "description": "Sleek penthouse with rooftop lounge and 360-degree views of the Nairobi skyline on the 24th floor.",
        "type": PropertyType.APARTMENT,
        "purpose": PropertyPurpose.STAY,
        "price": 15000,
        "currency": "KSh",
        "price_unit": "per night",
        "location": "Westlands, Nairobi",
        "address": "Gochi St, Westlands, Kenya",
        "bedrooms": 2,
        "bathrooms": 2,
        "area_sqft": 1600,
        "features": {"rooftop": True, "wifi": True, "security": True, "pool": True},
        "images": ["https://images.unsplash.com/photo-1512918766671-ad651939634b?w=1200", "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=1200"],
        "status": PropertyStatus.PUBLISHED
    },
    {
        "title": "Rustic Farmhouse Cottage - Naivasha",
        "slug": "rustic-farmhouse-cottage-naivasha",
        "description": "Charming colonial-style farmhouse near Lake Naivasha. Perfect for weekend getaways with fresh air and roaming wildlife.",
        "type": PropertyType.HOUSE,
        "purpose": PropertyPurpose.STAY,
        "price": 12500,
        "currency": "KSh",
        "price_unit": "per night",
        "location": "Naivasha, Rift Valley",
        "address": "Moi South Lake Rd, Naivasha, Kenya",
        "bedrooms": 3,
        "bathrooms": 2,
        "area_sqft": 2400,
        "features": {"garden": True, "fireplace": True, "wildlife": True, "kitchen": True},
        "images": ["https://images.unsplash.com/photo-1500315331616-db4f707c24d1?w=1200", "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=1200"],
        "status": PropertyStatus.PUBLISHED
    }
]

from sqlalchemy.ext.asyncio import create_async_engine

# Last resort guess: postgres / admin
DB_URL = "postgresql+asyncpg://postgres:admin@localhost:5432/guri24_db"
engine = create_async_engine(DB_URL)

async def inject():
    async with AsyncSession(engine) as session:
        print("Starting injection of Stays...")
        
        # 1. Get Agent
        result = await session.execute(select(User).where(User.email == "support@guri24.com"))
        agent = result.scalar_one_or_none()
        
        if not agent:
            print("Creating agent user...")
            agent = User(
                id=uuid.uuid4(),
                email="support@guri24.com",
                name="Guri24 Team",
                role=UserRole.AGENT,
                password_hash=get_password_hash("agent123"),
                status=UserStatus.ACTIVE,
                is_verified=True
            )
            session.add(agent)
            await session.commit()
            print("Agent created.")
        
        # 2. Inject Properties
        count = 0
        for prop_data in sample_stays:
            stmt = select(Property).where(Property.slug == prop_data["slug"])
            result = await session.execute(stmt)
            existing = result.scalar_one_or_none()
            
            if not existing:
                print(f"Injecting: {prop_data['title']}")
                prop = Property(
                    id=uuid.uuid4(),
                    agent_id=agent.id,
                    created_at=datetime.utcnow(),
                    updated_at=datetime.utcnow(),
                    published_at=datetime.utcnow(),
                    **prop_data
                )
                session.add(prop)
                count += 1
            else:
                print(f"Skipping existing: {prop_data['title']}")
        
        await session.commit()
        print(f"Injection complete! Added {count} new stays.")

if __name__ == "__main__":
    from dotenv import load_dotenv
    load_dotenv()
    asyncio.run(inject())
