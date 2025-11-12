from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from database import get_db
from models.alert import Alert
from routers.auth import get_current_user
from models.user import User
from schemas.alert import AlertResponse, AlertPreferencesResponse, AlertPreferencesUpdate
from typing import List

router = APIRouter(prefix="/api/alerts", tags=["alerts"])


@router.get("", response_model=List[AlertResponse])
async def get_alerts(
    unread_only: bool = False,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get all alerts/notifications for current user."""
    query = db.query(Alert).filter(Alert.user_id == current_user.id)
    
    if unread_only:
        query = query.filter(Alert.is_read == False)
    
    alerts = query.order_by(Alert.created_at.desc()).all()
    return alerts


@router.put("/{alert_id}/read", response_model=AlertResponse)
async def mark_alert_read(
    alert_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Mark an alert as read."""
    alert = db.query(Alert).filter(
        Alert.id == alert_id,
        Alert.user_id == current_user.id
    ).first()
    
    if not alert:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Alert not found"
        )
    
    alert.is_read = True
    db.commit()
    db.refresh(alert)
    return alert


@router.delete("/{alert_id}")
async def dismiss_alert(
    alert_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Dismiss/delete an alert."""
    alert = db.query(Alert).filter(
        Alert.id == alert_id,
        Alert.user_id == current_user.id
    ).first()
    
    if not alert:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Alert not found"
        )
    
    db.delete(alert)
    db.commit()
    return {"message": "Alert dismissed successfully"}


@router.get("/preferences", response_model=AlertPreferencesResponse)
async def get_alert_preferences(
    current_user: User = Depends(get_current_user)
):
    """Get notification preferences (stored in user settings - simplified for now)."""
    # In a full implementation, this would be stored in a user_settings table
    return AlertPreferencesResponse(
        email_enabled=True,
        in_app_enabled=True,
        warning_threshold=0.7,
        critical_threshold=0.9,
        unusual_spending_enabled=True,
        bill_reminders_enabled=True,
        weekly_summary_enabled=True
    )


@router.put("/preferences", response_model=AlertPreferencesResponse)
async def update_alert_preferences(
    preferences: AlertPreferencesUpdate,
    current_user: User = Depends(get_current_user)
):
    """Update notification preferences."""
    # In a full implementation, this would update a user_settings table
    return AlertPreferencesResponse(
        email_enabled=preferences.email_enabled if preferences.email_enabled is not None else True,
        in_app_enabled=preferences.in_app_enabled if preferences.in_app_enabled is not None else True,
        warning_threshold=preferences.warning_threshold if preferences.warning_threshold is not None else 0.7,
        critical_threshold=preferences.critical_threshold if preferences.critical_threshold is not None else 0.9,
        unusual_spending_enabled=preferences.unusual_spending_enabled if preferences.unusual_spending_enabled is not None else True,
        bill_reminders_enabled=preferences.bill_reminders_enabled if preferences.bill_reminders_enabled is not None else True,
        weekly_summary_enabled=preferences.weekly_summary_enabled if preferences.weekly_summary_enabled is not None else True
    )

