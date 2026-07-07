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
        """Generate a unique tracking number"""
        return f"DSP-{uuid.uuid4().hex[:8].upper()}"
    
    def serialize_shipment(self, shipment: Shipment) -> dict:
        """Serialize shipment with addresses"""
        try:
            pickup_address = None
            delivery_address = None
            
            if shipment.pickup_address:
                pickup_address = {
                    "id": shipment.pickup_address.id,
                    "street": shipment.pickup_address.street,
                    "city": shipment.pickup_address.city,
                    "state": shipment.pickup_address.state,
                    "postal_code": shipment.pickup_address.postal_code,
                    "country": shipment.pickup_address.country
                }
            
            if shipment.delivery_address:
                delivery_address = {
                    "id": shipment.delivery_address.id,
                    "street": shipment.delivery_address.street,
                    "city": shipment.delivery_address.city,
                    "state": shipment.delivery_address.state,
                    "postal_code": shipment.delivery_address.postal_code,
                    "country": shipment.delivery_address.country
                }
            
            return {
                "id": shipment.id,
                "tracking_number": shipment.tracking_number,
                "customer_id": shipment.customer_id,
                "driver_id": shipment.driver_id,
                "status": shipment.status,
                "sender_name": shipment.sender_name,
                "sender_phone": shipment.sender_phone,
                "receiver_name": shipment.receiver_name,
                "receiver_phone": shipment.receiver_phone,
                "weight": shipment.weight,
                "package_type": shipment.package_type,
                "description": shipment.description,
                "notes": shipment.notes,
                "created_at": shipment.created_at.isoformat() if shipment.created_at else None,
                "updated_at": shipment.updated_at.isoformat() if shipment.updated_at else None,
                "delivered_at": shipment.delivered_at.isoformat() if shipment.delivered_at else None,
                "pickup_address": pickup_address,
                "delivery_address": delivery_address
            }
        except Exception as e:
            print(f"Error serializing shipment {shipment.id}: {str(e)}")
            # Return basic data without relationships
            return {
                "id": shipment.id,
                "tracking_number": shipment.tracking_number,
                "customer_id": shipment.customer_id,
                "driver_id": shipment.driver_id,
                "status": shipment.status,
                "sender_name": shipment.sender_name,
                "sender_phone": shipment.sender_phone,
                "receiver_name": shipment.receiver_name,
                "receiver_phone": shipment.receiver_phone,
                "weight": shipment.weight,
                "package_type": shipment.package_type,
                "description": shipment.description,
                "notes": shipment.notes,
                "created_at": shipment.created_at.isoformat() if shipment.created_at else None,
                "updated_at": shipment.updated_at.isoformat() if shipment.updated_at else None,
                "delivered_at": shipment.delivered_at.isoformat() if shipment.delivered_at else None,
                "pickup_address": None,
                "delivery_address": None
            }
    
    def create_shipment(self, customer_id: int, data: ShipmentCreate) -> Shipment:
        """Create a new shipment with addresses"""
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
        
        # Create shipment with PENDING status
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
        
        # Create initial history entry
        history = ShipmentHistory(
            shipment_id=shipment.id,
            status=ShipmentStatus.PENDING,
            updated_by=customer_id,
            remarks="Shipment created and waiting for driver assignment"
        )
        self.session.add(history)
        self.session.commit()
        self.session.refresh(shipment)
        
        return shipment
    
    def get_shipments_by_customer(self, customer_id: int) -> List[Shipment]:
        """Get all shipments for a customer"""
        try:
            statement = select(Shipment).where(Shipment.customer_id == customer_id)
            shipments = self.session.exec(statement).all()
            # Load relationships
            for shipment in shipments:
                self.session.refresh(shipment, attribute_names=['pickup_address', 'delivery_address'])
            return shipments
        except Exception as e:
            print(f"Error getting shipments for customer {customer_id}: {str(e)}")
            return []
    
    def get_shipments_by_driver(self, driver_id: int) -> List[Shipment]:
        """Get all shipments assigned to a driver"""
        try:
            statement = select(Shipment).where(Shipment.driver_id == driver_id)
            shipments = self.session.exec(statement).all()
            for shipment in shipments:
                self.session.refresh(shipment, attribute_names=['pickup_address', 'delivery_address'])
            return shipments
        except Exception as e:
            print(f"Error getting shipments for driver {driver_id}: {str(e)}")
            return []
    
    def get_all_shipments(self, skip: int = 0, limit: int = 100) -> List[Shipment]:
        """Get all shipments (Admin only)"""
        try:
            statement = select(Shipment).offset(skip).limit(limit)
            shipments = self.session.exec(statement).all()
            for shipment in shipments:
                self.session.refresh(shipment, attribute_names=['pickup_address', 'delivery_address'])
            return shipments
        except Exception as e:
            print(f"Error getting all shipments: {str(e)}")
            return []
    
    def get_pending_shipments(self) -> List[Shipment]:
        """Get all pending shipments (for admin to assign drivers)"""
        try:
            # Simple query without complex joins
            statement = select(Shipment).where(
                Shipment.status == ShipmentStatus.PENDING
            )
            shipments = self.session.exec(statement).all()
            
            # Load addresses separately
            for shipment in shipments:
                try:
                    self.session.refresh(shipment, attribute_names=['pickup_address', 'delivery_address'])
                except Exception as e:
                    print(f"Error loading addresses for shipment {shipment.id}: {str(e)}")
            
            print(f"Found {len(shipments)} pending shipments")
            return shipments
        except Exception as e:
            print(f"Error getting pending shipments: {str(e)}")
            return []
    
    def get_shipment_by_id(self, shipment_id: int) -> Optional[Shipment]:
        """Get shipment by ID with addresses loaded"""
        try:
            statement = select(Shipment).where(Shipment.id == shipment_id)
            shipment = self.session.exec(statement).first()
            if shipment:
                self.session.refresh(shipment, attribute_names=['pickup_address', 'delivery_address'])
            return shipment
        except Exception as e:
            print(f"Error getting shipment {shipment_id}: {str(e)}")
            return None
    
    def update_shipment_status(self, shipment_id: int, status: ShipmentStatus, 
                              updated_by: int, remarks: Optional[str] = None) -> Optional[Shipment]:
        """Update shipment status and add history entry"""
        try:
            shipment = self.get_shipment_by_id(shipment_id)
            if not shipment:
                return None
            
            old_status = shipment.status
            shipment.status = status
            shipment.updated_at = datetime.utcnow()
            
            if status == ShipmentStatus.DELIVERED:
                shipment.delivered_at = datetime.utcnow()
            
            self.session.add(shipment)
            
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
        except Exception as e:
            print(f"Error updating shipment status: {str(e)}")
            self.session.rollback()
            return None
    
    def assign_driver(self, shipment_id: int, driver_id: int) -> Optional[Shipment]:
        """Assign a driver to a shipment"""
        try:
            shipment = self.get_shipment_by_id(shipment_id)
            if not shipment:
                return None
            
            # Check if driver exists and is active
            driver = self.session.get(User, driver_id)
            if not driver or driver.role.value != "DRIVER" or not driver.is_active:
                print(f"Invalid driver: {driver_id}")
                return None
            
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
            
            return shipment
        except Exception as e:
            print(f"Error assigning driver: {str(e)}")
            self.session.rollback()
            return None
    
    def get_shipment_history(self, shipment_id: int) -> List[ShipmentHistory]:
        """Get shipment history ordered by timestamp"""
        try:
            statement = select(ShipmentHistory).where(
                ShipmentHistory.shipment_id == shipment_id
            ).order_by(ShipmentHistory.timestamp.desc())
            return self.session.exec(statement).all()
        except Exception as e:
            print(f"Error getting shipment history: {str(e)}")
            return []