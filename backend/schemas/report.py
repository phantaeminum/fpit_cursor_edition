from pydantic import BaseModel
from typing import Optional
from datetime import date
from decimal import Decimal


class DateRangeRequest(BaseModel):
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    period: Optional[str] = None  # "this_month", "last_month", "last_3_months", "this_year"


class SpendingTrendDataPoint(BaseModel):
    date: str
    amount: Decimal


class SpendingTrendsResponse(BaseModel):
    data: list[SpendingTrendDataPoint]
    period: str


class CategoryBreakdownItem(BaseModel):
    category_name: str
    amount: Decimal
    percentage: float


class CategoryBreakdownResponse(BaseModel):
    breakdown: list[CategoryBreakdownItem]
    total: Decimal


class IncomeVsExpensesDataPoint(BaseModel):
    period: str
    income: Decimal
    expenses: Decimal
    savings: Decimal


class IncomeVsExpensesResponse(BaseModel):
    data: list[IncomeVsExpensesDataPoint]

