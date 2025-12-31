import asyncio
from sqlalchemy.ext.asyncio import create_async_engine
from sqlalchemy import text
import sys
from pathlib import Path

# Add app to path
sys.path.append(str(Path(__file__).resolve().parent))

async def check_new_db():
    url = "postgresql+asyncpg://admin:12345678@35.192.97.98:5432/guri24"
    print(f"Checking connection to {url}...")
    try:
        engine = create_async_engine(url)
        async with engine.connect() as conn:
            # Check basic connection
            res = await conn.execute(text("SELECT 1"))
            print("Connection successful!")
            
            # Check for tables
            res = await conn.execute(text("SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'"))
            tables = [row[0] for row in res.fetchall()]
            print(f"Tables found: {', '.join(tables)}")
            
            if 'users' in tables:
                res = await conn.execute(text("SELECT count(*) FROM users"))
                print(f"User count: {res.scalar()}")
                
    except Exception as e:
        print(f"Failed to connect: {e}")
    finally:
        await engine.dispose()

if __name__ == "__main__":
    asyncio.run(check_new_db())
