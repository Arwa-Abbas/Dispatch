# app/schemas/auth.py
from pydantic import BaseModel, EmailStr, Field, validator
from typing import Optional
from datetime import datetime
from app.models.user import UserRole

# Base registration schemas
class UserRegister(BaseModel):
    full_name: str = Field(min_length=2, max_length=100)
    email: EmailStr
    password: str = Field(min_length=6)
    role: UserRole
    
    @validator('password')
    def validate_password(cls, v):
        if len(v) < 6:
            raise ValueError('Password must be at least 6 characters')
        return v

class CustomerRegister(BaseModel):
    full_name: str = Field(min_length=2, max_length=100)
    email: EmailStr
    password: str = Field(min_length=6)
    phone: str = Field(min_length=10, max_length=20)
    address: str = Field(min_length=5)
    city: str = Field(min_length=2)
    state: str = Field(min_length=2)
    postal_code: str = Field(min_length=3)
    country: str = Field(default="Pakistan")
    date_of_birth: Optional[datetime] = None
    
    @validator('password')
    def validate_password(cls, v):
        if len(v) < 6:
            raise ValueError('Password must be at least 6 characters')
        return v

class DriverRegister(BaseModel):
    full_name: str = Field(min_length=2, max_length=100)
    email: EmailStr
    password: str = Field(min_length=6)
    phone: str = Field(min_length=10, max_length=20)
    license_number: str = Field(min_length=5)
    vehicle_type: str = Field(min_length=2)
    vehicle_number: str = Field(min_length=4)
    experience_years: int = Field(default=0, ge=0)
    current_location: Optional[str] = None
    
    @validator('password')
    def validate_password(cls, v):
        if len(v) < 6:
            raise ValueError('Password must be at least 6 characters')
        return v

class UserLogin(BaseModel):
    email: EmailStr
    password: str = Field(min_length=6)

class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"

class TokenData(BaseModel):
    user_id: int
    email: str
    role: UserRole

class AuthResponse(BaseModel):
    access_token: str
    token_type: str
    user: "UserResponse"

# Import at the end to avoid circular import
from app.schemas.user import UserResponse
AuthResponse.model_rebuild()