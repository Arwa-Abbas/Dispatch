from pydantic import BaseModel, Field, validator
from datetime import datetime
from typing import Optional
from app.models.shipment import ShipmentStatus

class ShipmentBase(BaseModel):
    sender_name: str = Field(min_length=2, max_length=100)
    sender_phone: str = Field(min_length=10, max_length=20)
    pickup_address: str = Field(min_length=5, max_length=255)
    pickup_city: str = Field(min_length=2, max_length=100)
    pickup_state: str = Field(min_length=2, max_length=100)
    pickup_postal_code: str = Field(min_length=3, max_length=20)
    
    receiver_name: str = Field(min_length=2, max_length=100)
    receiver_phone: str = Field(min_length=10, max_length=20)
    delivery_address: str = Field(min_length=5, max_length=255)
    delivery_city: str = Field(min_length=2, max_length=100)
    delivery_state: str = Field(min_length=2, max_length=100)
    delivery_postal_code: str = Field(min_length=3, max_length=20)
    
    weight: float = Field(gt=0)
    package_type: str = Field(min_length=2, max_length=50)
    description: Optional[str] = Field(max_length=500)
    notes: Optional[str] = Field(max_length=500)

class ShipmentCreate(ShipmentBase):
    pass

class ShipmentUpdate(BaseModel):
    driver_id: Optional[int] = None
    status: Optional[ShipmentStatus] = None
    notes: Optional[str] = None

class ShipmentResponse(ShipmentBase):
    id: int
    tracking_number: str
    customer_id: int
    driver_id: Optional[int]
    status: ShipmentStatus
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