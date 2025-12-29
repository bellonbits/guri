import asyncio
import uuid
from sqlalchemy.ext.asyncio import AsyncSession
from app.database import engine, Base
from app.models.property import Property, PropertyType, PropertyPurpose, PropertyStatus
from app.models.user import User, UserRole, UserStatus
from app.core.security import get_password_hash

# Mock properties (adapted from src/data/properties.js)
mock_properties = [
  {
    "title": "3 Bed Apartment in Upper Hill",
    "slug": "3-bed-apartment-upper-hill",
    "description": "Modern 3-bedroom apartment with spacious living room, balcony, and access to a shared swimming pool. Located in a serene environment near Yaya Centre.",
    "type": PropertyType.APARTMENT,
    "purpose": PropertyPurpose.RENT,
    "price": 2000000,
    "currency": "KSh",
    "price_unit": "",
    "location": "Upper Hill, Nairobi, Kenya",
    "bedrooms": 3,
    "bathrooms": 2,
    "size": "1,800 sq ft",
    "features": ["Swimming Pool", "Balcony", "24/7 Security", "Parking", "Gym Access"],
    "images": [
      "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800",
      "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800"
    ],
    "status": PropertyStatus.PUBLISHED
  },
  {
    "title": "2 – 4 Bedroom Maisonette in Runda",
    "slug": "4-bedroom-maisonette-runda",
    "description": "Elegant 4-bedroom maisonette with DSQ, lush garden, ample parking, and tight security. Ideal for family living in one of Nairobi's most prestigious neighborhoods.",
    "type": PropertyType.HOUSE,
    "purpose": PropertyPurpose.RENT,
    "price": 2000000,
    "currency": "KSh",
    "price_unit": "",
    "location": "Runda, Nairobi, Kenya",
    "bedrooms": 4,
    "bathrooms": 3,
    "size": "3,500 sq ft",
    "features": ["DSQ", "Garden", "Parking", "24/7 Security", "Gated Community"],
    "images": [
      "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800",
      "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800"
    ],
    "status": PropertyStatus.PUBLISHED
  },
  {
    "title": "Office Space in Westlands",
    "slug": "office-space-westlands",
    "description": "Spacious open-plan office space in a prime commercial building, suitable for startups or established businesses. High-speed internet ready.",
    "type": PropertyType.OFFICE,
    "purpose": PropertyPurpose.RENT,
    "price": 150000,
    "currency": "KSh",
    "price_unit": "per month",
    "location": "Westlands, Nairobi, Kenya",
    "bedrooms": 0,
    "bathrooms": 2,
    "size": "2,000 sq ft",
    "features": ["Open Plan", "High-Speed Internet", "Meeting Rooms", "Parking", "24/7 Access"],
    "images": [
      "https://images.unsplash.com/photo-1497366216548-37526070297c?w=800",
      "https://images.unsplash.com/photo-1497366811353-6870744d04b2?w=800"
    ],
    "status": PropertyStatus.PUBLISHED
  },
  # Add more if needed, sticking to these 3 for basic testing first
]

async def seed():
    async with AsyncSession(engine) as session:
        print("Seeding database...")
        
        # 1. Ensure Agent Exists
        result = await session.execute(select(User).where(User.email == "support@guri24.com"))
        agent = result.scalar_one_or_none()
        
        if not agent:
            print("Creating agent user...")
            agent = User(
                email="support@guri24.com",
                name="Guri24 Team",
                role=UserRole.AGENT,
                password_hash=get_password_hash("agent123"),
                status=UserStatus.ACTIVE,
                is_verified=True
            )
            session.add(agent)
            await session.commit()
            await session.refresh(agent)
        
        # 2. Seed Properties
        for prop_data in mock_properties:
            # Check if exists by slug
            stmt = select(Property).where(Property.slug == prop_data["slug"])
            result = await session.execute(stmt)
            existing = result.scalar_one_or_none()
            
            if not existing:
                print(f"Creating property: {prop_data['title']}")
                prop = Property(**prop_data, agent_id=agent.id)
                session.add(prop)
            else:
                print(f"Property already exists: {prop_data['title']}")
        
        await session.commit()
        print("Seeding complete!")

if __name__ == "__main__":
    from dotenv import load_dotenv
    from sqlalchemy import select
    load_dotenv()
    asyncio.run(seed())
