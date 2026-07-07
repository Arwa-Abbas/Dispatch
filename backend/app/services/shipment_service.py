from sqlmodel import Session, select
from app.models.shipment import Shipment, ShipmentHistory, ShipmentStatus
from app.models.address import Address
from app.models.user import User
from app.schemas.shipment import ShipmentCreate
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
        
        # Create pickup address
        pickup_address = Address(
            street=data.pickup_address.street,
            city=data.pickup_address.city,
            state=data.pickup_address.state,
            postal_code=data.pickup_address.postal_code,
            country=data.pickup_address.country,
        )
        self.session.add(pickup_address)
        self.session.flush()
        
        # Create delivery address
        delivery_address = Address(
            street=data.delivery_address.street,
            city=data.delivery_address.city,
            state=data.delivery_address.state,
            postal_code=data.delivery_address.postal_code,
            country=data.delivery_address.country,
        )
        self.session.add(delivery_address)
        self.session.flush()
        
        # Create shipment
        shipment = Shipment(
            tracking_number=tracking_number,
            customer_id=customer_id,
            pickup_address_id=pickup_address.id,
            delivery_address_id=delivery_address.id,
            sender_name=data.sender_name,
            sender_phone=data.sender_phone,
            receiver_name=data.receiver_name,
            receiver_phone=data.receiver_phone,
            weight=data.weight,
            package_type=data.package_type,
            description=data.description,
            notes=data.notes,
            status=ShipmentStatus.PENDING
        )
        self.session.add(shipment)
        self.session.flush()
        
        # Create history
        history = ShipmentHistory(
            shipment_id=shipment.id,
            status=ShipmentStatus.PENDING,
            updated_by=customer_id,
            remarks="Shipment created"
        )
        self.session.add(history)
        self.session.commit()
        self.session.refresh(shipment)
        
        return shipment
    
    def get_all_shipments(self) -> List[Shipment]:
        statement = select(Shipment)
        shipments = self.session.exec(statement).all()
        for s in shipments:
            try:
                self.session.refresh(s, attribute_names=['pickup_address', 'delivery_address'])
            except:
                pass
        return shipments
    
    def get_pending_shipments(self) -> List[Shipment]:
        statement = select(Shipment).where(Shipment.status == ShipmentStatus.PENDING)
        shipments = self.session.exec(statement).all()
        for s in shipments:
            try:
                self.session.refresh(s, attribute_names=['pickup_address', 'delivery_address'])
            except:
                pass
        return shipments
    
    def get_shipments_by_customer(self, customer_id: int) -> List[Shipment]:
        statement = select(Shipment).where(Shipment.customer_id == customer_id)
        shipments = self.session.exec(statement).all()
        for s in shipments:
            try:
                self.session.refresh(s, attribute_names=['pickup_address', 'delivery_address'])
            except:
                pass
        return shipments
    
    def get_shipments_by_driver(self, driver_id: int) -> List[Shipment]:
        """Get all shipments assigned to a driver"""
        try:
            # Get shipments where driver_id matches AND status is not DELIVERED or CANCELLED
            statement = select(Shipment).where(
                Shipment.driver_id == driver_id
            )
            shipments = self.session.exec(statement).all()
            print(f"Found {len(shipments)} shipments for driver {driver_id}")
            
            # Load addresses
            for s in shipments:
                try:
                    self.session.refresh(s, attribute_names=['pickup_address', 'delivery_address'])
                except:
                    pass
            return shipments
        except Exception as e:
            print(f"Error getting shipments for driver {driver_id}: {str(e)}")
            return []
    
    def get_shipment_by_id(self, shipment_id: int) -> Optional[Shipment]:
        statement = select(Shipment).where(Shipment.id == shipment_id)
        shipment = self.session.exec(statement).first()
        if shipment:
            try:
                self.session.refresh(shipment, attribute_names=['pickup_address', 'delivery_address'])
            except:
                pass
        return shipment
    
    def assign_driver(self, shipment_id: int, driver_id: int) -> Optional[Shipment]:
        shipment = self.get_shipment_by_id(shipment_id)
        if not shipment:
            print(f"Shipment {shipment_id} not found")
            return None
        
        # Check if driver exists
        driver = self.session.get(User, driver_id)
        if not driver:
            print(f"Driver {driver_id} not found")
            return None
        
        if driver.role != "DRIVER":
            print(f"User {driver_id} is not a driver")
            return None
        
        # Assign driver and update status
        shipment.driver_id = driver_id
        shipment.status = ShipmentStatus.ASSIGNED
        shipment.updated_at = datetime.utcnow()
        
        # Add history entry
        history = ShipmentHistory(
            shipment_id=shipment.id,
            status=ShipmentStatus.ASSIGNED,
            updated_by=driver_id,
            remarks=f"Driver {driver.full_name} assigned to this shipment"
        )
        self.session.add(history)
        self.session.commit()
        self.session.refresh(shipment)
        
        print(f"Assigned driver {driver_id} to shipment {shipment_id}")
        return shipment
    
    def update_shipment_status(self, shipment_id: int, status: ShipmentStatus, 
                              updated_by: int, remarks: Optional[str] = None) -> Optional[Shipment]:
        shipment = self.get_shipment_by_id(shipment_id)
        if not shipment:
            return None
        
        shipment.status = status
        shipment.updated_at = datetime.utcnow()
        
        if status == ShipmentStatus.DELIVERED:
            shipment.delivered_at = datetime.utcnow()
        
        history = ShipmentHistory(
            shipment_id=shipment.id,
            status=status,
            updated_by=updated_by,
            remarks=remarks or f"Status updated to {status}"
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