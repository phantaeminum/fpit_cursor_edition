from pydantic import BaseModel, Field
from typing import Optional
from datetime import date, datetime
from uuid import UUID
from decimal import Decimal


class TransactionCreate(BaseModel):
    amount: Decimal = Field(..., gt=0)
    category_id: Optional[UUID] = None
    description: Optional[str] = None
    transaction_date: date = Field(default_factory=date.today)
    payment_method: Optional[str] = None
    is_recurring: bool = False
    receipt_url: Optional[str] = None


class TransactionUpdate(BaseModel):
    amount: Optional[Decimal] = Field(None, gt=0)
    category_id: Optional[UUID] = None
    description: Optional[str] = None
    transaction_date: Optional[date] = None
    payment_method: Optional[str] = None
    is_recurring: Optional[bool] = None
    receipt_url: Optional[str] = None


class TransactionResponse(BaseModel):
    id: UUID
    user_id: UUID
    category_id: Optional[UUID]
    amount: Decimal
    description: Optional[str]
    transaction_date: date
    payment_method: Optional[str]
    is_recurring: bool
    receipt_url: Optional[str]
    created_at: datetime
    
    class Config:
        from_attributes = True


class TransactionSummary(BaseModel):
    total_spent: Decimal
    total_transactions: int
    category_breakdown: dict[str, Decimal]

