from datetime import datetime, timedelta
from typing import Optional, Dict, Any
from jose import JWTError, jwt
from passlib.context import CryptContext
from app.core.config import settings
import secrets
import hashlib
import base64

# Password hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify a plain password against a hashed password"""
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password: str) -> str:
    """Hash a password"""
    return pwd_context.hash(password)

def create_access_token(data: Dict[str, Any], expires_delta: Optional[timedelta] = None) -> str:
    """Create a JWT access token"""
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    
    to_encode.update({"exp": expire, "iat": datetime.utcnow()})
    encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
    return encoded_jwt

def decode_access_token(token: str) -> Dict[str, Any]:
    """Decode a JWT access token"""
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        return payload
    except JWTError as e:
        raise JWTError(f"Token validation failed: {str(e)}")

def create_remember_token() -> str:
    """Create a secure remember me token"""
    # Generate a random token and hash it for storage
    random_token = secrets.token_urlsafe(64)
    # Hash the token for storage (but we'll store the raw token in the database for simplicity)
    # In production, you'd hash this
    return random_token

def verify_remember_token(token: str, user_id: int, remember_token: str) -> bool:
    """Verify remember me token"""
    # In production, you'd compare hashed tokens
    return token == remember_token

def get_token_expiry(remember_me: bool = False) -> int:
    """Get token expiry in seconds"""
    if remember_me:
        return 86400 * 30  # 30 days
    return 3600  # 1 hour