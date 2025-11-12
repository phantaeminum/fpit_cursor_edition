import api from './api';
import { Transaction } from '../types';

export interface TransactionCreate {
  category_id?: string;
  amount: number;
  description?: string;
  transaction_date: string;
  payment_method?: string;
  is_recurring?: boolean;
  receipt_url?: string;
}

export interface TransactionFilters {
  start_date?: string;
  end_date?: string;
  category_id?: string;
  limit?: number;
  offset?: number;
}

export const transactionService = {
  getAll: async (filters?: TransactionFilters): Promise<Transaction[]> => {
    const params = new URLSearchParams();
    if (filters?.start_date) params.append('start_date', filters.start_date);
    if (filters?.end_date) params.append('end_date', filters.end_date);
    if (filters?.category_id) params.append('category_id', filters.category_id);
    if (filters?.limit) params.append('limit', filters.limit.toString());
    if (filters?.offset) params.append('offset', filters.offset.toString());
    
    const response = await api.get(`/api/transactions?${params.toString()}`);
    return response.data;
  },

  getById: async (id: string): Promise<Transaction> => {
    const response = await api.get(`/api/transactions/${id}`);
    return response.data;
  },

  create: async (data: TransactionCreate): Promise<Transaction> => {
    const response = await api.post('/api/transactions', data);
    return response.data;
  },

  update: async (id: string, data: Partial<TransactionCreate>): Promise<Transaction> => {
    const response = await api.put(`/api/transactions/${id}`, data);
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/api/transactions/${id}`);
  },

  getSummary: async (start_date?: string, end_date?: string) => {
    const params = new URLSearchParams();
    if (start_date) params.append('start_date', start_date);
    if (end_date) params.append('end_date', end_date);
    
    const response = await api.get(`/api/transactions/summary?${params.toString()}`);
    return response.data;
  },
};

