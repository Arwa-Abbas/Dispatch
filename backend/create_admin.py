"""
Script to create an admin user with fixed values
Run: python create_admin.py
"""

import sys
from pathlib import Path

# Add the current directory to sys.path
sys.path.append(str(Path(__file__).parent))

from sqlmodel import Session, select
from app.database.session import engine
from app.models.user import User, UserRole
from app.core.security import get_password_hash

def create_fixed_admin():
    """Create admin user with predefined credentials"""
    
    # Admin credentials
    ADMIN_EMAIL = "admin@dispatch.com"
    ADMIN_PASSWORD = "test1234"
    ADMIN_NAME = "System Administrator"
    
    print("\n" + "="*50)
    print("  ADMIN USER CREATION")
    print("="*50 + "\n")
    
    with Session(engine) as session:
        # Check if user already exists
        existing_user = session.exec(
            select(User).where(User.email == ADMIN_EMAIL)
        ).first()
        
        if existing_user:
            print(f"⚠️  User already exists!")
            print(f"   Email: {existing_user.email}")
            print(f"   Name: {existing_user.full_name}")
            print(f"   Role: {existing_user.role}")
            
            # Update existing user to admin if not already
            if existing_user.role != UserRole.ADMIN:
                existing_user.role = UserRole.ADMIN
                existing_user.is_verified = True
                session.add(existing_user)
                session.commit()
                print(f"✅ Updated user to ADMIN role!")
            else:
                print(f"✅ User is already an ADMIN!")
            return
        
        # Create admin user
        admin_user = User(
            full_name=ADMIN_NAME,
            email=ADMIN_EMAIL,
            password=get_password_hash(ADMIN_PASSWORD),
            role=UserRole.ADMIN,
            is_active=True,
            is_verified=True
        )
        
        session.add(admin_user)
        session.commit()
        session.refresh(admin_user)
        
        print("✅ ADMIN USER CREATED SUCCESSFULLY!")
        print("="*50)
        print(f"   Email: {ADMIN_EMAIL}")
        print(f"   Password: {ADMIN_PASSWORD}")
        print(f"   Name: {ADMIN_NAME}")
        print(f"   Role: ADMIN")
        print("="*50 + "\n")
        print("You can now login at: http://localhost:5173/login")
        print("\nCredentials:")
        print(f"   Email: {ADMIN_EMAIL}")
        print(f"   Password: {ADMIN_PASSWORD}\n")

if __name__ == "__main__":
    try:
        create_fixed_admin()
    except KeyboardInterrupt:
        print("\n\n❌ Script cancelled by user")
    except Exception as e:
        print(f"\n❌ Error: {str(e)}")
        import traceback
        traceback.print_exc()