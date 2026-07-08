from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session
from typing import List
from app.core.dependencies import get_current_user, get_session
from app.models.user import User
from app.models.notification import Notification
from app.services.notification_service import NotificationService
from app.schemas.notification import NotificationResponse

router = APIRouter(prefix="/notifications", tags=["Notifications"])

@router.get("/", response_model=List[NotificationResponse])
async def get_notifications(
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session),
    limit: int = 50,
    unread_only: bool = False
):
    """Get notifications for current user"""
    try:
        service = NotificationService(session)
        notifications = service.get_user_notifications(
            user_id=current_user.id,
            limit=limit,
            only_unread=unread_only
        )
        print(f"Found {len(notifications)} notifications for user {current_user.id}")
        return notifications
    except Exception as e:
        print(f"Error getting notifications: {str(e)}")
        import traceback
        traceback.print_exc()
        return []

@router.get("/count")
async def get_unread_count(
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """Get unread notification count"""
    try:
        service = NotificationService(session)
        count = service.get_unread_count(current_user.id)
        print(f"Unread count for user {current_user.id}: {count}")
        return {"count": count}
    except Exception as e:
        print(f"Error getting unread count: {str(e)}")
        import traceback
        traceback.print_exc()
        return {"count": 0}

@router.put("/{notification_id}/read")
async def mark_as_read(
    notification_id: int,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """Mark a notification as read"""
    service = NotificationService(session)
    notification = service.mark_as_read(notification_id)
    
    if not notification:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Notification not found"
        )
    
    return {"message": "Notification marked as read"}

@router.put("/read-all")
async def mark_all_as_read(
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """Mark all notifications as read"""
    service = NotificationService(session)
    count = service.mark_all_as_read(current_user.id)
    return {"message": f"Marked {count} notifications as read"}

@router.delete("/{notification_id}")
async def delete_notification(
    notification_id: int,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """Delete a notification"""
    service = NotificationService(session)
    notification = service.session.get(Notification, notification_id)
    
    if not notification:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Notification not found"
        )
    
    if notification.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to delete this notification"
        )
    
    service.session.delete(notification)
    service.session.commit()
    
    return {"message": "Notification deleted"}