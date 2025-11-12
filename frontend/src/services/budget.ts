import api from './api';
import { Budget, BudgetStatus } from '../types';

export interface BudgetCreate {
  category_id: string;
  monthly_limit: number;
  budget_period?: string;
  rollover_enabled?: boolean;
}

export interface BudgetUpdate {
  monthly_limit?: number;
  budget_period?: string;
  rollover_enabled?: boolean;
}

export const budgetService = {
  getAll: async (): Promise<Budget[]> => {
    const response = await api.get('/api/budget');
    return response.data;
  },

  getStatus: async (): Promise<BudgetStatus[]> => {
    const response = await api.get('/api/budget/status');
    return response.data;
  },

  create: async (data: BudgetCreate): Promise<Budget> => {
    const response = await api.post('/api/budget', data);
    return response.data;
  },

  update: async (id: string, data: BudgetUpdate): Promise<Budget> => {
    const response = await api.put(`/api/budget/${id}`, data);
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/api/budget/${id}`);
  },
};

