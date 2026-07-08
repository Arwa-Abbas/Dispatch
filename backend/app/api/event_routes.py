from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session
from app.core.dependencies import get_current_user, get_session
from app.models.user import User
from app.models.shipment import ShipmentStatus
from app.services.shipment_service import ShipmentService
from app.services.notification_handler import NotificationHandler

router = APIRouter(prefix="/events", tags=["Events"])

@router.post("/shipment-created/{shipment_id}")
async def handle_shipment_created(
    shipment_id: int,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """Trigger notification for shipment creation"""
    service = ShipmentService(session)
    shipment = service.get_shipment_by_id(shipment_id)
    
    if not shipment:
        raise HTTPException(status_code=404, detail="Shipment not found")
    
    handler = NotificationHandler(session)
    handler.notify_shipment_created(shipment, current_user)
    
    return {"message": "Notification triggered"}

@router.post("/driver-assigned/{shipment_id}")
async def handle_driver_assigned(
    shipment_id: int,
    driver_id: int,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """Trigger notification for driver assignment"""
    service = ShipmentService(session)
    shipment = service.get_shipment_by_id(shipment_id)
    
    if not shipment:
        raise HTTPException(status_code=404, detail="Shipment not found")
    
    driver = session.get(User, driver_id)
    if not driver:
        raise HTTPException(status_code=404, detail="Driver not found")
    
    customer = session.get(User, shipment.customer_id)
    if not customer:
        raise HTTPException(status_code=404, detail="Customer not found")
    
    handler = NotificationHandler(session)
    handler.notify_driver_assigned(shipment, driver, customer)
    
    return {"message": "Notification triggered"}