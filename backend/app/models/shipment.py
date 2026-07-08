from sqlmodel import SQLModel, Field, Relationship
from datetime import datetime
from typing import Optional, List
from enum import Enum

class ShipmentStatus(str, Enum):
    PENDING = "PENDING"
    ASSIGNED = "ASSIGNED"
    PICKED_UP = "PICKED_UP"
    IN_TRANSIT = "IN_TRANSIT"
    OUT_FOR_DELIVERY = "OUT_FOR_DELIVERY"
    DELIVERED = "DELIVERED"
    CANCELLED = "CANCELLED"
    FAILED = "FAILED"

class Shipment(SQLModel, table=True):
    __tablename__ = "shipments"
    
    id: Optional[int] = Field(default=None, primary_key=True)
    tracking_number: str = Field(unique=True, index=True, max_length=50)
    customer_id: int = Field(foreign_key="users.id")
    driver_id: Optional[int] = Field(default=None, foreign_key="users.id")
    
    pickup_address_id: int = Field(foreign_key="addresses.id")
    delivery_address_id: int = Field(foreign_key="addresses.id")
    
    sender_name: str = Field(max_length=100)
    sender_phone: str = Field(max_length=20)
    receiver_name: str = Field(max_length=100)
    receiver_phone: str = Field(max_length=20)
    
    weight: float = Field(ge=0)
    package_type: str = Field(max_length=50)
    description: Optional[str] = Field(max_length=500)
    
    status: ShipmentStatus = Field(default=ShipmentStatus.PENDING)
    notes: Optional[str] = Field(max_length=500)
    
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    delivered_at: Optional[datetime] = None
    
    # Relationships
    customer: Optional["User"] = Relationship(
        back_populates="shipments_as_customer",
        sa_relationship_kwargs={"foreign_keys": "[Shipment.customer_id]"}
    )
    driver: Optional["User"] = Relationship(
        back_populates="shipments_as_driver",
        sa_relationship_kwargs={"foreign_keys": "[Shipment.driver_id]"}
    )
    pickup_address: Optional["Address"] = Relationship(
        back_populates="pickup_shipments",
        sa_relationship_kwargs={"foreign_keys": "[Shipment.pickup_address_id]"}
    )
    delivery_address: Optional["Address"] = Relationship(
        back_populates="delivery_shipments",
        sa_relationship_kwargs={"foreign_keys": "[Shipment.delivery_address_id]"}
    )
    history: List["ShipmentHistory"] = Relationship(back_populates="shipment")
    # ADD THIS - notifications relationship
    notifications: List["Notification"] = Relationship(back_populates="shipment")

class ShipmentHistory(SQLModel, table=True):
    __tablename__ = "shipment_history"
    
    id: Optional[int] = Field(default=None, primary_key=True)
    shipment_id: int = Field(foreign_key="shipments.id")
    status: ShipmentStatus
    updated_by: int = Field(foreign_key="users.id")
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    remarks: Optional[str] = Field(max_length=500)
    
    # Relationships
    shipment: Optional["Shipment"] = Relationship(back_populates="history")
    user: Optional["User"] = Relationship(
        back_populates="history_updates",
        sa_relationship_kwargs={"foreign_keys": "[ShipmentHistory.updated_by]"}
    )