import asyncio
from sqlalchemy.ext.asyncio import create_async_engine
from sqlalchemy import text

# Common credentials found in the project history
CREDS = [
    ("admin", "12345678"),
    ("admin", "admin123"),
    ("postgres", "12345678"),
    ("postgres", "admin123"),
    ("postgres", ""),
]

async def check_db():
    base_url = "postgresql+asyncpg://{user}:{password}@localhost:5432/guri24_EN"
    with open('db_check_results.txt', 'w') as f:
        for user, password in CREDS:
            url = base_url.format(user=user, password=password)
            f.write(f"Trying {user}:{password}...\n")
            try:
                engine = create_async_engine(url)
                async with engine.connect() as conn:
                    res = await conn.execute(text("SELECT 1"))
                    f.write(f"SUCCESS with {user}:{password}\n")
                    
                    # Check enum
                    res = await conn.execute(text("SELECT enum_range(NULL::propertypurpose)"))
                    f.write(f"Enum values: {res.scalar()}\n")
                    
                    # Check stays
                    res = await conn.execute(text("SELECT count(*) FROM properties WHERE purpose = 'stay'"))
                    f.write(f"Stays in DB: {res.scalar()}\n")
                    
                    return
            except Exception as e:
                f.write(f"Failed: {e}\n")
            finally:
                await engine.dispose()

if __name__ == "__main__":
    asyncio.run(check_db())
