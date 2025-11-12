import api from './api';
import { Category } from '../types';

export interface CategoryCreate {
  name: string;
  icon?: string;
  color?: string;
}

export const categoryService = {
  getAll: async (): Promise<Category[]> => {
    const response = await api.get('/api/categories');
    return response.data;
  },

  create: async (data: CategoryCreate): Promise<Category> => {
    const response = await api.post('/api/categories', data);
    return response.data;
  },

  update: async (id: string, data: Partial<CategoryCreate>): Promise<Category> => {
    const response = await api.put(`/api/categories/${id}`, data);
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/api/categories/${id}`);
  },
};

