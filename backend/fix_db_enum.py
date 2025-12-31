import asyncio
from sqlalchemy import text
from app.database import engine

async def fix_enum():
    print(f"Connecting to database via app.database engine...")
    async with engine.connect() as conn:
        await conn.execution_options(isolation_level="AUTOCOMMIT")
        for val in ['stay', 'STAY']:
            try:
                # Add value to enum
                await conn.execute(text(f"ALTER TYPE propertypurpose ADD VALUE IF NOT EXISTS '{val}'"))
                print(f"Successfully ensured '{val}' in propertypurpose enum.")
            except Exception as e:
                print(f"Adding '{val}' failed (might exist): {e}")

        for val in ['published', 'PUBLISHED', 'draft', 'DRAFT', 'archived', 'ARCHIVED']:
            try:
                # Also check propertystatus just in case
                await conn.execute(text(f"ALTER TYPE propertystatus ADD VALUE IF NOT EXISTS '{val}'"))
                print(f"Successfully ensured '{val}' in propertystatus enum.")
            except Exception as e:
                 print(f"Adding status '{val}' failed (might exist): {e}")

if __name__ == "__main__":
    asyncio.run(fix_enum())
