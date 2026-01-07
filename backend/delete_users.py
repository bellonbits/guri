import asyncio
import logging
from sqlalchemy import delete
from app.database import AsyncSessionLocal
from app.models.user import User
from app.models.property import Property

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

async def delete_users():
    async with AsyncSessionLocal() as db:
        try:
            # Delete properties first to avoid FK violations (since Users are agents)
            logger.info("Deleting all properties...")
            await db.execute(delete(Property))
            
            logger.info("Deleting all users...")
            await db.execute(delete(User))
            
            await db.commit()
            logger.info("Successfully deleted all users and properties.")
        except Exception as e:
            logger.error(f"Error deleting users: {e}")
            await db.rollback()
        finally:
            await db.close()

if __name__ == "__main__":
    loop = asyncio.get_event_loop()
    loop.run_until_complete(delete_users())
