from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session, select
from typing import List
from app.core.dependencies import get_current_user, get_session, require_role
from app.models.user import User
from app.models.driver import Driver
from app.services.shipment_service import ShipmentService
from app.schemas.shipment import ShipmentResponse
from app.models.shipment import ShipmentStatus


router = APIRouter(prefix="/driver", tags=["Driver"])

@router.get("/shipments", response_model=List[ShipmentResponse])
async def get_driver_shipments(
    current_user: User = Depends(require_role("DRIVER")),
    session: Session = Depends(get_session)
):
    """Get all shipments assigned to the current driver"""
    try:
        service = ShipmentService(session)
        shipments = service.get_shipments_by_driver(current_user.id)
        return shipments
    except Exception as e:
        print(f"Error fetching driver shipments: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to fetch shipments"
        )

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
    
    return shipment

@router.put("/shipments/{shipment_id}/status")
async def update_driver_shipment_status(
    shipment_id: int,
    status: str,
    remarks: str = None,
    current_user: User = Depends(require_role("DRIVER")),
    session: Session = Depends(get_session)
):
    """Update shipment status (Driver only)"""
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
            detail="Invalid status. Allowed: PICKED_UP, IN_TRANSIT, OUT_FOR_DELIVERY, DELIVERED, FAILED"
        )
    
    updated = service.update_shipment_status(shipment_id, new_status, current_user.id, remarks)
    return {
        "message": "Status updated successfully", 
        "status": status,
        "shipment_id": shipment_id
    }

@router.get("/profile/{driver_id}")
async def get_driver_profile(
    driver_id: int,
    session: Session = Depends(get_session)
):
    """Get driver profile by ID (Public endpoint for tracking)"""
    try:
        # Get driver profile
        driver = session.exec(
            select(Driver).where(Driver.user_id == driver_id)
        ).first()
        
        if not driver:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Driver not found"
            )
        
        # Get user details
        user = session.get(User, driver_id)
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )
        
        return {
            "id": user.id,
            "full_name": user.full_name,
            "email": user.email,
            "phone": driver.phone,
            "vehicle_type": driver.vehicle_type,
            "vehicle_number": driver.vehicle_number,
            "license_number": driver.license_number,
            "experience_years": driver.experience_years,
            "rating": driver.rating,
            "total_deliveries": driver.total_deliveries,
            "status": driver.status
        }
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error fetching driver profile: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to fetch driver profile"
        )