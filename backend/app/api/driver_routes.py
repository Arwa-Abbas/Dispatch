from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session
from typing import List
from app.core.dependencies import get_current_user, get_session, require_role
from app.models.user import User
from app.services.shipment_service import ShipmentService
from app.schemas.shipment import ShipmentResponse

router = APIRouter(prefix="/driver", tags=["Driver"])

@router.get("/shipments", response_model=List[ShipmentResponse])
async def get_driver_shipments(
    current_user: User = Depends(require_role("DRIVER")),
    session: Session = Depends(get_session)
):
    """Get all shipments assigned to the current driver"""
    service = ShipmentService(session)
    shipments = service.get_shipments_by_driver(current_user.id)
    return [service.serialize_shipment(shipment) for shipment in shipments]

@router.get("/shipments/{shipment_id}", response_model=ShipmentResponse)
async def get_driver_shipment(
    shipment_id: int,
    current_user: User = Depends(require_role("DRIVER")),
    session: Session = Depends(get_session)
):
    """Get a specific shipment assigned to the current driver"""
    service = ShipmentService(session)
    shipment = service.get_shipment_by_id(shipment_id)
    
    if not shipment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Shipment not found"
        )
    
    if shipment.driver_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You're not assigned to this shipment"
        )
    
    return service.serialize_shipment(shipment)

@router.put("/shipments/{shipment_id}/status")
async def update_driver_shipment_status(
    shipment_id: int,
    status: str,
    remarks: str = None,
    current_user: User = Depends(require_role("DRIVER")),
    session: Session = Depends(get_session)
):
    """Update shipment status (Driver only)"""
    from app.models.shipment import ShipmentStatus
    
    service = ShipmentService(session)
    shipment = service.get_shipment_by_id(shipment_id)
    
    if not shipment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Shipment not found"
        )
    
    if shipment.driver_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You're not assigned to this shipment"
        )
    
    try:
        new_status = ShipmentStatus(status)
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid status"
        )
    
    updated = service.update_shipment_status(shipment_id, new_status, current_user.id, remarks)
    return {"message": "Status updated successfully", "status": status}