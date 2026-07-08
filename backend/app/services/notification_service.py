from sqlmodel import Session, select
from app.models.notification import Notification, NotificationType, NotificationStatus
from app.models.user import User
from app.models.shipment import Shipment, ShipmentStatus
from typing import List, Optional
from datetime import datetime

class NotificationService:
    def __init__(self, session: Session):
        self.session = session
    
    def create_notification(
        self,
        user_id: int,
        title: str,
        message: str,
        shipment_id: Optional[int] = None,
        notification_type: NotificationType = NotificationType.IN_APP
    ) -> Optional[Notification]:
        """Create a new notification"""
        try:
            print(f"[Service] Creating notification for user {user_id}: {title}")
            
            # Check if user exists
            user = self.session.get(User, user_id)
            if not user:
                print(f"[Service] User {user_id} not found")
                return None
            
            print(f"[Service] User found: {user.email}")
            
            # Check if notifications table exists
            try:
                test_query = self.session.exec(select(Notification).limit(1)).all()
                print("[Service] Notifications table exists and is accessible")
            except Exception as table_error:
                print(f"[Service] Notifications table issue: {str(table_error)}")
                print("Please run: alembic revision --autogenerate -m 'Add notifications table'")
                print("Then run: alembic upgrade head")
                return None
            
            # Create notification
            notification = Notification(
                user_id=user_id,
                shipment_id=shipment_id,
                type=notification_type,
                title=title,
                message=message,
                recipient=user.email,
                status=NotificationStatus.SENT,
                is_read=False,
                sent_at=datetime.utcnow()
            )
            
            print(f"[Service] Notification object created: {notification.title}")
            
            # Add to session and commit
            self.session.add(notification)
            self.session.commit()
            self.session.refresh(notification)
            
            print(f"[Service] Notification saved to database: ID {notification.id}")
            return notification
            
        except Exception as e:
            print(f"[Service] Error creating notification: {str(e)}")
            import traceback
            traceback.print_exc()
            self.session.rollback()
            return None
    
    def mark_as_read(self, notification_id: int) -> Optional[Notification]:
        """Mark notification as read"""
        try:
            notification = self.session.get(Notification, notification_id)
            if notification:
                notification.is_read = True
                notification.read_at = datetime.utcnow()
                notification.status = NotificationStatus.READ
                self.session.add(notification)
                self.session.commit()
                self.session.refresh(notification)
            return notification
        except Exception as e:
            print(f"Error marking notification as read: {str(e)}")
            self.session.rollback()
            return None
    
    def mark_all_as_read(self, user_id: int) -> int:
        """Mark all notifications as read for a user"""
        try:
            notifications = self.session.exec(
                select(Notification).where(
                    Notification.user_id == user_id,
                    Notification.is_read == False
                )
            ).all()
            
            count = 0
            for notification in notifications:
                notification.is_read = True
                notification.read_at = datetime.utcnow()
                notification.status = NotificationStatus.READ
                self.session.add(notification)
                count += 1
            
            self.session.commit()
            return count
        except Exception as e:
            print(f"Error marking all as read: {str(e)}")
            self.session.rollback()
            return 0
    
    def get_user_notifications(
        self, 
        user_id: int, 
        limit: int = 50, 
        only_unread: bool = False
    ) -> List[Notification]:
        """Get notifications for a user"""
        try:
            query = select(Notification).where(Notification.user_id == user_id)
            if only_unread:
                query = query.where(Notification.is_read == False)
            query = query.order_by(Notification.created_at.desc()).limit(limit)
            return self.session.exec(query).all()
        except Exception as e:
            print(f"Error getting notifications: {str(e)}")
            return []
    
    def get_unread_count(self, user_id: int) -> int:
        """Get unread notification count for a user"""
        try:
            return len(
                self.session.exec(
                    select(Notification).where(
                        Notification.user_id == user_id,
                        Notification.is_read == False
                    )
                ).all()
            )
        except Exception as e:
            print(f"Error getting unread count: {str(e)}")
            return 0