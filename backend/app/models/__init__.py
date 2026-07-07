# app/models/__init__.py
from .user import User, UserRole
from .customer import Customer
from .driver import Driver, DriverStatus
from .address import Address
from .shipment import Shipment, ShipmentHistory, ShipmentStatus
from .notification import Notification, NotificationType, NotificationStatus

__all__ = [
    "User", 
    "UserRole", 
    "Customer", 
    "Driver", 
    "DriverStatus",
    "Address",
    "Shipment", 
    "ShipmentHistory", 
    "ShipmentStatus",
    "Notification",
    "NotificationType",
    "NotificationStatus"
]