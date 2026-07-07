from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session, select
from typing import List
from app.schemas.user import UserResponse, UserUpdate, ProfileUpdate, ProfileResponse
from app.core.dependencies import get_current_user, require_role, get_user_repository, get_session
from app.repositories.user_repository import UserRepository
from app.models.user import User
from app.models.customer import Customer

router = APIRouter(prefix="/users", tags=["Users"])

@router.get("/profile", response_model=ProfileResponse)
async def get_profile(
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """Get current user profile"""
    # Get customer profile if exists
    customer = session.exec(
        select(Customer).where(Customer.user_id == current_user.id)
    ).first()
    
    return {
        "full_name": current_user.full_name,
        "email": current_user.email,
        "phone": customer.phone if customer else "",
        "address": customer.address if customer else "",
        "city": customer.city if customer else "",
        "state": customer.state if customer else "",
        "postal_code": customer.postal_code if customer else "",
        "country": customer.country if customer else "Pakistan",
        "date_of_birth": customer.date_of_birth if customer else None,
    }

@router.put("/profile", response_model=ProfileResponse)
async def update_profile(
    profile_data: ProfileUpdate,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """Update current user profile"""
    # Update user basic info
    if profile_data.full_name:
        current_user.full_name = profile_data.full_name
        session.add(current_user)
    
    # Get or create customer profile
    customer = session.exec(
        select(Customer).where(Customer.user_id == current_user.id)
    ).first()
    
    if not customer:
        # Create customer profile if it doesn't exist
        customer = Customer(
            user_id=current_user.id,
            phone=profile_data.phone or "",
            address=profile_data.address or "",
            city=profile_data.city or "",
            state=profile_data.state or "",
            postal_code=profile_data.postal_code or "",
            country=profile_data.country or "Pakistan",
        )
        session.add(customer)
    else:
        # Update existing customer profile
        if profile_data.phone is not None:
            customer.phone = profile_data.phone
        if profile_data.address is not None:
            customer.address = profile_data.address
        if profile_data.city is not None:
            customer.city = profile_data.city
        if profile_data.state is not None:
            customer.state = profile_data.state
        if profile_data.postal_code is not None:
            customer.postal_code = profile_data.postal_code
        if profile_data.country is not None:
            customer.country = profile_data.country
        if profile_data.date_of_birth is not None:
            customer.date_of_birth = profile_data.date_of_birth
        session.add(customer)
    
    session.commit()
    session.refresh(current_user)
    if customer:
        session.refresh(customer)
    
    return {
        "full_name": current_user.full_name,
        "email": current_user.email,
        "phone": customer.phone if customer else "",
        "address": customer.address if customer else "",
        "city": customer.city if customer else "",
        "state": customer.state if customer else "",
        "postal_code": customer.postal_code if customer else "",
        "country": customer.country if customer else "Pakistan",
        "date_of_birth": customer.date_of_birth if customer else None,
    }

@router.get("/", response_model=List[UserResponse])
async def get_all_users(
    skip: int = 0,
    limit: int = 100,
    current_user: User = Depends(require_role("ADMIN")),
    session: Session = Depends(get_session)
):
    """Get all users (Admin only)"""
    try:
        statement = select(User).offset(skip).limit(limit)
        users = session.exec(statement).all()
        return users
    except Exception as e:
        print(f"Error fetching users: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to fetch users"
        )

@router.get("/{user_id}", response_model=UserResponse)
async def get_user_by_id(
    user_id: int,
    current_user: User = Depends(require_role("ADMIN")),
    session: Session = Depends(get_session)
):
    """Get user by ID (Admin only)"""
    user = session.get(User, user_id)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    return user

@router.put("/{user_id}", response_model=UserResponse)
async def update_user(
    user_id: int,
    user_update: UserUpdate,
    current_user: User = Depends(require_role("ADMIN")),
    session: Session = Depends(get_session)
):
    """Update user (Admin only)"""
    user = session.get(User, user_id)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    # Update fields
    if user_update.full_name is not None:
        user.full_name = user_update.full_name
    if user_update.email is not None:
        user.email = user_update.email
    if user_update.role is not None:
        user.role = user_update.role
    if user_update.is_active is not None:
        user.is_active = user_update.is_active
    if user_update.is_verified is not None:
        user.is_verified = user_update.is_verified
    
    session.add(user)
    session.commit()
    session.refresh(user)
    
    return user

@router.delete("/{user_id}")
async def delete_user(
    user_id: int,
    current_user: User = Depends(require_role("ADMIN")),
    session: Session = Depends(get_session)
):
    """Delete user (Admin only)"""
    user = session.get(User, user_id)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    # Don't allow deleting yourself
    if user.id == current_user.id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot delete your own account"
        )
    
    session.delete(user)
    session.commit()
    
    return {"message": "User deleted successfully"}