export interface User {
  id: string;
  username: string;
  full_name: string;
  email: string;
  phone?: string;
  created_at: string;
}

export interface FinancialProfile {
  id: string;
  monthly_income?: number;
  current_savings?: number;
  financial_goals?: string;
  currency: string;
}

export interface Category {
  id: string;
  name: string;
  icon?: string;
  color?: string;
  is_default: boolean;
}

export interface Budget {
  id: string;
  category_id: string;
  monthly_limit: number;
  budget_period: string;
  rollover_enabled: boolean;
}

export interface BudgetStatus {
  category_id: string;
  category_name: string;
  budget_limit: number;
  spent: number;
  remaining: number;
  percentage_used: number;
}

export interface Transaction {
  id: string;
  category_id?: string;
  amount: number;
  description?: string;
  transaction_date: string;
  payment_method?: string;
  is_recurring: boolean;
  receipt_url?: string;
  created_at: string;
}

export interface Alert {
  id: string;
  alert_type: string;
  title: string;
  message: string;
  severity?: string;
  is_read: boolean;
  created_at: string;
}

export interface AIInsight {
  id: string;
  insight_type?: string;
  content: string;
  created_at: string;
  is_read: boolean;
}

export interface TokenResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
}

