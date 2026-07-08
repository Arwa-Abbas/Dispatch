from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from app.core.config import settings
from app.database.session import create_db_and_tables
from app.api import auth_routes, user_routes, shipment_routes, driver_routes, notification_routes, event_routes

@asynccontextmanager
async def lifespan(app: FastAPI):
    create_db_and_tables()
    yield

app = FastAPI(
    title=settings.PROJECT_NAME,
    version="1.0.0",
    lifespan=lifespan
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth_routes.router, prefix=f"{settings.API_V1_STR}")
app.include_router(user_routes.router, prefix=f"{settings.API_V1_STR}")
app.include_router(shipment_routes.router, prefix=f"{settings.API_V1_STR}")
app.include_router(driver_routes.router, prefix=f"{settings.API_V1_STR}")
app.include_router(notification_routes.router, prefix=f"{settings.API_V1_STR}")
app.include_router(event_routes.router, prefix=f"{settings.API_V1_STR}")  # Add this

@app.get("/")
async def root():
    return {
        "message": f"Welcome to {settings.PROJECT_NAME}",
        "docs": "/docs",
        "redoc": "/redoc"
    }

@app.get("/health")
async def health_check():
    return {"status": "healthy"}