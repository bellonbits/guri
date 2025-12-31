import asyncio
from app.database import engine
from sqlalchemy import text
from app.models.property import PropertyPurpose, Property

async def main():
    print("Checking Python Enum...")
    print(f"PropertyPurpose values: {[e.value for e in PropertyPurpose]}")
    
    async with engine.connect() as conn:
        print("\nChecking DB Enum Type...")
        try:
            result = await conn.execute(text("SELECT enum_range(NULL::propertypurpose)"))
            print(f"DB Enum Values: {result.scalar()}")
        except Exception as e:
            print(f"Error checking enum: {e}")
            
        print("\nChecking Properties in DB...")
        try:
            result = await conn.execute(text("SELECT count(*) FROM properties WHERE purpose = 'stay'"))
            print(f"Properties with purpose='stay': {result.scalar()}")
            
            result = await conn.execute(text("SELECT count(*) FROM properties"))
            print(f"Total properties: {result.scalar()}")
            
            result = await conn.execute(text("SELECT DISTINCT purpose FROM properties"))
            print(f"Distinct purposes in DB: {[r[0] for r in result.fetchall()]}")
        except Exception as e:
            print(f"Error checking properties: {e}")

if __name__ == "__main__":
    asyncio.run(main())
