from sqlmodel import SQLModel, Field, Relationship
from datetime import datetime
from typing import Optional
from enum import Enum

class NotificationType(str, Enum):
    EMAIL = "EMAIL"
    SMS = "SMS"
    PUSH = "PUSH"

class NotificationStatus(str, Enum):
    PENDING = "PENDING"
    SENT = "SENT"
    FAILED = "FAILED"

class Notification(SQLModel, table=True):
    __tablename__ = "notifications"
    
    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: int = Field(foreign_key="users.id")
    shipment_id: Optional[int] = Field(default=None, foreign_key="shipments.id")
    type: NotificationType
    subject: str = Field(max_length=255)
    message: str = Field(max_length=1000)
    recipient: str = Field(max_length=255)
    status: NotificationStatus = Field(default=NotificationStatus.PENDING)
    sent_at: Optional[datetime] = None
    error_message: Optional[str] = Field(max_length=500)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    
    # Relationships
    # user: Optional["User"] = Relationship(back_populates="notifications")
    # shipment: Optional["Shipment"] = Relationship(back_populates="notifications")