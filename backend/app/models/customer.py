from sqlmodel import SQLModel, Field, Relationship
from datetime import datetime
from typing import Optional

class Customer(SQLModel, table=True):
    __tablename__ = "customers"
    
    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: int = Field(foreign_key="users.id", unique=True)
    phone: str = Field(max_length=20)
    address: str = Field(max_length=255)
    city: str = Field(max_length=100)
    state: str = Field(max_length=100)
    postal_code: str = Field(max_length=20)
    country: str = Field(max_length=100, default="Pakistan")
    date_of_birth: Optional[datetime] = None
    
    # Relationship
    user: Optional["User"] = Relationship(back_populates="customer_profile")