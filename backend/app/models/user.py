from sqlmodel import SQLModel, Field, Relationship
from datetime import datetime
from typing import Optional, List
from enum import Enum

class UserRole(str, Enum):
    ADMIN = "ADMIN"
    DRIVER = "DRIVER"
    CUSTOMER = "CUSTOMER"

class User(SQLModel, table=True):
    __tablename__ = "users"
    
    id: Optional[int] = Field(default=None, primary_key=True)
    full_name: str = Field(max_length=100)
    email: str = Field(unique=True, index=True, max_length=100)
    password: str = Field(max_length=255)
    role: UserRole = Field(default=UserRole.CUSTOMER)
    is_active: bool = Field(default=True)
    is_verified: bool = Field(default=False)
    remember_token: Optional[str] = Field(max_length=255, default=None)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    
    # Relationships
    customer_profile: Optional["Customer"] = Relationship(back_populates="user")
    driver_profile: Optional["Driver"] = Relationship(back_populates="user")
    shipments_as_customer: List["Shipment"] = Relationship(
        back_populates="customer",
        sa_relationship_kwargs={"foreign_keys": "[Shipment.customer_id]"}
    )
    shipments_as_driver: List["Shipment"] = Relationship(
        back_populates="driver",
        sa_relationship_kwargs={"foreign_keys": "[Shipment.driver_id]"}
    )
    history_updates: List["ShipmentHistory"] = Relationship(
        back_populates="user",
        sa_relationship_kwargs={"foreign_keys": "[ShipmentHistory.updated_by]"}
    )
    # Keep this relationship
    notifications: List["Notification"] = Relationship(back_populates="user")
    
    def __repr__(self):
        return f"<User {self.email}>"