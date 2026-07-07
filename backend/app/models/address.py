from sqlmodel import SQLModel, Field, Relationship
from datetime import datetime
from typing import Optional, List

class Address(SQLModel, table=True):
    __tablename__ = "addresses"
    
    id: Optional[int] = Field(default=None, primary_key=True)
    street: str = Field(max_length=255)
    city: str = Field(max_length=100)
    state: str = Field(max_length=100)
    postal_code: str = Field(max_length=20)
    country: str = Field(max_length=100, default="Pakistan")
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    
    # Relationships
    pickup_shipments: List["Shipment"] = Relationship(
        back_populates="pickup_address",
        sa_relationship_kwargs={"foreign_keys": "[Shipment.pickup_address_id]"}
    )
    delivery_shipments: List["Shipment"] = Relationship(
        back_populates="delivery_address",
        sa_relationship_kwargs={"foreign_keys": "[Shipment.delivery_address_id]"}
    )