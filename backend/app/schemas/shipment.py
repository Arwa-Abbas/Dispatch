from pydantic import BaseModel, Field, validator
from datetime import datetime
from typing import Optional
from app.models.shipment import ShipmentStatus

class AddressCreate(BaseModel):
    street: str = Field(min_length=5, max_length=255)
    city: str = Field(min_length=2, max_length=100)
    state: str = Field(min_length=2, max_length=100)
    postal_code: str = Field(min_length=3, max_length=20)
    country: str = Field(default="Pakistan")

class AddressResponse(BaseModel):
    id: int
    street: str
    city: str
    state: str
    postal_code: str
    country: str
    
    class Config:
        from_attributes = True

class ShipmentBase(BaseModel):
    sender_name: str = Field(min_length=2, max_length=100)
    sender_phone: str = Field(min_length=10, max_length=20)
    receiver_name: str = Field(min_length=2, max_length=100)
    receiver_phone: str = Field(min_length=10, max_length=20)
    weight: float = Field(gt=0)
    package_type: str = Field(min_length=2, max_length=50)
    description: Optional[str] = Field(max_length=500)
    notes: Optional[str] = Field(max_length=500)

class ShipmentCreate(ShipmentBase):
    pickup_address: AddressCreate
    delivery_address: AddressCreate

class ShipmentUpdate(BaseModel):
    driver_id: Optional[int] = None
    status: Optional[ShipmentStatus] = None
    notes: Optional[str] = None

class ShipmentResponse(BaseModel):
    id: int
    tracking_number: str
    customer_id: int
    driver_id: Optional[int]
    sender_name: str
    sender_phone: str
    receiver_name: str
    receiver_phone: str
    weight: float
    package_type: str
    description: Optional[str]
    notes: Optional[str]
    status: ShipmentStatus
    pickup_address: str
    pickup_city: str
    pickup_state: str
    pickup_postal_code: str
    delivery_address: str
    delivery_city: str
    delivery_state: str
    delivery_postal_code: str
    created_at: datetime
    updated_at: datetime
    delivered_at: Optional[datetime]

    class Config:
        from_attributes = True

class ShipmentHistoryResponse(BaseModel):
    id: int
    shipment_id: int
    status: ShipmentStatus
    updated_by: int
    timestamp: datetime
    remarks: Optional[str]
    
    class Config:
        from_attributes = True