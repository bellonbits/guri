import asyncio
import sys
from sqlalchemy.ext.asyncio import create_async_engine
from sqlalchemy import text

if sys.platform == "win32":
    asyncio.set_event_loop_policy(asyncio.WindowsSelectorEventLoopPolicy())

credentials = [
    ("admin", "admin"),
    ("postgres", "postgres"),
    ("postgres", "admin"),
    ("postgres", "password"),
    ("postgres", "123456"),
    ("postgres", ""),
]

async def check_creds():
    base_url = "postgresql+asyncpg://{user}:{password}@127.0.0.1:5432/guri24"
    
    for user, password in credentials:
        url = base_url.format(user=user, password=password)
        print(f"Trying user={user} pass={password}...")
        try:
            engine = create_async_engine(url)
            async with engine.connect() as conn:
                await conn.execute(text("SELECT 1"))
            print(f"SUCCESS! Working credentials: {user} / {password}")
            return
        except Exception as e:
            print(f"Failed: {e}")

if __name__ == "__main__":
    asyncio.run(check_creds())
