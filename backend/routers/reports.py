from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from sqlalchemy import and_, func
from database import get_db
from models.transaction import Transaction
from models.category import Category
from models.user import FinancialProfile
from routers.auth import get_current_user
from models.user import User
from schemas.report import (
    DateRangeRequest, SpendingTrendsResponse, SpendingTrendDataPoint,
    CategoryBreakdownResponse, CategoryBreakdownItem,
    IncomeVsExpensesResponse, IncomeVsExpensesDataPoint
)
from typing import Optional
from datetime import date, datetime, timedelta
from decimal import Decimal

router = APIRouter(prefix="/api/reports", tags=["reports"])


def get_date_range(period: Optional[str] = None, start: Optional[date] = None, end: Optional[date] = None):
    """Calculate date range based on period or provided dates."""
    today = date.today()
    
    if period == "this_month":
        start_date = date(today.year, today.month, 1)
        end_date = today
    elif period == "last_month":
        if today.month == 1:
            start_date = date(today.year - 1, 12, 1)
            end_date = date(today.year - 1, 12, 31)
        else:
            start_date = date(today.year, today.month - 1, 1)
            end_date = date(today.year, today.month, 1) - timedelta(days=1)
    elif period == "last_3_months":
        start_date = today - timedelta(days=90)
        end_date = today
    elif period == "this_year":
        start_date = date(today.year, 1, 1)
        end_date = today
    else:
        start_date = start or (today - timedelta(days=30))
        end_date = end or today
    
    return start_date, end_date


@router.get("/spending-trends", response_model=SpendingTrendsResponse)
async def get_spending_trends(
    period: Optional[str] = Query(None),
    start_date: Optional[date] = Query(None),
    end_date: Optional[date] = Query(None),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get spending trends data."""
    start, end = get_date_range(period, start_date, end_date)
    
    # Get daily spending
    transactions = db.query(
        func.date(Transaction.transaction_date).label("date"),
        func.sum(Transaction.amount).label("total")
    ).filter(
        and_(
            Transaction.user_id == current_user.id,
            Transaction.transaction_date >= start,
            Transaction.transaction_date <= end
        )
    ).group_by(func.date(Transaction.transaction_date)).order_by("date").all()
    
    data_points = [
        SpendingTrendDataPoint(date=row.date.isoformat(), amount=row.total or Decimal(0))
        for row in transactions
    ]
    
    return SpendingTrendsResponse(data=data_points, period=period or "custom")


@router.get("/category-breakdown", response_model=CategoryBreakdownResponse)
async def get_category_breakdown(
    period: Optional[str] = Query(None),
    start_date: Optional[date] = Query(None),
    end_date: Optional[date] = Query(None),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get category breakdown."""
    start, end = get_date_range(period, start_date, end_date)
    
    # Get spending by category
    breakdown = db.query(
        Category.name,
        func.sum(Transaction.amount).label("total")
    ).join(
        Transaction, Transaction.category_id == Category.id
    ).filter(
        and_(
            Transaction.user_id == current_user.id,
            Transaction.transaction_date >= start,
            Transaction.transaction_date <= end
        )
    ).group_by(Category.name).all()
    
    total = sum(row.total or Decimal(0) for row in breakdown)
    
    items = []
    for row in breakdown:
        amount = row.total or Decimal(0)
        percentage = float((amount / total * 100) if total > 0 else 0)
        items.append(CategoryBreakdownItem(
            category_name=row.name,
            amount=amount,
            percentage=percentage
        ))
    
    return CategoryBreakdownResponse(breakdown=items, total=total)


@router.get("/income-vs-expenses", response_model=IncomeVsExpensesResponse)
async def get_income_vs_expenses(
    period: Optional[str] = Query(None),
    start_date: Optional[date] = Query(None),
    end_date: Optional[date] = Query(None),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get income vs expenses comparison."""
    start, end = get_date_range(period, start_date, end_date)
    
    # Get profile for income
    profile = db.query(FinancialProfile).filter(
        FinancialProfile.user_id == current_user.id
    ).first()
    
    monthly_income = Decimal(profile.monthly_income) if profile and profile.monthly_income else Decimal(0)
    
    # Calculate number of months
    months = (end.year - start.year) * 12 + (end.month - start.month) + 1
    total_income = monthly_income * months
    
    # Get total expenses
    total_expenses = db.query(func.sum(Transaction.amount)).filter(
        and_(
            Transaction.user_id == current_user.id,
            Transaction.transaction_date >= start,
            Transaction.transaction_date <= end
        )
    ).scalar() or Decimal(0)
    
    savings = total_income - total_expenses
    
    data_points = [IncomeVsExpensesDataPoint(
        period=period or "custom",
        income=total_income,
        expenses=total_expenses,
        savings=savings
    )]
    
    return IncomeVsExpensesResponse(data=data_points)


@router.post("/export")
async def export_report(
    format: str = "csv",
    period: Optional[str] = None,
    start_date: Optional[date] = None,
    end_date: Optional[date] = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Export report as PDF or CSV (simplified - returns JSON for now)."""
    start, end = get_date_range(period, start_date, end_date)
    
    transactions = db.query(Transaction).filter(
        and_(
            Transaction.user_id == current_user.id,
            Transaction.transaction_date >= start,
            Transaction.transaction_date <= end
        )
    ).all()
    
    # In a full implementation, this would generate actual CSV/PDF
    # For now, return JSON data
    return {
        "format": format,
        "period": period or "custom",
        "start_date": start.isoformat(),
        "end_date": end.isoformat(),
        "transactions": [
            {
                "date": txn.transaction_date.isoformat(),
                "amount": float(txn.amount),
                "description": txn.description,
                "category": db.query(Category).filter(Category.id == txn.category_id).first().name if txn.category_id else "Uncategorized"
            }
            for txn in transactions
        ]
    }

