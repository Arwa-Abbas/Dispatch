from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session, select
from typing import List
from app.schemas.shipment import ShipmentCreate, ShipmentResponse, ShipmentHistoryResponse
from app.services.shipment_service import ShipmentService
from app.core.dependencies import get_current_user, get_session, require_role
from app.models.user import User
from app.models.shipment import ShipmentStatus

router = APIRouter(prefix="/shipments", tags=["Shipments"])

@router.post("/", response_model=ShipmentResponse, status_code=status.HTTP_201_CREATED)
async def create_shipment(
    data: ShipmentCreate,
    current_user: User = Depends(require_role("CUSTOMER")),
    session: Session = Depends(get_session)
):
    try:
        service = ShipmentService(session)
        shipment = service.create_shipment(current_user.id, data)
        return shipment
    except Exception as e:
        print(f"Error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )

@router.get("/", response_model=List[ShipmentResponse])
async def get_shipments(
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    try:
        service = ShipmentService(session)
        
        if current_user.role == "ADMIN":
            shipments = service.get_all_shipments()
        elif current_user.role == "DRIVER":
            shipments = service.get_shipments_by_driver(current_user.id)
        else:
            shipments = service.get_shipments_by_customer(current_user.id)
        
        return shipments
    except Exception as e:
        print(f"Error: {str(e)}")
        return []

@router.get("/pending", response_model=List[ShipmentResponse])
async def get_pending_shipments(
    current_user: User = Depends(require_role("ADMIN")),
    session: Session = Depends(get_session)
):
    try:
        service = ShipmentService(session)
        shipments = service.get_pending_shipments()
        return shipments
    except Exception as e:
        print(f"Error: {str(e)}")
        return []

@router.get("/track/{tracking_number}", response_model=ShipmentResponse)
async def track_shipment(
    tracking_number: str,
    session: Session = Depends(get_session)
):
    """Track a shipment by tracking number (Public endpoint)"""
    try:
        service = ShipmentService(session)
        shipment = service.get_shipment_by_tracking(tracking_number)
        
        if not shipment:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Shipment not found. Please check the tracking number."
            )
        
        return shipment
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error tracking shipment: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to track shipment"
        )

@router.get("/{shipment_id}", response_model=ShipmentResponse)
async def get_shipment(
    shipment_id: int,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    service = ShipmentService(session)
    shipment = service.get_shipment_by_id(shipment_id)
    
    if not shipment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Shipment not found"
        )
    
    return shipment

@router.get("/{shipment_id}/history", response_model=List[ShipmentHistoryResponse])
async def get_shipment_history(
    shipment_id: int,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    service = ShipmentService(session)
    shipment = service.get_shipment_by_id(shipment_id)
    
    if not shipment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Shipment not found"
        )
    
    return service.get_shipment_history(shipment_id)

@router.put("/{shipment_id}/status")
async def update_shipment_status(
    shipment_id: int,
    status: ShipmentStatus,
    remarks: str = None,
    current_user: User = Depends(require_role("DRIVER", "ADMIN")),
    session: Session = Depends(get_session)
):
    service = ShipmentService(session)
    shipment = service.get_shipment_by_id(shipment_id)
    
    if not shipment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Shipment not found"
        )
    
    if current_user.role == "DRIVER" and shipment.driver_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You're not assigned to this shipment"
        )
    
    updated = service.update_shipment_status(shipment_id, status, current_user.id, remarks)
    return {"message": "Status updated successfully", "status": status}

@router.put("/{shipment_id}/assign")
async def assign_driver(
    shipment_id: int,
    driver_id: int,
    current_user: User = Depends(require_role("ADMIN")),
    session: Session = Depends(get_session)
):
    service = ShipmentService(session)
    shipment = service.assign_driver(shipment_id, driver_id)
    
    if not shipment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Shipment not found"
        )
    
    return {"message": "Driver assigned successfully"}