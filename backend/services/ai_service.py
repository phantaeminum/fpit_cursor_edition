import json
from typing import List, Dict, Any
from decimal import Decimal
from datetime import datetime, timedelta
from config import settings
from schemas.ai import BudgetRecommendation, AIAnalysisResponse
import openai
import anthropic


class AIService:
    def __init__(self):
        if settings.AI_PROVIDER == "openai" and settings.OPENAI_API_KEY:
            openai.api_key = settings.OPENAI_API_KEY
            self.client = openai.OpenAI(api_key=settings.OPENAI_API_KEY)
            self.provider = "openai"
        elif settings.AI_PROVIDER == "anthropic" and settings.ANTHROPIC_API_KEY:
            self.client = anthropic.Anthropic(api_key=settings.ANTHROPIC_API_KEY)
            self.provider = "anthropic"
        else:
            self.client = None
            self.provider = None
    
    def _format_transactions_for_ai(self, transactions: List[Dict]) -> str:
        """Format transaction data for AI analysis."""
        formatted = []
        for txn in transactions:
            formatted.append(
                f"Date: {txn['date']}, Category: {txn.get('category', 'Uncategorized')}, "
                f"Amount: ${txn['amount']}, Description: {txn.get('description', 'N/A')}"
            )
        return "\n".join(formatted)
    
    def analyze_spending_patterns(
        self,
        transactions: List[Dict],
        monthly_income: Decimal,
        current_budgets: Dict[str, Decimal],
        months: int = 6
    ) -> AIAnalysisResponse:
        """
        Analyze spending patterns and generate budget recommendations.
        Falls back to rule-based recommendations if AI is unavailable.
        """
        if not self.client:
            return self._rule_based_recommendations(transactions, monthly_income, current_budgets)
        
        try:
            prompt = f"""Analyze the following spending data for the past {months} months:
            
{self._format_transactions_for_ai(transactions)}

The user's monthly income is ${monthly_income}.
Current budget limits: {json.dumps({k: str(v) for k, v in current_budgets.items()})}

Provide:
1. Realistic budget recommendations per category (as JSON array with category_name, recommended_limit, reasoning)
2. Key spending patterns identified (as JSON array of strings)
3. Specific actionable suggestions to optimize spending (as JSON array of strings)

Format your response as JSON:
{{
  "recommendations": [
    {{"category_name": "...", "recommended_limit": 0.0, "reasoning": "..."}}
  ],
  "patterns": ["pattern1", "pattern2"],
  "suggestions": ["suggestion1", "suggestion2"]
}}"""

            if self.provider == "openai":
                response = self.client.chat.completions.create(
                    model="gpt-4",
                    messages=[
                        {"role": "system", "content": "You are a financial advisor AI that provides budget recommendations based on spending data."},
                        {"role": "user", "content": prompt}
                    ],
                    temperature=0.7,
                    response_format={"type": "json_object"}
                )
                result = json.loads(response.choices[0].message.content)
            else:  # anthropic
                response = self.client.messages.create(
                    model="claude-3-opus-20240229",
                    max_tokens=2000,
                    messages=[
                        {"role": "user", "content": prompt}
                    ]
                )
                result = json.loads(response.content[0].text)
            
            # Convert to response format
            recommendations = [
                BudgetRecommendation(
                    category_id=None,  # Will be set by caller
                    category_name=rec["category_name"],
                    recommended_limit=Decimal(str(rec["recommended_limit"])),
                    reasoning=rec["reasoning"]
                )
                for rec in result.get("recommendations", [])
            ]
            
            return AIAnalysisResponse(
                recommendations=recommendations,
                patterns=result.get("patterns", []),
                suggestions=result.get("suggestions", [])
            )
        except Exception as e:
            # Fallback to rule-based
            return self._rule_based_recommendations(transactions, monthly_income, current_budgets)
    
    def _rule_based_recommendations(
        self,
        transactions: List[Dict],
        monthly_income: Decimal,
        current_budgets: Dict[str, Decimal]
    ) -> AIAnalysisResponse:
        """Fallback rule-based budget recommendations."""
        # Calculate average spending per category
        category_spending = {}
        for txn in transactions:
            category = txn.get("category", "Other")
            amount = Decimal(str(txn["amount"]))
            category_spending[category] = category_spending.get(category, Decimal(0)) + amount
        
        # Generate recommendations (110% of average spending, capped at 50% of income per category)
        recommendations = []
        for category, avg_spent in category_spending.items():
            recommended = avg_spent * Decimal("1.1")
            max_limit = monthly_income * Decimal("0.5")
            recommended = min(recommended, max_limit)
            
            recommendations.append(
                BudgetRecommendation(
                    category_id=None,
                    category_name=category,
                    recommended_limit=recommended,
                    reasoning=f"Based on your average spending of ${avg_spent:.2f} in this category"
                )
            )
        
        patterns = ["Spending patterns calculated from historical data"]
        suggestions = [
            "Consider setting budgets 10% above your average spending to allow for flexibility",
            "Review your top spending categories regularly"
        ]
        
        return AIAnalysisResponse(
            recommendations=recommendations,
            patterns=patterns,
            suggestions=suggestions
        )
    
    def adapt_budget_for_life_event(
        self,
        event_type: str,
        event_description: str,
        current_budgets: Dict[str, Decimal],
        spending_patterns: Dict[str, Decimal]
    ) -> Dict[str, Any]:
        """Generate budget adjustments based on life events."""
        if not self.client:
            return self._rule_based_life_event_adjustment(event_type, current_budgets)
        
        try:
            prompt = f"""The user has experienced this life event: {event_type}
Description: {event_description}

Current budget: {json.dumps({k: str(v) for k, v in current_budgets.items()})}
Typical spending patterns: {json.dumps({k: str(v) for k, v in spending_patterns.items()})}

Suggest how their budget should be adjusted and explain why. Format as JSON:
{{
  "adjustments": [
    {{"category_name": "...", "new_limit": 0.0, "adjustment_percentage": 0.0, "reasoning": "..."}}
  ],
  "overall_advice": "..."
}}"""

            if self.provider == "openai":
                response = self.client.chat.completions.create(
                    model="gpt-4",
                    messages=[
                        {"role": "system", "content": "You are a financial advisor AI that helps adjust budgets based on life events."},
                        {"role": "user", "content": prompt}
                    ],
                    temperature=0.7,
                    response_format={"type": "json_object"}
                )
                result = json.loads(response.choices[0].message.content)
            else:  # anthropic
                response = self.client.messages.create(
                    model="claude-3-opus-20240229",
                    max_tokens=2000,
                    messages=[
                        {"role": "user", "content": prompt}
                    ]
                )
                result = json.loads(response.content[0].text)
            
            return result
        except Exception as e:
            return self._rule_based_life_event_adjustment(event_type, current_budgets)
    
    def _rule_based_life_event_adjustment(
        self,
        event_type: str,
        current_budgets: Dict[str, Decimal]
    ) -> Dict[str, Any]:
        """Fallback rule-based life event adjustments."""
        adjustments = []
        
        # Simple rule-based adjustments
        if "job" in event_type.lower() or "income" in event_type.lower():
            for category, limit in current_budgets.items():
                adjustments.append({
                    "category_name": category,
                    "new_limit": limit * Decimal("1.2"),
                    "adjustment_percentage": 20,
                    "reasoning": "Income increase allows for budget expansion"
                })
        elif "loss" in event_type.lower() or "unemployment" in event_type.lower():
            for category, limit in current_budgets.items():
                adjustments.append({
                    "category_name": category,
                    "new_limit": limit * Decimal("0.8"),
                    "adjustment_percentage": -20,
                    "reasoning": "Reduced income requires budget reduction"
                })
        
        return {
            "adjustments": adjustments,
            "overall_advice": "Consider reviewing your budget regularly after major life changes."
        }
    
    def generate_spending_insights(
        self,
        transactions: List[Dict],
        budgets: Dict[str, Decimal]
    ) -> List[str]:
        """Generate conversational insights about spending behavior."""
        if not self.client:
            return self._rule_based_insights(transactions, budgets)
        
        try:
            prompt = f"""Based on this month's transactions:
{self._format_transactions_for_ai(transactions)}

Compared to the budget:
{json.dumps({k: str(v) for k, v in budgets.items()})}

Generate 3-5 conversational insights about the user's spending behavior. Be specific, actionable, and encouraging. Format as JSON array of strings:
["insight1", "insight2", "insight3"]"""

            if self.provider == "openai":
                response = self.client.chat.completions.create(
                    model="gpt-4",
                    messages=[
                        {"role": "system", "content": "You are a friendly financial assistant that provides helpful spending insights."},
                        {"role": "user", "content": prompt}
                    ],
                    temperature=0.8,
                    response_format={"type": "json_object"}
                )
                result = json.loads(response.choices[0].message.content)
                return result.get("insights", [])
            else:  # anthropic
                response = self.client.messages.create(
                    model="claude-3-opus-20240229",
                    max_tokens=1000,
                    messages=[
                        {"role": "user", "content": prompt}
                    ]
                )
                result = json.loads(response.content[0].text)
                return json.loads(result) if isinstance(result, str) else result.get("insights", [])
        except Exception as e:
            return self._rule_based_insights(transactions, budgets)
    
    def _rule_based_insights(
        self,
        transactions: List[Dict],
        budgets: Dict[str, Decimal]
    ) -> List[str]:
        """Fallback rule-based insights."""
        total_spent = sum(Decimal(str(t["amount"])) for t in transactions)
        total_budget = sum(budgets.values())
        
        insights = []
        if total_spent > total_budget:
            insights.append(f"You've spent ${total_spent - total_budget:.2f} over your budget this month.")
        else:
            insights.append(f"Great job! You're ${total_budget - total_spent:.2f} under budget this month.")
        
        return insights
    
    def answer_question(self, question: str, context: Dict[str, Any]) -> str:
        """Answer a user's question about their budget/finances."""
        if not self.client:
            return "AI service is not configured. Please check your API keys."
        
        try:
            context_str = json.dumps(context, indent=2)
            prompt = f"""User's financial context:
{context_str}

User question: {question}

Provide a helpful, accurate answer about their budget and finances."""

            if self.provider == "openai":
                response = self.client.chat.completions.create(
                    model="gpt-4",
                    messages=[
                        {"role": "system", "content": "You are a helpful financial advisor AI."},
                        {"role": "user", "content": prompt}
                    ],
                    temperature=0.7
                )
                return response.choices[0].message.content
            else:  # anthropic
                response = self.client.messages.create(
                    model="claude-3-opus-20240229",
                    max_tokens=1000,
                    messages=[
                        {"role": "user", "content": prompt}
                    ]
                )
                return response.content[0].text
        except Exception as e:
            return f"Sorry, I encountered an error: {str(e)}"


ai_service = AIService()

