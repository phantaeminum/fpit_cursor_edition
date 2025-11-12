from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime
from uuid import UUID


class AlertResponse(BaseModel):
    id: UUID
    alert_type: str
    title: str
    message: str
    severity: Optional[str]
    is_read: bool
    created_at: datetime
    
    class Config:
        from_attributes = True


class AlertPreferencesResponse(BaseModel):
    email_enabled: bool
    in_app_enabled: bool
    warning_threshold: float = 0.7
    critical_threshold: float = 0.9
    unusual_spending_enabled: bool = True
    bill_reminders_enabled: bool = True
    weekly_summary_enabled: bool = True


class AlertPreferencesUpdate(BaseModel):
    email_enabled: Optional[bool] = None
    in_app_enabled: Optional[bool] = None
    warning_threshold: Optional[float] = Field(None, ge=0, le=1)
    critical_threshold: Optional[float] = Field(None, ge=0, le=1)
    unusual_spending_enabled: Optional[bool] = None
    bill_reminders_enabled: Optional[bool] = None
    weekly_summary_enabled: Optional[bool] = None
