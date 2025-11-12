from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime
from uuid import UUID
from decimal import Decimal


class BudgetCreate(BaseModel):
    category_id: UUID
    monthly_limit: Decimal = Field(..., gt=0)
    budget_period: str = "monthly"
    rollover_enabled: bool = False


class BudgetUpdate(BaseModel):
    monthly_limit: Optional[Decimal] = Field(None, gt=0)
    budget_period: Optional[str] = None
    rollover_enabled: Optional[bool] = None


class BudgetResponse(BaseModel):
    id: UUID
    user_id: UUID
    category_id: UUID
    monthly_limit: Decimal
    budget_period: str
    rollover_enabled: bool
    created_at: datetime
    
    class Config:
        from_attributes = True


class BudgetStatusResponse(BaseModel):
    category_id: UUID
    category_name: str
    budget_limit: Decimal
    spent: Decimal
    remaining: Decimal
    percentage_used: float


class BudgetTemplateCreate(BaseModel):
    name: str
    budgets: list[BudgetCreate]


class BudgetTemplateResponse(BaseModel):
    id: UUID
    name: str
    budgets: list[BudgetResponse]
    created_at: datetime

