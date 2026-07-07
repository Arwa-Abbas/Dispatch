from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from app.core.config import settings
from app.database.session import create_db_and_tables
from app.api import auth_routes, user_routes, shipment_routes, driver_routes

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

# CORS middleware - FIXED for DELETE and all methods
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://localhost:5174",
        "http://localhost:3000",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:5174",
        "http://127.0.0.1:3000",
    ],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
    allow_headers=[
        "Accept",
        "Accept-Encoding",
        "Authorization",
        "Content-Type",
        "Origin",
        "User-Agent",
        "X-Requested-With",
        "Access-Control-Allow-Origin",
        "Access-Control-Allow-Headers",
        "Access-Control-Allow-Methods",
    ],
    expose_headers=["Content-Length", "Content-Type"],
    max_age=86400,  # 24 hours
)

# Include routers
app.include_router(auth_routes.router, prefix=f"{settings.API_V1_STR}")
app.include_router(user_routes.router, prefix=f"{settings.API_V1_STR}")
app.include_router(shipment_routes.router, prefix=f"{settings.API_V1_STR}")
app.include_router(driver_routes.router, prefix=f"{settings.API_V1_STR}")

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