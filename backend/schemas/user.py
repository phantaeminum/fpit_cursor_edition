from pydantic import BaseModel, EmailStr, Field
from typing import Optional
from datetime import datetime
from uuid import UUID


class FinancialProfileCreate(BaseModel):
    monthly_income: Optional[float] = None
    current_savings: Optional[float] = None
    financial_goals: Optional[str] = None
    currency: str = "USD"


class FinancialProfileResponse(BaseModel):
    id: UUID
    monthly_income: Optional[float]
    current_savings: Optional[float]
    financial_goals: Optional[str]
    currency: str
    
    class Config:
        from_attributes = True


class UserProfileResponse(BaseModel):
    id: UUID
    username: str
    full_name: str
    email: str
    phone: Optional[str]
    created_at: datetime
    
    class Config:
        from_attributes = True


class UserProfileUpdate(BaseModel):
    full_name: Optional[str] = Field(None, min_length=1, max_length=100)
    email: Optional[EmailStr] = None
    phone: Optional[str] = None


class PasswordUpdate(BaseModel):
    current_password: str
    new_password: str = Field(..., min_length=8)

