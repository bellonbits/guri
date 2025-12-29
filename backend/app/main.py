from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware
from app.config import settings
from app.api.v1 import auth, properties, users, inquiries, analytics, admin
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Create FastAPI app
app = FastAPI(
    title=settings.APP_NAME,
    description="Premium Real Estate Platform API",
    version=settings.API_VERSION,
    docs_url="/api/docs" if settings.DEBUG else None,
    redoc_url="/api/redoc" if settings.DEBUG else None,
)

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "PATCH"],
    allow_headers=["*"],
    expose_headers=["X-Total-Count"],
)

# Trusted Host Middleware (security)
if not settings.DEBUG:
    app.add_middleware(
        TrustedHostMiddleware,
        allowed_hosts=settings.ALLOWED_HOSTS.split(",")
    )

# Include routers
app.include_router(auth.router, prefix=f"/api/{settings.API_VERSION}")
app.include_router(properties.router, prefix=f"/api/{settings.API_VERSION}")
app.include_router(users.router, prefix=f"/api/{settings.API_VERSION}")
app.include_router(inquiries.router, prefix=f"/api/{settings.API_VERSION}")
app.include_router(analytics.router, prefix=f"/api/{settings.API_VERSION}")
app.include_router(admin.router, prefix=f"/api/{settings.API_VERSION}")

@app.get("/")
async def root():
    """Root endpoint"""
    return {
        "name": settings.APP_NAME,
        "version": settings.API_VERSION,
        "status": "online"
    }

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "app": settings.APP_NAME,
        "environment": settings.APP_ENV
    }

@app.on_event("startup")
async def startup_event():
    """Run on application startup"""
    logger.info(f"Starting {settings.APP_NAME} API")
    logger.info(f"Environment: {settings.APP_ENV}")
    logger.info(f"Debug mode: {settings.DEBUG}")
    
    # Create tables if they don't exist
    from app.database import engine, Base
    # Ensure models are imported so they are registered with Base
    from app.models.user import User
    from app.models.property import Property
    
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    logger.info("Database tables verified/created")

@app.on_event("shutdown")
async def shutdown_event():
    """Run on application shutdown"""
    logger.info(f"Shutting down {settings.APP_NAME} API")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=8000,
        reload=settings.DEBUG
    )
