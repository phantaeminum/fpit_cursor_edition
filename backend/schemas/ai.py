from pydantic import BaseModel
from typing import Optional
from datetime import datetime
from uuid import UUID
from decimal import Decimal


class AIAnalysisRequest(BaseModel):
    months: int = 6


class BudgetRecommendation(BaseModel):
    category_id: UUID
    category_name: str
    recommended_limit: Decimal
    reasoning: str


class AIAnalysisResponse(BaseModel):
    recommendations: list[BudgetRecommendation]
    patterns: list[str]
    suggestions: list[str]


class LifeEventRequest(BaseModel):
    event_type: str
    event_date: str  # ISO date string
    description: Optional[str] = None


class LifeEventResponse(BaseModel):
    id: UUID
    event_type: str
    event_date: str
    description: Optional[str]
    created_at: datetime
    
    class Config:
        from_attributes = True


class AIInsightResponse(BaseModel):
    id: UUID
    insight_type: Optional[str]
    content: str
    created_at: datetime
    is_read: bool
    
    class Config:
        from_attributes = True


class AIAskRequest(BaseModel):
    question: str


class AIAskResponse(BaseModel):
    answer: str

