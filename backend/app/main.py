from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from app.core.config import settings
from app.database.session import create_db_and_tables
from app.agno.agent import DeliveryAgent
from app.api import auth_routes, user_routes, shipment_routes, driver_routes, notification_routes, event_routes, chat_routes

delivery_agent = DeliveryAgent()

@asynccontextmanager
async def lifespan(app: FastAPI):
    create_db_and_tables()
    await delivery_agent.init_agent()
    app.state.delivery_agent = delivery_agent
    yield
    await delivery_agent.close()

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
app.include_router(event_routes.router, prefix=f"{settings.API_V1_STR}")
app.include_router(chat_routes.router, prefix=f"{settings.API_V1_STR}")  # Added chat routes

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