from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session
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
    """Create a new shipment (Customer only)"""
    try:
        service = ShipmentService(session)
        shipment = service.create_shipment(current_user.id, data)
        return service.serialize_shipment(shipment)
    except Exception as e:
        print(f"Error creating shipment: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )

@router.get("/", response_model=List[ShipmentResponse])
async def get_shipments(
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session),
    skip: int = 0,
    limit: int = 100
):
    """Get shipments based on user role"""
    try:
        service = ShipmentService(session)
        
        if current_user.role == "ADMIN":
            shipments = service.get_all_shipments(skip, limit)
        elif current_user.role == "DRIVER":
            shipments = service.get_shipments_by_driver(current_user.id)
        else:  # CUSTOMER
            shipments = service.get_shipments_by_customer(current_user.id)
        
        return [service.serialize_shipment(shipment) for shipment in shipments]
    except Exception as e:
        print(f"Error fetching shipments: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch shipments: {str(e)}"
        )

@router.get("/pending", response_model=List[ShipmentResponse])
async def get_pending_shipments(
    current_user: User = Depends(require_role("ADMIN")),
    session: Session = Depends(get_session)
):
    """Get all pending shipments for admin to assign drivers"""
    try:
        service = ShipmentService(session)
        shipments = service.get_pending_shipments()
        
        # If no shipments, return empty list
        if not shipments:
            return []
        
        # Serialize each shipment
        serialized = []
        for shipment in shipments:
            try:
                serialized.append(service.serialize_shipment(shipment))
            except Exception as e:
                print(f"Error serializing shipment {shipment.id}: {str(e)}")
                # Skip problematic shipment
                continue
        
        return serialized
    except Exception as e:
        print(f"Error fetching pending shipments: {str(e)}")
        # Return empty list instead of throwing error
        return []

@router.get("/{shipment_id}", response_model=ShipmentResponse)
async def get_shipment(
    shipment_id: int,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """Get shipment by ID"""
    try:
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
                detail="You're not assigned to this shipment"
            )
        
        return service.serialize_shipment(shipment)
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error fetching shipment: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch shipment: {str(e)}"
        )

@router.get("/{shipment_id}/history", response_model=List[ShipmentHistoryResponse])
async def get_shipment_history(
    shipment_id: int,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """Get shipment history"""
    try:
        service = ShipmentService(session)
        shipment = service.get_shipment_by_id(shipment_id)
        
        if not shipment:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Shipment not found"
            )
        
        return service.get_shipment_history(shipment_id)
    except Exception as e:
        print(f"Error fetching shipment history: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch shipment history: {str(e)}"
        )

@router.put("/{shipment_id}/status")
async def update_shipment_status(
    shipment_id: int,
    status: ShipmentStatus,
    remarks: str = None,
    current_user: User = Depends(require_role("DRIVER", "ADMIN")),
    session: Session = Depends(get_session)
):
    """Update shipment status (Driver or Admin only)"""
    try:
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
    except Exception as e:
        print(f"Error updating shipment status: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to update shipment status: {str(e)}"
        )

@router.put("/{shipment_id}/assign")
async def assign_driver(
    shipment_id: int,
    driver_id: int,
    current_user: User = Depends(require_role("ADMIN")),
    session: Session = Depends(get_session)
):
    """Assign driver to shipment (Admin only)"""
    try:
        service = ShipmentService(session)
        shipment = service.assign_driver(shipment_id, driver_id)
        
        if not shipment:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Shipment not found"
            )
        
        return {
            "message": "Driver assigned successfully",
            "shipment": {
                "id": shipment.id,
                "tracking_number": shipment.tracking_number,
                "driver_id": shipment.driver_id,
                "status": shipment.status
            }
        }
    except Exception as e:
        print(f"Error assigning driver: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to assign driver: {str(e)}"
        )