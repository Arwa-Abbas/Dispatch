from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session
from typing import List
from app.schemas.shipment import ShipmentCreate, ShipmentUpdate, ShipmentResponse, ShipmentHistoryResponse
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
    """Create a new shipment (Customer only)"""
    service = ShipmentService(session)
    shipment = service.create_shipment(current_user.id, data)
    return shipment

@router.get("/", response_model=List[ShipmentResponse])
async def get_shipments(
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session),
    skip: int = 0,
    limit: int = 100
):
    """Get shipments based on user role"""
    service = ShipmentService(session)
    
    if current_user.role == "ADMIN":
        shipments = service.get_all_shipments(skip, limit)
    elif current_user.role == "DRIVER":
        shipments = service.get_shipments_by_driver(current_user.id)
    else:  # CUSTOMER
        shipments = service.get_shipments_by_customer(current_user.id)
    
    return shipments

@router.get("/{shipment_id}", response_model=ShipmentResponse)
async def get_shipment(
    shipment_id: int,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """Get shipment by ID"""
    service = ShipmentService(session)
    shipment = service.get_shipment_by_id(shipment_id)
    
    if not shipment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Shipment not found"
        )
    
    # Check permissions
    if current_user.role == "CUSTOMER" and shipment.customer_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You don't have permission to view this shipment"
        )
    
    if current_user.role == "DRIVER" and shipment.driver_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You don't have permission to view this shipment"
        )
    
    return shipment

@router.get("/{shipment_id}/history", response_model=List[ShipmentHistoryResponse])
async def get_shipment_history(
    shipment_id: int,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """Get shipment history"""
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
    """Update shipment status (Driver or Admin only)"""
    service = ShipmentService(session)
    shipment = service.get_shipment_by_id(shipment_id)
    
    if not shipment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Shipment not found"
        )
    
    # Check if driver is assigned to this shipment
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
    """Assign driver to shipment (Admin only)"""
    service = ShipmentService(session)
    shipment = service.assign_driver(shipment_id, driver_id)
    
    if not shipment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Shipment not found"
        )
    
    return {"message": "Driver assigned successfully"}