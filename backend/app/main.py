# app/main.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from app.core.config import settings
from app.database.session import create_db_and_tables
from app.api import auth_routes, user_routes, shipment_routes


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup - Create tables
    create_db_and_tables()
    yield
    # Shutdown - Cleanup if needed

app = FastAPI(
    title=settings.PROJECT_NAME,
    version="1.0.0",
    lifespan=lifespan
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth_routes.router, prefix=f"{settings.API_V1_STR}")
app.include_router(user_routes.router, prefix=f"{settings.API_V1_STR}")
app.include_router(shipment_routes.router, prefix=f"{settings.API_V1_STR}")

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