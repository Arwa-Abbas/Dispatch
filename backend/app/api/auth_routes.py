from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from app.schemas.auth import CustomerRegister, DriverRegister, AuthResponse
from app.schemas.user import UserResponse
from app.services.auth_service import AuthService
from app.core.dependencies import get_auth_service, get_current_user
from app.models.user import User

router = APIRouter(prefix="/auth", tags=["Authentication"])

@router.post("/register/customer", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
async def register_customer(
    user_data: CustomerRegister,
    auth_service: AuthService = Depends(get_auth_service)
):
    """Register a new customer"""
    try:
        user = auth_service.register_customer(user_data)
        return user
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )

@router.post("/register/driver", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
async def register_driver(
    user_data: DriverRegister,
    auth_service: AuthService = Depends(get_auth_service)
):
    """Register a new driver"""
    try:
        user = auth_service.register_driver(user_data)
        return user
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )

@router.post("/login", response_model=AuthResponse)
async def login_user(
    form_data: OAuth2PasswordRequestForm = Depends(),
    auth_service: AuthService = Depends(get_auth_service)
):
    """Login user with email and password"""
    user = auth_service.authenticate_user(form_data.username, form_data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    access_token = auth_service.create_user_token(user)
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": user
    }

@router.post("/logout")
async def logout_user(current_user: User = Depends(get_current_user)):
    """Logout user (client-side token removal)"""
    return {"message": "Successfully logged out"}

@router.get("/me", response_model=UserResponse)
async def get_current_user_info(
    current_user: User = Depends(get_current_user)
):
    """Get current authenticated user info"""
    return current_user