import asyncio
import uuid
from datetime import datetime
from typing import List
from sqlalchemy import select, delete
from app.database import AsyncSessionLocal
from app.models.user import User, UserRole, UserStatus
from app.models.property import Property, PropertyType, PropertyPurpose, PropertyStatus
from app.core.security import get_password_hash

# Realistic image URLs
IMAGES = {
    'apartment': [
        "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1000&q=80",
        "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1000&q=80",
        "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1000&q=80"
    ],
    'house': [
        "https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&w=1000&q=80",
        "https://images.unsplash.com/photo-1568605114967-8130f3a36994?auto=format&fit=crop&w=1000&q=80",
        "https://images.unsplash.com/photo-1600596542815-22b5df28e802?auto=format&fit=crop&w=1000&q=80"
    ],
    'villa': [
        "https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&w=1000&q=80",
        "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1000&q=80",
        "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1000&q=80"
    ],
    'office': [
        "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1000&q=80",
        "https://images.unsplash.com/photo-1497366811353-6870744d04b2?auto=format&fit=crop&w=1000&q=80"
    ],
    'land': [
        "https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1000&q=80"
    ]
}

SAMPLE_PROPERTIES = [
    # --- SALE ---
    {
        "title": "Modern 3BR Apartment in Kileleshwa",
        "description": "Stunning 3 bedroom apartment with master ensuite. Features include a spacious lounge, modern open plan kitchen, and high-speed lifts. Amenities include a gym, swimming pool, and backup generator.",
        "type": PropertyType.APARTMENT,
        "purpose": PropertyPurpose.SALE,
        "price": 18500000,
        "location": "Kileleshwa, Nairobi",
        "bedrooms": 3,
        "bathrooms": 2,
        "area_sqft": 1800,
        "features": {"gym": True, "pool": True, "parking": True, "security": True, "wifi": True},
        "images": IMAGES['apartment'][:3]
    },
    {
        "title": "Luxury 5BR Villa in Karen",
        "description": "Exquisite 5 bedroom villa on 0.5 acres in the heart of Karen. Features a sunken lounge, family room, office, and DSQ. Lush manicured garden with mature trees.",
        "type": PropertyType.VILLA,
        "purpose": PropertyPurpose.SALE,
        "price": 85000000,
        "location": "Karen, Nairobi",
        "bedrooms": 5,
        "bathrooms": 5,
        "area_sqft": 4500,
        "features": {"garden": True, "security": True, "parking": True, "fireplace": True, "pet_friendly": True},
        "images": IMAGES['villa'][:3]
    },
    {
        "title": "Prime 1/8 Acre Plot in Juja",
        "description": "Ready to build commercial plot located 2km from Thika Superhighway. Ideal for apartments or mixed-use development. Water and electricity on site.",
        "type": PropertyType.LAND,
        "purpose": PropertyPurpose.SALE,
        "price": 2500000,
        "location": "Juja, Kiambu",
        "bedrooms": 0,
        "bathrooms": 0,
        "area_sqft": 5445,
        "features": {"water": True, "electricity": True, "road_access": True},
         "images": IMAGES['land']
    },
     {
        "title": "Cozy 4BR Townhouse in Lavington",
        "description": "Elegant townhouse in a gated community of 8 units. All bedrooms ensuite. Features a private garden and rooftop terrace.",
        "type": PropertyType.HOUSE,
        "purpose": PropertyPurpose.SALE,
        "price": 55000000,
        "location": "Lavington, Nairobi",
        "bedrooms": 4,
        "bathrooms": 4,
        "area_sqft": 3200,
        "features": {"garden": True, "security": True, "parking": True, "balcony": True},
        "images": IMAGES['house'][:2]
    },
    {
        "title": "Executive Office Suite in Upper Hill",
        "description": "2000 sqft furnished office space with panoramic views of Nairobi. Partitioned with boardroom and kitchenette.",
        "type": PropertyType.COMMERCIAL,
        "purpose": PropertyPurpose.SALE,
        "price": 30000000,
        "location": "Upper Hill, Nairobi",
        "bedrooms": 0,
        "bathrooms": 2,
        "area_sqft": 2000,
        "features": {"ac": True, "elevator": True, "parking": True, "security": True},
        "images": IMAGES['office']
    },

    # --- RENT ---
    {
        "title": "2BR Furnished Apartment in Westlands",
        "description": "Tastefully furnished apartment near Sarit Centre. Includes housekeeping, internet, and cable TV.",
        "type": PropertyType.APARTMENT,
        "purpose": PropertyPurpose.RENT,
        "price": 120000,
        "location": "Westlands, Nairobi",
        "bedrooms": 2,
        "bathrooms": 2,
        "area_sqft": 1200,
        "features": {"furnished": True, "wifi": True, "gym": True, "pool": True},
        "images": [IMAGES['apartment'][1], IMAGES['apartment'][2]]
    },
    {
        "title": "Spacious 4BR House in Runda",
        "description": "Ambassadorial 4 bedroom house with guest wing. Sitting on 1 acre with extensive gardens.",
        "type": PropertyType.HOUSE,
        "purpose": PropertyPurpose.RENT,
        "price": 350000,
        "location": "Runda, Nairobi",
        "bedrooms": 4,
        "bathrooms": 4,
        "area_sqft": 5000,
        "features": {"garden": True, "fireplace": True, "security": True, "parking": True},
         "images": [IMAGES['house'][0], IMAGES['house'][1]]
    },
     {
        "title": "Commercial Space in CBD",
        "description": "Prime ground floor detail space on Moi Avenue. High foot traffic area.",
        "type": PropertyType.COMMERCIAL,
        "purpose": PropertyPurpose.RENT,
        "price": 80000,
        "location": "CBD, Nairobi",
        "bedrooms": 0,
        "bathrooms": 1,
        "area_sqft": 800,
        "features": {"cctv": True, "water": True, "electricity": True},
        "images": [IMAGES['office'][0]]
    },
    {
        "title": "3BR Apartment in Kilimani",
        "description": "Modern apartment with large balcony. Close to Yaya Centre. Inclusive of service charge.",
        "type": PropertyType.APARTMENT,
        "purpose": PropertyPurpose.RENT,
        "price": 95000,
        "location": "Kilimani, Nairobi",
        "bedrooms": 3,
        "bathrooms": 2,
        "area_sqft": 1600,
        "features": {"elevator": True, "parking": True, "security": True},
        "images": [IMAGES['apartment'][2], IMAGES['apartment'][0]]

    },
    {
        "title": "Garden Cottage in Gigiri",
        "description": "Charming 1 bedroom cottage in a secure compound. Ideal for UN staff.",
        "type": PropertyType.HOUSE,
        "purpose": PropertyPurpose.RENT,
        "price": 70000,
        "location": "Gigiri, Nairobi",
        "bedrooms": 1,
        "bathrooms": 1,
        "area_sqft": 600,
        "features": {"garden": True, "quiet": True, "parking": True},
        "images": [IMAGES['house'][2]]
    },

    # --- STAY (Short Term) ---
    {
        "title": "Beachfront Villa in Diani",
        "description": "Luxury villa with direct beach access. Private pool and chef available. Perfect for family vacations.",
        "type": PropertyType.VILLA,
        "purpose": PropertyPurpose.STAY,
        "price": 25000,
        "location": "Diani Beach, Kwale",
        "bedrooms": 4,
        "bathrooms": 4,
        "area_sqft": 3500,
        "features": {"beachfront": True, "pool": True, "wifi": True, "ac": True},
       "images": [IMAGES['villa'][0], IMAGES['villa'][1]]
    },
    {
        "title": "Safari Lodge near Maasai Mara",
        "description": "Experience the wild in comfort. Tented camp with ensuite bathrooms and viewing deck.",
        "type": PropertyType.VILLA,
        "purpose": PropertyPurpose.STAY,
        "price": 15000,
        "location": "Maasai Mara, Narok",
        "bedrooms": 1,
        "bathrooms": 1,
        "area_sqft": 400,
        "features": {"view": True, "meals": True, "guide": True},
         "images": [IMAGES['house'][1]]
    },
    {
        "title": "Naivasha Lakeview Cottage",
        "description": "Peaceful retreat overlooking Lake Naivasha. Great for bird watching and relaxing.",
        "type": PropertyType.HOUSE,
        "purpose": PropertyPurpose.STAY,
        "price": 12000,
        "location": "Naivasha, Nakuru",
        "bedrooms": 2,
        "bathrooms": 2,
        "area_sqft": 1000,
        "features": {"lakeview": True, "garden": True, "parking": True},
        "images": [IMAGES['house'][2]]
    },
    {
        "title": "City Center Studio for Travelers",
        "description": "Convenient studio apartment in the heart of Nairobi. Walking distance to KICC and museums.",
        "type": PropertyType.APARTMENT,
        "purpose": PropertyPurpose.STAY,
        "price": 4500,
        "location": "CBD, Nairobi",
        "bedrooms": 1,
        "bathrooms": 1,
        "area_sqft": 300,
        "features": {"wifi": True, "central": True, "elevator": True},
        "images": [IMAGES['apartment'][0]]
    },
    {
        "title": "Mount Kenya Log Cabin",
        "description": "Rustic log cabin in Nanyuki. Enjoy cool mountain breeze and views of the peaks.",
        "type": PropertyType.HOUSE,
        "purpose": PropertyPurpose.STAY,
        "price": 18000,
        "location": "Nanyuki, Laikipia",
        "bedrooms": 3,
        "bathrooms": 2,
        "area_sqft": 1500,
        "features": {"fireplace": True, "mountain_view": True, "hiking": True},
        "images": [IMAGES['house'][0]]
    }
]

async def seed():
    print("Starting database seed...")
    async with AsyncSessionLocal() as session:
        # 1. Get or Create Agent User
        print("Ensuring agent user exists...")
        result = await session.execute(select(User).where(User.email == "agent@guri24.com"))
        agent = result.scalar_one_or_none()

        if not agent:
            agent = User(
                email="agent@guri24.com",
                password_hash=get_password_hash("agent123"),
                name="Guri Agent",
                phone="+254700000000",
                role=UserRole.AGENT,
                status=UserStatus.ACTIVE,
                email_verified=True
            )
            session.add(agent)
            await session.commit()
            await session.refresh(agent)
            print(f"Created agent user: {agent.id}")
        else:
            print(f"Found existing agent user: {agent.id}")

        # 2. Clear existing properties
        print("Clearing existing properties...")
        await session.execute(delete(Property))
        await session.commit()

        # 3. Create properties
        print("Creating 15 new properties...")
        count = 0
        for p_data in SAMPLE_PROPERTIES:
            # Generate a consistent slug
            base_slug = p_data['title'].lower().replace(' ', '-').replace('/', '-')
            slug = f"{base_slug}-{uuid.uuid4().hex[:6]}"

            property = Property(
                title=p_data['title'],
                slug=slug,
                description=p_data['description'],
                type=p_data['type'],
                purpose=p_data['purpose'],
                price=p_data['price'],
                location=p_data['location'],
                bedrooms=p_data['bedrooms'],
                bathrooms=p_data['bathrooms'],
                area_sqft=p_data['area_sqft'],
                features=p_data['features'],
                images=p_data['images'],
                agent_id=agent.id,
                status=PropertyStatus.PUBLISHED,
                views=0,
                published_at=datetime.utcnow()
            )
            session.add(property)
            count += 1
        
        await session.commit()
        print(f"Successfully seeded {count} properties!")

if __name__ == "__main__":
    asyncio.run(seed())
