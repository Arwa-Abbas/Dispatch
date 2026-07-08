from pydantic import BaseModel
from datetime import datetime
from typing import Optional
from app.models.notification import NotificationType, NotificationStatus

class NotificationResponse(BaseModel):
    id: int
    user_id: int
    shipment_id: Optional[int]
    type: NotificationType
    title: str
    message: str
    status: NotificationStatus
    is_read: bool
    created_at: datetime
    sent_at: Optional[datetime]
    read_at: Optional[datetime]
    
    class Config:
        from_attributes = True

class NotificationUpdate(BaseModel):
    is_read: bool = True