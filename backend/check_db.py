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
    databases = ["guri24", "guri24_db"]
    base_url_template = "postgresql+asyncpg://{user}:{password}@127.0.0.1:5432/{dbname}"
    
    for db in databases:
        print(f"Checking database: {db}")
        for user, password in credentials:
            url = base_url_template.format(user=user, password=password, dbname=db)
            print(f"Trying user={user} pass={password} db={db}...")
        try:
            engine = create_async_engine(url)
            async with engine.connect() as conn:
                await conn.execute(text("SELECT 1"))
            print(f"SUCCESS! Working credentials: {user} / {password} db={db}")
            with open("db_creds.txt", "w") as f:
                f.write(f"postgresql+asyncpg://{user}:{password}@127.0.0.1:5432/{db}")
            return
        except Exception as e:
            pass

if __name__ == "__main__":
    asyncio.run(check_creds())
