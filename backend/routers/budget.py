from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import and_, func
from database import get_db
from models.budget import Budget
from models.category import Category
from models.transaction import Transaction
from routers.auth import get_current_user
from models.user import User
from schemas.budget import (
    BudgetCreate, BudgetUpdate, BudgetResponse, BudgetStatusResponse
)
from typing import List
from decimal import Decimal
from datetime import date

router = APIRouter(prefix="/api/budget", tags=["budget"])


@router.get("", response_model=List[BudgetResponse])
async def get_budgets(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get all budgets for current user."""
    budgets = db.query(Budget).filter(Budget.user_id == current_user.id).all()
    return budgets


@router.post("", response_model=BudgetResponse, status_code=status.HTTP_201_CREATED)
async def create_budget(
    budget_data: BudgetCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Create a new budget."""
    # Verify category belongs to user
    category = db.query(Category).filter(
        and_(
            Category.id == budget_data.category_id,
            Category.user_id == current_user.id
        )
    ).first()
    
    if not category:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Category not found"
        )
    
    # Check if budget already exists for this category
    existing = db.query(Budget).filter(
        and_(
            Budget.user_id == current_user.id,
            Budget.category_id == budget_data.category_id
        )
    ).first()
    
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Budget already exists for this category"
        )
    
    budget = Budget(
        user_id=current_user.id,
        category_id=budget_data.category_id,
        monthly_limit=budget_data.monthly_limit,
        budget_period=budget_data.budget_period,
        rollover_enabled=budget_data.rollover_enabled
    )
    
    db.add(budget)
    db.commit()
    db.refresh(budget)
    return budget


@router.put("/{budget_id}", response_model=BudgetResponse)
async def update_budget(
    budget_id: str,
    budget_data: BudgetUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update a budget."""
    budget = db.query(Budget).filter(
        and_(
            Budget.id == budget_id,
            Budget.user_id == current_user.id
        )
    ).first()
    
    if not budget:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Budget not found"
        )
    
    if budget_data.monthly_limit is not None:
        budget.monthly_limit = budget_data.monthly_limit
    if budget_data.budget_period is not None:
        budget.budget_period = budget_data.budget_period
    if budget_data.rollover_enabled is not None:
        budget.rollover_enabled = budget_data.rollover_enabled
    
    db.commit()
    db.refresh(budget)
    return budget


@router.delete("/{budget_id}")
async def delete_budget(
    budget_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Delete a budget."""
    budget = db.query(Budget).filter(
        and_(
            Budget.id == budget_id,
            Budget.user_id == current_user.id
        )
    ).first()
    
    if not budget:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Budget not found"
        )
    
    db.delete(budget)
    db.commit()
    return {"message": "Budget deleted successfully"}


@router.get("/status", response_model=List[BudgetStatusResponse])
async def get_budget_status(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get budget status (spent vs limit) for all categories."""
    # Get current month
    today = date.today()
    month_start = date(today.year, today.month, 1)
    
    budgets = db.query(Budget).filter(Budget.user_id == current_user.id).all()
    
    status_list = []
    for budget in budgets:
        # Calculate spent this month
        spent = db.query(func.sum(Transaction.amount)).filter(
            and_(
                Transaction.user_id == current_user.id,
                Transaction.category_id == budget.category_id,
                Transaction.transaction_date >= month_start
            )
        ).scalar() or Decimal(0)
        
        category = db.query(Category).filter(Category.id == budget.category_id).first()
        
        remaining = budget.monthly_limit - spent
        percentage_used = float((spent / budget.monthly_limit * 100) if budget.monthly_limit > 0 else 0)
        
        status_list.append(BudgetStatusResponse(
            category_id=budget.category_id,
            category_name=category.name if category else "Unknown",
            budget_limit=budget.monthly_limit,
            spent=spent,
            remaining=remaining,
            percentage_used=percentage_used
        ))
    
    return status_list


@router.post("/category", response_model=BudgetResponse, status_code=status.HTTP_201_CREATED)
async def add_category(
    category_data: dict,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Add a custom category (this endpoint is for adding category with budget)."""
    # This is handled by category router, but kept for compatibility
    pass

