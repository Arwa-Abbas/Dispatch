from sqlmodel import Session, select
from app.models.shipment import Shipment, ShipmentStatus
from app.models.user import User
from app.services.notification_service import NotificationService
from typing import Optional, List

class NotificationHandler:
    """Handles notification creation for shipment events with role-based notifications"""
    
    def __init__(self, session: Session):
        self.session = session
        self.notification_service = NotificationService(session)
        print("[Handler] NotificationHandler initialized")
    
    def notify_shipment_created(self, shipment: Shipment, customer: User):
        """Send notification when shipment is created"""
        try:
            print(f"[Handler] Shipment created: {shipment.tracking_number}")
            
            # 1. Notify Customer
            customer_notification = self.notification_service.create_notification(
                user_id=customer.id,
                title="Shipment Created",
                message=f"Your shipment {shipment.tracking_number} has been created and is pending driver assignment.",
                shipment_id=shipment.id
            )
            if customer_notification:
                print(f"[Handler] Customer notification created: ID {customer_notification.id}")
            
            # 2. Notify All Admins (they need to assign drivers)
            admins = self.session.exec(
                select(User).where(User.role == "ADMIN")
            ).all()
            
            for admin in admins:
                admin_notification = self.notification_service.create_notification(
                    user_id=admin.id,
                    title="New Shipment Needs Driver",
                    message=f"Shipment {shipment.tracking_number} has been created and needs driver assignment.",
                    shipment_id=shipment.id
                )
                if admin_notification:
                    print(f"[Handler] Admin notification created: ID {admin_notification.id}")
                
        except Exception as e:
            print(f"[Handler] Error in notify_shipment_created: {str(e)}")
            import traceback
            traceback.print_exc()
    
    def notify_driver_assigned(self, shipment: Shipment, driver: User, customer: User, assigned_by: User):
        """Send notifications when driver is assigned"""
        try:
            print(f"[Handler] Driver assigned to shipment {shipment.tracking_number}")
            
            # 1. Notify Driver
            driver_notification = self.notification_service.create_notification(
                user_id=driver.id,
                title="New Assignment",
                message=f"You have been assigned to shipment {shipment.tracking_number}. Please pick up the package.",
                shipment_id=shipment.id
            )
            if driver_notification:
                print(f"[Handler] Driver notification created: ID {driver_notification.id}")
            
            # 2. Notify Customer
            customer_notification = self.notification_service.create_notification(
                user_id=customer.id,
                title="Driver Assigned",
                message=f"A driver has been assigned to your shipment {shipment.tracking_number}. They will pick up your package soon.",
                shipment_id=shipment.id
            )
            if customer_notification:
                print(f"[Handler] Customer notification created: ID {customer_notification.id}")
            
            # 3. Notify All Admins (except the one who assigned)
            admins = self.session.exec(
                select(User).where(User.role == "ADMIN")
            ).all()
            
            for admin in admins:
                if admin.id != assigned_by.id:
                    admin_notification = self.notification_service.create_notification(
                        user_id=admin.id,
                        title="Driver Assigned",
                        message=f"Shipment {shipment.tracking_number} has been assigned to driver {driver.full_name}.",
                        shipment_id=shipment.id
                    )
                    if admin_notification:
                        print(f"[Handler] Admin notification created: ID {admin_notification.id}")
                
        except Exception as e:
            print(f"[Handler] Error in notify_driver_assigned: {str(e)}")
            import traceback
            traceback.print_exc()
    
    def notify_status_changed(self, shipment: Shipment, old_status: ShipmentStatus, new_status: ShipmentStatus):
        """Send notification when shipment status changes"""
        try:
            print(f"[HANDLER] Status change: {old_status} -> {new_status}")
            print(f"[HANDLER] Shipment ID: {shipment.id}, Tracking: {shipment.tracking_number}, Current status: {shipment.status}")
            
            # Skip if no actual change
            if old_status == new_status:
                print("[HANDLER] No status change, skipping notification")
                return
            
            # Get customer
            customer = self.session.get(User, shipment.customer_id)
            if not customer:
                print(f"[HANDLER] Customer {shipment.customer_id} not found")
                return
            
            print(f"[HANDLER] Customer found: {customer.email}")
            
            # Status messages
            status_messages = {
                ShipmentStatus.PICKED_UP: {
                    "title": "Package Picked Up",
                    "message": f"Your package {shipment.tracking_number} has been picked up by the driver."
                },
                ShipmentStatus.IN_TRANSIT: {
                    "title": "In Transit",
                    "message": f"Your package {shipment.tracking_number} is now in transit to its destination."
                },
                ShipmentStatus.OUT_FOR_DELIVERY: {
                    "title": "Out for Delivery",
                    "message": f"Your package {shipment.tracking_number} is out for delivery today!"
                },
                ShipmentStatus.DELIVERED: {
                    "title": "Package Delivered",
                    "message": f"Your package {shipment.tracking_number} has been successfully delivered!"
                },
                ShipmentStatus.FAILED: {
                    "title": "Delivery Failed",
                    "message": f"Delivery for shipment {shipment.tracking_number} has failed."
                }
            }
            
            if new_status in status_messages:
                msg = status_messages[new_status]
                print(f"[HANDLER] Creating customer notification: {msg['title']}")
                
                notification = self.notification_service.create_notification(
                    user_id=customer.id,
                    title=msg["title"],
                    message=msg["message"],
                    shipment_id=shipment.id
                )
                
                if notification:
                    print(f"[HANDLER] Notification created: ID {notification.id}")
                else:
                    print("[HANDLER] Failed to create notification")
                    
        except Exception as e:
            print(f"[HANDLER] Error in notify_status_changed: {str(e)}")
            import traceback
            traceback.print_exc()
            
            # Get customer
            customer = self.session.get(User, shipment.customer_id)
            if not customer:
                print(f"[Handler] Customer {shipment.customer_id} not found")
                return
            
            print(f"[Handler] Customer found: {customer.email}")
            
            # Get driver if exists
            driver = None
            if shipment.driver_id:
                driver = self.session.get(User, shipment.driver_id)
                if driver:
                    print(f"[Handler] Driver found: {driver.email}")
            
            # 1. Notify Customer
            if new_status in status_messages and customer:
                msg = status_messages[new_status].get("customer")
                if msg:
                    print(f"[Handler] Creating customer notification: {msg['title']}")
                    customer_notification = self.notification_service.create_notification(
                        user_id=customer.id,
                        title=msg["title"],
                        message=msg["message"],
                        shipment_id=shipment.id
                    )
                    if customer_notification:
                        print(f"[Handler] Customer notification created: ID {customer_notification.id}")
                    else:
                        print("[Handler] Failed to create customer notification")
            
            # 2. Notify Driver (for PICKED_UP, DELIVERED, FAILED)
            if driver and new_status in [ShipmentStatus.PICKED_UP, ShipmentStatus.DELIVERED, ShipmentStatus.FAILED]:
                msg = status_messages.get(new_status, {}).get("driver")
                if msg:
                    print(f"[Handler] Creating driver notification: {msg['title']}")
                    driver_notification = self.notification_service.create_notification(
                        user_id=driver.id,
                        title=msg["title"],
                        message=msg["message"],
                        shipment_id=shipment.id
                    )
                    if driver_notification:
                        print(f"[Handler] Driver notification created: ID {driver_notification.id}")
                    else:
                        print("[Handler] Failed to create driver notification")
            
            # 3. Notify All Admins
            admins = self.session.exec(
                select(User).where(User.role == "ADMIN")
            ).all()
            
            for admin in admins:
                msg = status_messages.get(new_status, {}).get("admin")
                if msg:
                    print(f"[Handler] Creating admin notification: {msg['title']} for admin {admin.id}")
                    admin_notification = self.notification_service.create_notification(
                        user_id=admin.id,
                        title=msg["title"],
                        message=msg["message"],
                        shipment_id=shipment.id
                    )
                    if admin_notification:
                        print(f"[Handler] Admin notification created: ID {admin_notification.id}")
                    
        except Exception as e:
            print(f"[Handler] Error in notify_status_changed: {str(e)}")
            import traceback
            traceback.print_exc()