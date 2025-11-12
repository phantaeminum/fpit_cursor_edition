from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from datetime import datetime
from database import get_db
from models.user import User, FinancialProfile
from schemas.user import (
    UserProfileResponse, UserProfileUpdate, FinancialProfileCreate,
    FinancialProfileResponse, PasswordUpdate
)
from routers.auth import get_current_user
from utils.security import verify_password, get_password_hash
from utils.validators import validate_email, validate_phone

router = APIRouter(prefix="/api/user", tags=["user"])


@router.get("/profile", response_model=UserProfileResponse)
async def get_profile(current_user: User = Depends(get_current_user)):
    """Get current user's profile."""
    return current_user


@router.put("/profile", response_model=UserProfileResponse)
async def update_profile(
    profile_data: UserProfileUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update user profile."""
    if profile_data.email and profile_data.email != current_user.email:
        existing = db.query(User).filter(User.email == profile_data.email).first()
        if existing:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email already in use"
            )
        if not validate_email(profile_data.email):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid email format"
            )
        current_user.email = profile_data.email
    
    if profile_data.phone and not validate_phone(profile_data.phone):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid phone number format"
        )
    
    if profile_data.full_name:
        current_user.full_name = profile_data.full_name
    if profile_data.phone is not None:
        current_user.phone = profile_data.phone
    
    db.commit()
    db.refresh(current_user)
    return current_user


@router.put("/password")
async def update_password(
    password_data: PasswordUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update user password."""
    if not verify_password(password_data.current_password, current_user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Current password is incorrect"
        )
    
    is_valid, error = validate_password(password_data.new_password)
    if not is_valid:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=error
        )
    
    current_user.password_hash = get_password_hash(password_data.new_password)
    db.commit()
    
    return {"message": "Password updated successfully"}


@router.get("/export-data")
async def export_user_data(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Export all user data as JSON."""
    from models.category import Category
    from models.budget import Budget
    from models.transaction import Transaction
    from models.life_event import LifeEvent
    from models.ai_insight import AIInsight
    from models.alert import Alert
    
    profile = db.query(FinancialProfile).filter(
        FinancialProfile.user_id == current_user.id
    ).first()
    
    categories = db.query(Category).filter(Category.user_id == current_user.id).all()
    budgets = db.query(Budget).filter(Budget.user_id == current_user.id).all()
    transactions = db.query(Transaction).filter(Transaction.user_id == current_user.id).all()
    life_events = db.query(LifeEvent).filter(LifeEvent.user_id == current_user.id).all()
    insights = db.query(AIInsight).filter(AIInsight.user_id == current_user.id).all()
    alerts = db.query(Alert).filter(Alert.user_id == current_user.id).all()
    
    return {
        "user": {
            "username": current_user.username,
            "full_name": current_user.full_name,
            "email": current_user.email,
            "phone": current_user.phone,
            "created_at": current_user.created_at.isoformat() if current_user.created_at else None,
        },
        "financial_profile": {
            "monthly_income": float(profile.monthly_income) if profile and profile.monthly_income else None,
            "current_savings": float(profile.current_savings) if profile and profile.current_savings else None,
            "financial_goals": profile.financial_goals if profile else None,
            "currency": profile.currency if profile else "USD",
        },
        "categories": [
            {
                "id": str(cat.id),
                "name": cat.name,
                "icon": cat.icon,
                "color": cat.color,
                "is_default": cat.is_default,
            }
            for cat in categories
        ],
        "budgets": [
            {
                "id": str(b.id),
                "category_id": str(b.category_id),
                "monthly_limit": float(b.monthly_limit),
                "budget_period": b.budget_period,
                "rollover_enabled": b.rollover_enabled,
            }
            for b in budgets
        ],
        "transactions": [
            {
                "id": str(t.id),
                "category_id": str(t.category_id) if t.category_id else None,
                "amount": float(t.amount),
                "description": t.description,
                "transaction_date": t.transaction_date.isoformat() if t.transaction_date else None,
                "payment_method": t.payment_method,
                "is_recurring": t.is_recurring,
            }
            for t in transactions
        ],
        "life_events": [
            {
                "id": str(e.id),
                "event_type": e.event_type,
                "event_date": e.event_date.isoformat() if e.event_date else None,
                "description": e.description,
            }
            for e in life_events
        ],
        "ai_insights": [
            {
                "id": str(i.id),
                "insight_type": i.insight_type,
                "content": i.content,
                "created_at": i.created_at.isoformat() if i.created_at else None,
            }
            for i in insights
        ],
        "alerts": [
            {
                "id": str(a.id),
                "alert_type": a.alert_type,
                "title": a.title,
                "message": a.message,
                "severity": a.severity,
                "created_at": a.created_at.isoformat() if a.created_at else None,
            }
            for a in alerts
        ],
        "exported_at": datetime.utcnow().isoformat(),
    }


@router.get("/financial-profile", response_model=FinancialProfileResponse)
async def get_financial_profile(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get user's financial profile."""
    profile = db.query(FinancialProfile).filter(
        FinancialProfile.user_id == current_user.id
    ).first()
    
    if not profile:
        # Create default profile
        profile = FinancialProfile(
            user_id=current_user.id,
            currency="USD"
        )
        db.add(profile)
        db.commit()
        db.refresh(profile)
    
    return profile


@router.put("/financial-profile", response_model=FinancialProfileResponse)
async def update_financial_profile(
    profile_data: FinancialProfileCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update user's financial profile."""
    profile = db.query(FinancialProfile).filter(
        FinancialProfile.user_id == current_user.id
    ).first()
    
    if not profile:
        profile = FinancialProfile(user_id=current_user.id)
        db.add(profile)
    
    if profile_data.monthly_income is not None:
        profile.monthly_income = profile_data.monthly_income
    if profile_data.current_savings is not None:
        profile.current_savings = profile_data.current_savings
    if profile_data.financial_goals is not None:
        profile.financial_goals = profile_data.financial_goals
    if profile_data.currency:
        profile.currency = profile_data.currency
    
    db.commit()
    db.refresh(profile)
    return profile


@router.delete("/account")
async def delete_account(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Delete user account and all associated data."""
    db.delete(current_user)
    db.commit()
    return {"message": "Account deleted successfully"}

