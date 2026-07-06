# app/schemas/user.py
from pydantic import BaseModel, EmailStr, Field
from datetime import datetime
from typing import Optional
from app.models.user import UserRole

class UserResponse(BaseModel):
    id: int
    full_name: str
    email: EmailStr
    role: UserRole
    is_active: bool
    is_verified: bool
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True

class UserUpdate(BaseModel):
    full_name: Optional[str] = Field(None, min_length=2, max_length=100)
    email: Optional[EmailStr] = None
    role: Optional[UserRole] = None
    is_active: Optional[bool] = None
    is_verified: Optional[bool] = None

class CustomerResponse(BaseModel):
    id: int
    user_id: int
    phone: str
    address: str
    city: str
    state: str
    postal_code: str
    country: str
    date_of_birth: Optional[datetime]
    
    class Config:
        from_attributes = True

class CustomerUpdate(BaseModel):
    phone: Optional[str] = Field(None, min_length=10, max_length=20)
    address: Optional[str] = Field(None, min_length=5)
    city: Optional[str] = Field(None, min_length=2)
    state: Optional[str] = Field(None, min_length=2)
    postal_code: Optional[str] = Field(None, min_length=3)
    country: Optional[str] = None
    date_of_birth: Optional[datetime] = None

class DriverResponse(BaseModel):
    id: int
    user_id: int
    phone: str
    license_number: str
    vehicle_type: str
    vehicle_number: str
    status: str
    experience_years: int
    current_location: Optional[str]
    rating: float
    total_deliveries: int
    
    class Config:
        from_attributes = True

class DriverUpdate(BaseModel):
    phone: Optional[str] = Field(None, min_length=10, max_length=20)
    license_number: Optional[str] = Field(None, min_length=5)
    vehicle_type: Optional[str] = Field(None, min_length=2)
    vehicle_number: Optional[str] = Field(None, min_length=4)
    status: Optional[str] = None
    experience_years: Optional[int] = Field(None, ge=0)
    current_location: Optional[str] = None