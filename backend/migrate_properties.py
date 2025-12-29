"""
Property Data Migration Script
Migrates property data from properties.js to PostgreSQL database
"""
import asyncio
import sys
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
from sqlalchemy import select
import uuid
from datetime import datetime

# Add parent directory to path
sys.path.append('/mnt/c/Users/learn/Desktop/guri/backend')

from app.models.property import Property, PropertyType, PropertyPurpose, PropertyStatus
from app.models.user import User

# Database connection
DATABASE_URL = "postgresql+asyncpg://admin:12345678@localhost:5432/guri24"

# Property data from properties.js
properties_data = [
    {
        "slug": "3-bed-apartment-upper-hill",
        "title": "3 Bed Apartment in Upper Hill",
        "description": "Modern 3-bedroom apartment with spacious living room, balcony, and access to a shared swimming pool. Located in a serene environment near Yaya Centre.",
        "type": "apartment",
        "purpose": "rent",
        "price": 2000000,
        "location": "Upper Hill, Nairobi",
        "address": "Upper Hill, Nairobi, Kenya",
        "latitude": -1.2991,
        "longitude": 36.8157,
        "bedrooms": 3,
        "bathrooms": 2,
        "area_sqft": 1800,
        "features": {
            "pool": True,
            "balcony": True,
            "security": True,
            "parking": True,
            "gym": True
        },
        "images": [
            "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800",
            "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800"
        ],
        "status": "published"
    },
    {
        "slug": "4-bedroom-maisonette-runda",
        "title": "2 – 4 Bedroom Maisonette in Runda",
        "description": "Elegant 4-bedroom maisonette with DSQ, lush garden, ample parking, and tight security. Ideal for family living in one of Nairobi's most prestigious neighborhoods.",
        "type": "house",
        "purpose": "rent",
        "price": 2000000,
        "location": "Runda, Nairobi",
        "address": "Runda, Nairobi, Kenya",
        "latitude": -1.2185,
        "longitude": 36.8198,
        "bedrooms": 4,
        "bathrooms": 3,
        "area_sqft": 3500,
        "features": {
            "garden": True,
            "parking": True,
            "security": True,
            "furnished": False
        },
        "images": [
            "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800",
            "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800"
        ],
        "status": "published"
    },
    {
        "slug": "office-space-westlands",
        "title": "Office Space in Westlands",
        "description": "Spacious open-plan office space in a prime commercial building, suitable for startups or established businesses. High-speed internet ready.",
        "type": "commercial",
        "purpose": "rent",
        "price": 150000,
        "location": "Westlands, Nairobi",
        "address": "Westlands, Nairobi, Kenya",
        "latitude": -1.2685,
        "longitude": 36.8066,
        "bedrooms": 0,
        "bathrooms": 2,
        "area_sqft": 2000,
        "features": {
            "internet": True,
            "parking": True,
            "security": True
        },
        "images": [
            "https://images.unsplash.com/photo-1497366216548-37526070297c?w=800",
            "https://images.unsplash.com/photo-1497366811353-6870744d04b2?w=800"
        ],
        "status": "published"
    },
    {
        "slug": "modern-3-bedroom-villa",
        "title": "Modern 3-Bedroom Villa",
        "description": "Beautiful, fully furnished villa located near the coastline. Features include 3 spacious bedrooms, 2 bathrooms, modern kitchen, and stunning ocean views.",
        "type": "villa",
        "purpose": "rent",
        "price": 1200,
        "location": "Coastal, Djibouti City",
        "address": "Coastal Area, Djibouti City, Djibouti",
        "latitude": 11.5890,
        "longitude": 43.1456,
        "bedrooms": 3,
        "bathrooms": 2,
        "area_sqft": 2200,
        "features": {
            "furnished": True,
            "garden": True,
            "parking": True
        },
        "images": [
            "https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=800",
            "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800"
        ],
        "status": "published"
    },
    {
        "slug": "3-bedroom-apartment-kilimani",
        "title": "3-Bedroom Apartment – Kilimani",
        "description": "Spacious 3-bedroom apartment with modern finishes, open-plan kitchen, and a private balcony. Located in a secure compound with amenities.",
        "type": "apartment",
        "purpose": "sale",
        "price": 14500000,
        "location": "Kilimani, Nairobi",
        "address": "Kilimani, Nairobi, Kenya",
        "latitude": -1.2884,
        "longitude": 36.7869,
        "bedrooms": 3,
        "bathrooms": 2,
        "area_sqft": 1950,
        "features": {
            "balcony": True,
            "gym": True,
            "pool": True,
            "parking": True
        },
        "images": [
            "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800",
            "https://images.unsplash.com/photo-1560185893-a55cbc8c57e8?w=800"
        ],
        "status": "published"
    },
    {
        "slug": "2-bedroom-apartment-westlands",
        "title": "2-Bedroom Apartment – Westlands",
        "description": "Contemporary apartment offering high-end living with an equipped gym, swimming pool, and 24-hour security. Ideal for young professionals.",
        "type": "apartment",
        "purpose": "sale",
        "price": 8500000,
        "location": "Westlands, Nairobi",
        "address": "Westlands, Nairobi, Kenya",
        "latitude": -1.2635,
        "longitude": 36.8023,
        "bedrooms": 2,
        "bathrooms": 2,
        "area_sqft": 1200,
        "features": {
            "gym": True,
            "pool": True,
            "security": True,
            "parking": True,
            "elevator": True
        },
        "images": [
            "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800",
            "https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=800"
        ],
        "status": "published"
    },
    {
        "slug": "4-bedroom-maisonette-syokimau",
        "title": "Family 4-Bedroom Maisonette – Syokimau",
        "description": "A spacious family home featuring ensuite bedrooms, fitted wardrobes, and a large backyard. Close to SGR station and main highways.",
        "type": "house",
        "purpose": "sale",
        "price": 11000000,
        "location": "Syokimau, Nairobi",
        "address": "Syokimau, Nairobi, Kenya",
        "latitude": -1.3524,
        "longitude": 36.9365,
        "bedrooms": 4,
        "bathrooms": 3,
        "area_sqft": 2800,
        "features": {
            "garden": True,
            "parking": True
        },
        "images": [
            "https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?w=800",
            "https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?w=800"
        ],
        "status": "published"
    }
]


async def migrate_properties():
    """Migrate all properties to database"""
    
    # Create async engine
    engine = create_async_engine(DATABASE_URL, echo=True)
    async_session = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)
    
    async with async_session() as session:
        try:
            # Get the first admin user to assign as agent
            stmt = select(User).where(User.role.in_(["admin", "super_admin"])).limit(1)
            result = await session.execute(stmt)
            admin_user = result.scalar_one_or_none()
            
            if not admin_user:
                print("❌ No admin user found! Please create an admin user first.")
                return
            
            print(f"✅ Using admin user: {admin_user.email} (ID: {admin_user.id})")
            
            # Insert each property
            for prop_data in properties_data:
                # Check if property already exists
                stmt = select(Property).where(Property.slug == prop_data["slug"])
                result = await session.execute(stmt)
                existing = result.scalar_one_or_none()
                
                if existing:
                    print(f"⏭️  Skipping '{prop_data['title']}' - already exists")
                    continue
                
                # Create new property
                new_property = Property(
                    id=uuid.uuid4(),
                    slug=prop_data["slug"],
                    title=prop_data["title"],
                    description=prop_data["description"],
                    type=PropertyType(prop_data["type"]),
                    purpose=PropertyPurpose(prop_data["purpose"]),
                    price=prop_data["price"],
                    location=prop_data["location"],
                    address=prop_data.get("address"),
                    latitude=prop_data.get("latitude"),
                    longitude=prop_data.get("longitude"),
                    bedrooms=prop_data.get("bedrooms", 0),
                    bathrooms=prop_data.get("bathrooms", 0),
                    area_sqft=prop_data.get("area_sqft"),
                    features=prop_data.get("features", {}),
                    images=prop_data.get("images", []),
                    status=PropertyStatus(prop_data.get("status", "published")),
                    views=0,
                    agent_id=admin_user.id,
                    created_at=datetime.utcnow(),
                    updated_at=datetime.utcnow(),
                    published_at=datetime.utcnow() if prop_data.get("status") == "published" else None
                )
                
                session.add(new_property)
                print(f"✅ Added: {prop_data['title']}")
            
            # Commit all changes
            await session.commit()
            print("\n🎉 Migration completed successfully!")
            print(f"📊 Total properties migrated: {len(properties_data)}")
            
        except Exception as e:
            await session.rollback()
            print(f"\n❌ Migration failed: {str(e)}")
            raise
        finally:
            await engine.dispose()


if __name__ == "__main__":
    print("🚀 Starting property data migration...")
    print("=" * 60)
    asyncio.run(migrate_properties())
