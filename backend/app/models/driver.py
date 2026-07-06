from sqlmodel import SQLModel, Field, Relationship
from typing import Optional
from enum import Enum

class DriverStatus(str, Enum):
    AVAILABLE = "AVAILABLE"
    BUSY = "BUSY"
    OFFLINE = "OFFLINE"

class Driver(SQLModel, table=True):
    __tablename__ = "drivers"
    
    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: int = Field(foreign_key="users.id", unique=True)
    phone: str = Field(max_length=20)
    license_number: str = Field(max_length=50, unique=True)
    vehicle_type: str = Field(max_length=50)
    vehicle_number: str = Field(max_length=50)
    status: DriverStatus = Field(default=DriverStatus.AVAILABLE)
    experience_years: int = Field(default=0)
    current_location: Optional[str] = Field(max_length=255)
    rating: float = Field(default=0.0)
    total_deliveries: int = Field(default=0)
    
    # Relationship
    user: Optional["User"] = Relationship(back_populates="driver_profile")