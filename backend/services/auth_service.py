from sqlalchemy.orm import Session
from sqlalchemy import or_
from models.user import User, FinancialProfile
from models.category import Category
from schemas.auth import RegisterRequest
from utils.security import get_password_hash, verify_password, create_access_token, create_refresh_token
from datetime import timedelta
from config import settings
import uuid


# Default categories for new users
DEFAULT_CATEGORIES = [
    {"name": "Housing", "icon": "home", "color": "#3B82F6", "is_default": True},
    {"name": "Food", "icon": "utensils", "color": "#10B981", "is_default": True},
    {"name": "Transportation", "icon": "car", "color": "#F59E0B", "is_default": True},
    {"name": "Entertainment", "icon": "film", "color": "#8B5CF6", "is_default": True},
    {"name": "Shopping", "icon": "shopping-bag", "color": "#EC4899", "is_default": True},
    {"name": "Healthcare", "icon": "heart", "color": "#EF4444", "is_default": True},
    {"name": "Education", "icon": "book", "color": "#06B6D4", "is_default": True},
    {"name": "Utilities", "icon": "zap", "color": "#F97316", "is_default": True},
    {"name": "Other", "icon": "more-horizontal", "color": "#6B7280", "is_default": True},
]


def create_user(db: Session, user_data: RegisterRequest, financial_profile_data: dict = None) -> User:
    """Create a new user with default categories."""
    # Check if user already exists
    existing_user = db.query(User).filter(
        or_(User.username == user_data.username, User.email == user_data.email)
    ).first()
    if existing_user:
        raise ValueError("Username or email already exists")
    
    # Create user
    user = User(
        username=user_data.username,
        full_name=user_data.full_name,
        email=user_data.email,
        phone=user_data.phone,
        password_hash=get_password_hash(user_data.password)
    )
    db.add(user)
    db.flush()  # Get user ID
    
    # Create financial profile
    if financial_profile_data:
        profile = FinancialProfile(
            user_id=user.id,
            monthly_income=financial_profile_data.get("monthly_income"),
            current_savings=financial_profile_data.get("current_savings"),
            financial_goals=financial_profile_data.get("financial_goals"),
            currency=financial_profile_data.get("currency", "USD")
        )
        db.add(profile)
    
    # Create default categories
    for cat_data in DEFAULT_CATEGORIES:
        category = Category(
            user_id=user.id,
            name=cat_data["name"],
            icon=cat_data["icon"],
            color=cat_data["color"],
            is_default=cat_data["is_default"]
        )
        db.add(category)
    
    db.commit()
    db.refresh(user)
    return user


def authenticate_user(db: Session, username: str, password: str) -> User | None:
    """Authenticate a user by username/email and password."""
    user = db.query(User).filter(
        or_(User.username == username, User.email == username)
    ).first()
    
    if not user:
        return None
    
    if not verify_password(password, user.password_hash):
        return None
    
    return user


def create_tokens(user: User) -> dict:
    """Create access and refresh tokens for a user."""
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": str(user.id), "username": user.username},
        expires_delta=access_token_expires
    )
    refresh_token = create_refresh_token(
        data={"sub": str(user.id), "username": user.username}
    )
    
    return {
        "access_token": access_token,
        "refresh_token": refresh_token,
        "token_type": "bearer"
    }

