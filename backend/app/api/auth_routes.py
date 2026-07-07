from fastapi import APIRouter, Depends, HTTPException, status, Request
from fastapi.security import OAuth2PasswordBearer
from sqlmodel import Session
from app.schemas.auth import CustomerRegister, DriverRegister, AuthResponse, UserLogin
from app.schemas.user import UserResponse
from app.services.auth_service import AuthService
from app.core.dependencies import get_auth_service, get_current_user
from app.models.user import User

router = APIRouter(prefix="/auth", tags=["Authentication"])
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="api/v1/auth/login")

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
    login_data: UserLogin,
    auth_service: AuthService = Depends(get_auth_service)
):
    """Login user with email and password"""
    try:
        user = auth_service.authenticate_user(
            login_data.email, 
            login_data.password,
            login_data.remember_me
        )
        if not user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Incorrect email or password",
                headers={"WWW-Authenticate": "Bearer"},
            )
        
        token_data = auth_service.create_user_token(user, login_data.remember_me)
        
        return {
            "access_token": token_data["access_token"],
            "token_type": token_data["token_type"],
            "user": user,
            "expires_in": token_data["expires_in"],
            "remember_me": token_data.get("remember_me", False)
        }
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )

@router.post("/logout")
async def logout_user(
    current_user: User = Depends(get_current_user),
    auth_service: AuthService = Depends(get_auth_service)
):
    """Logout user - clear remember token"""
    auth_service.logout(current_user)
    return {"message": "Successfully logged out"}

@router.get("/me", response_model=UserResponse)
async def get_current_user_info(
    current_user: User = Depends(get_current_user)
):
    """Get current authenticated user info"""
    return current_user

@router.post("/verify")
async def verify_token(
    current_user: User = Depends(get_current_user)
):
    """Verify if the current JWT token is still valid"""
    return {
        "valid": True,
        "user": {
            "id": current_user.id,
            "email": current_user.email,
            "full_name": current_user.full_name,
            "role": current_user.role.value,
            "is_active": current_user.is_active,
            "is_verified": current_user.is_verified,
            "created_at": str(current_user.created_at),
            "updated_at": str(current_user.updated_at),
        }
    }

@router.post("/refresh", response_model=AuthResponse)
async def refresh_token(
    current_user: User = Depends(get_current_user),
    auth_service: AuthService = Depends(get_auth_service)
):
    """Refresh an existing valid JWT token to extend the session"""
    # Check if user had remember_me enabled (has remember_token in DB)
    remember_me = current_user.remember_token is not None
    token_data = auth_service.create_user_token(current_user, remember_me)
    
    return {
        "access_token": token_data["access_token"],
        "token_type": token_data["token_type"],
        "user": current_user,
        "expires_in": token_data["expires_in"],
        "remember_me": token_data.get("remember_me", False)
    }