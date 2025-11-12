from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import and_, func
from database import get_db
from models.transaction import Transaction
from models.budget import Budget
from models.category import Category
from models.life_event import LifeEvent
from models.ai_insight import AIInsight
from models.user import FinancialProfile
from routers.auth import get_current_user
from models.user import User
from schemas.ai import (
    AIAnalysisRequest, AIAnalysisResponse, LifeEventRequest, LifeEventResponse,
    AIInsightResponse, AIAskRequest, AIAskResponse
)
from services.ai_service import ai_service
from typing import List
from datetime import datetime, timedelta
from decimal import Decimal

router = APIRouter(prefix="/api/ai", tags=["ai"])


@router.post("/analyze", response_model=AIAnalysisResponse)
async def analyze_spending(
    request: AIAnalysisRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Trigger AI analysis of spending patterns."""
    # Get transactions for the specified number of months
    end_date = datetime.now().date()
    start_date = end_date - timedelta(days=request.months * 30)
    
    transactions = db.query(Transaction).filter(
        and_(
            Transaction.user_id == current_user.id,
            Transaction.transaction_date >= start_date
        )
    ).all()
    
    # Format transactions for AI
    transaction_data = []
    for txn in transactions:
        category = db.query(Category).filter(Category.id == txn.category_id).first()
        transaction_data.append({
            "date": txn.transaction_date.isoformat(),
            "category": category.name if category else "Uncategorized",
            "amount": float(txn.amount),
            "description": txn.description or ""
        })
    
    # Get financial profile
    profile = db.query(FinancialProfile).filter(
        FinancialProfile.user_id == current_user.id
    ).first()
    
    monthly_income = Decimal(profile.monthly_income) if profile and profile.monthly_income else Decimal(0)
    
    # Get current budgets
    budgets = db.query(Budget).filter(Budget.user_id == current_user.id).all()
    current_budgets = {}
    for budget in budgets:
        category = db.query(Category).filter(Category.id == budget.category_id).first()
        if category:
            current_budgets[category.name] = budget.monthly_limit
    
    # Get AI analysis
    analysis = ai_service.analyze_spending_patterns(
        transaction_data,
        monthly_income,
        current_budgets,
        request.months
    )
    
    # Map category names to IDs
    categories_map = {cat.name: cat.id for cat in db.query(Category).filter(
        Category.user_id == current_user.id
    ).all()}
    
    for rec in analysis.recommendations:
        if rec.category_name in categories_map:
            rec.category_id = categories_map[rec.category_name]
    
    return analysis


@router.post("/life-event", response_model=LifeEventResponse)
async def log_life_event(
    event_data: LifeEventRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Log a life event and get AI-adjusted budget recommendations."""
    # Create life event
    event = LifeEvent(
        user_id=current_user.id,
        event_type=event_data.event_type,
        event_date=datetime.fromisoformat(event_data.event_date).date(),
        description=event_data.description
    )
    db.add(event)
    db.commit()
    db.refresh(event)
    
    # Get current budgets and spending patterns
    budgets = db.query(Budget).filter(Budget.user_id == current_user.id).all()
    current_budgets = {}
    spending_patterns = {}
    
    for budget in budgets:
        category = db.query(Category).filter(Category.id == budget.category_id).first()
        if category:
            current_budgets[category.name] = budget.monthly_limit
            
            # Calculate average spending
            avg_spent = db.query(func.avg(Transaction.amount)).filter(
                and_(
                    Transaction.user_id == current_user.id,
                    Transaction.category_id == budget.category_id
                )
            ).scalar() or Decimal(0)
            spending_patterns[category.name] = avg_spent
    
    # Get AI recommendations
    adjustments = ai_service.adapt_budget_for_life_event(
        event_data.event_type,
        event_data.description or "",
        current_budgets,
        spending_patterns
    )
    
    # Store insights
    insight = AIInsight(
        user_id=current_user.id,
        insight_type="life_event",
        content=f"Life event: {event_data.event_type}. {adjustments.get('overall_advice', '')}"
    )
    db.add(insight)
    db.commit()
    
    return event


@router.get("/insights", response_model=List[AIInsightResponse])
async def get_insights(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get latest AI insights and tips."""
    insights = db.query(AIInsight).filter(
        AIInsight.user_id == current_user.id
    ).order_by(AIInsight.created_at.desc()).limit(10).all()
    
    return insights


@router.post("/ask", response_model=AIAskResponse)
async def ask_ai(
    request: AIAskRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Ask AI a question about budget/finances."""
    # Gather context
    profile = db.query(FinancialProfile).filter(
        FinancialProfile.user_id == current_user.id
    ).first()
    
    budgets = db.query(Budget).filter(Budget.user_id == current_user.id).all()
    budget_data = {}
    for budget in budgets:
        category = db.query(Category).filter(Category.id == budget.category_id).first()
        if category:
            budget_data[category.name] = float(budget.monthly_limit)
    
    context = {
        "monthly_income": float(profile.monthly_income) if profile and profile.monthly_income else 0,
        "budgets": budget_data
    }
    
    answer = ai_service.answer_question(request.question, context)
    return AIAskResponse(answer=answer)

