from sqlmodel import Session, select
from app.models.shipment import Shipment, ShipmentHistory, ShipmentStatus
from app.models.user import User
from app.schemas.shipment import ShipmentCreate, ShipmentUpdate
from typing import List, Optional
import uuid
from datetime import datetime

class ShipmentService:
    def __init__(self, session: Session):
        self.session = session
    
    def generate_tracking_number(self) -> str:
        return f"DSP-{uuid.uuid4().hex[:8].upper()}"
    
    def create_shipment(self, customer_id: int, data: ShipmentCreate) -> Shipment:
        tracking_number = self.generate_tracking_number()
        
        shipment = Shipment(
            tracking_number=tracking_number,
            customer_id=customer_id,
            **data.dict()
        )
        self.session.add(shipment)
        self.session.flush()
        
        # Create initial history entry
        history = ShipmentHistory(
            shipment_id=shipment.id,
            status=shipment.status,
            updated_by=customer_id,
            remarks="Shipment created"
        )
        self.session.add(history)
        self.session.commit()
        self.session.refresh(shipment)
        
        return shipment
    
    def get_shipments_by_customer(self, customer_id: int) -> List[Shipment]:
        statement = select(Shipment).where(Shipment.customer_id == customer_id)
        return self.session.exec(statement).all()
    
    def get_shipments_by_driver(self, driver_id: int) -> List[Shipment]:
        statement = select(Shipment).where(Shipment.driver_id == driver_id)
        return self.session.exec(statement).all()
    
    def get_all_shipments(self, skip: int = 0, limit: int = 100) -> List[Shipment]:
        statement = select(Shipment).offset(skip).limit(limit)
        return self.session.exec(statement).all()
    
    def get_shipment_by_id(self, shipment_id: int) -> Optional[Shipment]:
        statement = select(Shipment).where(Shipment.id == shipment_id)
        return self.session.exec(statement).first()
    
    def get_shipment_by_tracking(self, tracking_number: str) -> Optional[Shipment]:
        statement = select(Shipment).where(Shipment.tracking_number == tracking_number)
        return self.session.exec(statement).first()
    
    def update_shipment_status(self, shipment_id: int, status: ShipmentStatus, 
                              updated_by: int, remarks: Optional[str] = None) -> Optional[Shipment]:
        shipment = self.get_shipment_by_id(shipment_id)
        if not shipment:
            return None
        
        old_status = shipment.status
        shipment.status = status
        shipment.updated_at = datetime.utcnow()
        
        if status == ShipmentStatus.DELIVERED:
            shipment.delivered_at = datetime.utcnow()
        
        # Add history entry
        history = ShipmentHistory(
            shipment_id=shipment.id,
            status=status,
            updated_by=updated_by,
            remarks=remarks or f"Status changed from {old_status} to {status}"
        )
        self.session.add(history)
        self.session.commit()
        self.session.refresh(shipment)
        
        return shipment
    
    def assign_driver(self, shipment_id: int, driver_id: int) -> Optional[Shipment]:
        shipment = self.get_shipment_by_id(shipment_id)
        if not shipment:
            return None
        
        shipment.driver_id = driver_id
        shipment.status = ShipmentStatus.ASSIGNED
        shipment.updated_at = datetime.utcnow()
        
        history = ShipmentHistory(
            shipment_id=shipment.id,
            status=ShipmentStatus.ASSIGNED,
            updated_by=driver_id,
            remarks=f"Driver assigned"
        )
        self.session.add(history)
        self.session.commit()
        self.session.refresh(shipment)
        
        return shipment
    
    def get_shipment_history(self, shipment_id: int) -> List[ShipmentHistory]:
        statement = select(ShipmentHistory).where(
            ShipmentHistory.shipment_id == shipment_id
        ).order_by(ShipmentHistory.timestamp.desc())
        return self.session.exec(statement).all()