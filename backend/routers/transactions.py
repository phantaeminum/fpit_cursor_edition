from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from sqlalchemy import func, and_
from database import get_db
from models.transaction import Transaction
from models.category import Category
from routers.auth import get_current_user
from models.user import User
from schemas.transaction import (
    TransactionCreate, TransactionUpdate, TransactionResponse, TransactionSummary
)
from typing import Optional, List
from datetime import date, datetime, timedelta
from decimal import Decimal

router = APIRouter(prefix="/api/transactions", tags=["transactions"])


@router.post("", response_model=TransactionResponse, status_code=status.HTTP_201_CREATED)
async def create_transaction(
    transaction_data: TransactionCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Create a new transaction."""
    # Verify category belongs to user if provided
    if transaction_data.category_id:
        category = db.query(Category).filter(
            and_(
                Category.id == transaction_data.category_id,
                Category.user_id == current_user.id
            )
        ).first()
        if not category:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Category not found"
            )
    
    transaction = Transaction(
        user_id=current_user.id,
        category_id=transaction_data.category_id,
        amount=transaction_data.amount,
        description=transaction_data.description,
        transaction_date=transaction_data.transaction_date,
        payment_method=transaction_data.payment_method,
        is_recurring=transaction_data.is_recurring,
        receipt_url=transaction_data.receipt_url
    )
    
    db.add(transaction)
    db.commit()
    db.refresh(transaction)
    return transaction


@router.get("", response_model=List[TransactionResponse])
async def get_transactions(
    start_date: Optional[date] = Query(None),
    end_date: Optional[date] = Query(None),
    category_id: Optional[str] = Query(None),
    limit: int = Query(50, ge=1, le=100),
    offset: int = Query(0, ge=0),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get all transactions with optional filters."""
    query = db.query(Transaction).filter(Transaction.user_id == current_user.id)
    
    if start_date:
        query = query.filter(Transaction.transaction_date >= start_date)
    if end_date:
        query = query.filter(Transaction.transaction_date <= end_date)
    if category_id:
        query = query.filter(Transaction.category_id == category_id)
    
    query = query.order_by(Transaction.transaction_date.desc())
    transactions = query.offset(offset).limit(limit).all()
    
    return transactions


@router.get("/{transaction_id}", response_model=TransactionResponse)
async def get_transaction(
    transaction_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get a specific transaction."""
    transaction = db.query(Transaction).filter(
        and_(
            Transaction.id == transaction_id,
            Transaction.user_id == current_user.id
        )
    ).first()
    
    if not transaction:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Transaction not found"
        )
    
    return transaction


@router.put("/{transaction_id}", response_model=TransactionResponse)
async def update_transaction(
    transaction_id: str,
    transaction_data: TransactionUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update a transaction."""
    transaction = db.query(Transaction).filter(
        and_(
            Transaction.id == transaction_id,
            Transaction.user_id == current_user.id
        )
    ).first()
    
    if not transaction:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Transaction not found"
        )
    
    # Verify category if provided
    if transaction_data.category_id:
        category = db.query(Category).filter(
            and_(
                Category.id == transaction_data.category_id,
                Category.user_id == current_user.id
            )
        ).first()
        if not category:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Category not found"
            )
    
    # Update fields
    if transaction_data.amount is not None:
        transaction.amount = transaction_data.amount
    if transaction_data.category_id is not None:
        transaction.category_id = transaction_data.category_id
    if transaction_data.description is not None:
        transaction.description = transaction_data.description
    if transaction_data.transaction_date is not None:
        transaction.transaction_date = transaction_data.transaction_date
    if transaction_data.payment_method is not None:
        transaction.payment_method = transaction_data.payment_method
    if transaction_data.is_recurring is not None:
        transaction.is_recurring = transaction_data.is_recurring
    if transaction_data.receipt_url is not None:
        transaction.receipt_url = transaction_data.receipt_url
    
    db.commit()
    db.refresh(transaction)
    return transaction


@router.delete("/{transaction_id}")
async def delete_transaction(
    transaction_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Delete a transaction."""
    transaction = db.query(Transaction).filter(
        and_(
            Transaction.id == transaction_id,
            Transaction.user_id == current_user.id
        )
    ).first()
    
    if not transaction:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Transaction not found"
        )
    
    db.delete(transaction)
    db.commit()
    return {"message": "Transaction deleted successfully"}


@router.get("/summary/summary", response_model=TransactionSummary)
async def get_transaction_summary(
    start_date: Optional[date] = Query(None),
    end_date: Optional[date] = Query(None),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get spending summary for a period."""
    query = db.query(Transaction).filter(Transaction.user_id == current_user.id)
    
    if start_date:
        query = query.filter(Transaction.transaction_date >= start_date)
    if end_date:
        query = query.filter(Transaction.transaction_date <= end_date)
    
    # Total spent
    total_spent = db.query(func.sum(Transaction.amount)).filter(
        Transaction.user_id == current_user.id
    ).scalar() or Decimal(0)
    
    # Total transactions
    total_transactions = query.count()
    
    # Category breakdown
    category_breakdown = db.query(
        Category.name,
        func.sum(Transaction.amount).label("total")
    ).join(
        Transaction, Transaction.category_id == Category.id
    ).filter(
        Transaction.user_id == current_user.id
    ).group_by(Category.name).all()
    
    breakdown_dict = {cat: float(total) for cat, total in category_breakdown}
    
    return TransactionSummary(
        total_spent=total_spent,
        total_transactions=total_transactions,
        category_breakdown=breakdown_dict
    )

