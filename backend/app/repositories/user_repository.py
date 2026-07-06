# app/repositories/user_repository.py
from sqlmodel import Session, select
from app.models.user import User
from typing import Optional, List

class UserRepository:
    def __init__(self, session: Session):
        self.session = session
    
    def create_user(self, user: User) -> User:
        """Create a new user"""
        self.session.add(user)
        self.session.commit()
        self.session.refresh(user)
        return user
    
    def get_user_by_id(self, user_id: int) -> Optional[User]:
        """Get user by ID"""
        statement = select(User).where(User.id == user_id)
        return self.session.exec(statement).first()
    
    def get_user_by_email(self, email: str) -> Optional[User]:
        """Get user by email"""
        statement = select(User).where(User.email == email)
        return self.session.exec(statement).first()
    
    def update_user(self, user: User) -> User:
        """Update user"""
        self.session.add(user)
        self.session.commit()
        self.session.refresh(user)
        return user
    
    def delete_user(self, user_id: int) -> bool:
        """Delete user by ID"""
        user = self.get_user_by_id(user_id)
        if user:
            self.session.delete(user)
            self.session.commit()
            return True
        return False
    
    def get_all_users(self, skip: int = 0, limit: int = 100) -> List[User]:
        """Get all users with pagination"""
        statement = select(User).offset(skip).limit(limit)
        return self.session.exec(statement).all()