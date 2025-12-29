import asyncio
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.database import engine
from app.models.user import User, UserRole, UserStatus
from app.core.security import get_password_hash
from dotenv import load_dotenv

load_dotenv()

async def create_admin():
    async with AsyncSession(engine) as session:
        print("Checking for existing admin...")
        email = "admin@guri24.com"
        
        stmt = select(User).where(User.email == email)
        result = await session.execute(stmt)
        user = result.scalar_one_or_none()
        
        if user:
            print(f"Admin user {email} already exists.")
            # Optional: update password if needed
            # user.password_hash = get_password_hash("admin123")
            # await session.commit()
            return

        print(f"Creating admin user {email}...")
        new_admin = User(
            email=email,
            name="Super Admin",
            password_hash=get_password_hash("admin123"),
            role=UserRole.SUPER_ADMIN, # Ensure this role exists in Enum
            status=UserStatus.ACTIVE,
            is_verified=True,
            phone="+254700000000"
        )
        
        session.add(new_admin)
        await session.commit()
        print("Admin user created successfully!")
        print(f"Email: {email}")
        print("Password: admin123")

if __name__ == "__main__":
    import sys
    try:
        if sys.platform == "win32":
            asyncio.set_event_loop_policy(asyncio.WindowsSelectorEventLoopPolicy())
        asyncio.run(create_admin())
    except Exception as e:
        print(f"Error creating admin: {e}")
        import traceback
        traceback.print_exc()
