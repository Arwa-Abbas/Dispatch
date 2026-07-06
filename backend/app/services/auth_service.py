from sqlmodel import Session
from app.repositories.user_repository import UserRepository
from app.models.user import User, UserRole
from app.models.customer import Customer
from app.models.driver import Driver
from app.schemas.auth import CustomerRegister, DriverRegister
from app.core.security import get_password_hash, verify_password, create_access_token
from typing import Optional

class AuthService:
    def __init__(self, session: Session):
        self.user_repo = UserRepository(session)
        self.session = session
    
    def register_customer(self, user_data: CustomerRegister) -> User:
        """Register a new customer"""
        # Check if user already exists
        existing_user = self.user_repo.get_user_by_email(user_data.email)
        if existing_user:
            raise ValueError("User with this email already exists")
        
        # Create user
        new_user = User(
            full_name=user_data.full_name,
            email=user_data.email,
            password=get_password_hash(user_data.password),
            role=UserRole.CUSTOMER
        )
        self.session.add(new_user)
        self.session.flush()
        
        # Create customer profile
        customer = Customer(
            user_id=new_user.id,
            phone=user_data.phone,
            address=user_data.address,
            city=user_data.city,
            state=user_data.state,
            postal_code=user_data.postal_code,
            country=user_data.country,
            date_of_birth=user_data.date_of_birth
        )
        self.session.add(customer)
        self.session.commit()
        self.session.refresh(new_user)
        
        return new_user
    
    def register_driver(self, user_data: DriverRegister) -> User:
        """Register a new driver"""
        # Check if user already exists
        existing_user = self.user_repo.get_user_by_email(user_data.email)
        if existing_user:
            raise ValueError("User with this email already exists")
        
        # Create user
        new_user = User(
            full_name=user_data.full_name,
            email=user_data.email,
            password=get_password_hash(user_data.password),
            role=UserRole.DRIVER
        )
        self.session.add(new_user)
        self.session.flush()
        
        # Create driver profile
        driver = Driver(
            user_id=new_user.id,
            phone=user_data.phone,
            license_number=user_data.license_number,
            vehicle_type=user_data.vehicle_type,
            vehicle_number=user_data.vehicle_number,
            experience_years=user_data.experience_years,
            current_location=user_data.current_location
        )
        self.session.add(driver)
        self.session.commit()
        self.session.refresh(new_user)
        
        return new_user
    
    def authenticate_user(self, email: str, password: str) -> Optional[User]:
        """Authenticate user with email and password"""
        user = self.user_repo.get_user_by_email(email)
        if not user:
            return None
        if not verify_password(password, user.password):
            return None
        if not user.is_active:
            raise ValueError("User account is deactivated")
        return user
    
    def create_user_token(self, user: User) -> str:
        """Create JWT token for user"""
        token_data = {
            "sub": str(user.id),
            "email": user.email,
            "role": user.role.value
        }
        return create_access_token(token_data)