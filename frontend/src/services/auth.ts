import api from './api';
import { TokenResponse, User, FinancialProfile } from '../types';

export const authService = {
  async register(data: {
    username: string;
    full_name: string;
    email: string;
    phone?: string;
    password: string;
    financial_profile?: {
      monthly_income?: number;
      current_savings?: number;
      financial_goals?: string;
      currency?: string;
    };
  }): Promise<TokenResponse> {
    const response = await api.post('/api/auth/register', data);
    return response.data;
  },

  async login(username: string, password: string): Promise<TokenResponse> {
    const formData = new FormData();
    formData.append('username', username);
    formData.append('password', password);
    
    const response = await api.post('/api/auth/login', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  async getProfile(): Promise<User> {
    const response = await api.get('/api/user/profile');
    return response.data;
  },

  async getFinancialProfile(): Promise<FinancialProfile> {
    const response = await api.get('/api/user/financial-profile');
    return response.data;
  },

  async updateFinancialProfile(data: Partial<FinancialProfile>): Promise<FinancialProfile> {
    const response = await api.put('/api/user/financial-profile', data);
    return response.data;
  },

  async updateProfile(data: Partial<User>): Promise<User> {
    const response = await api.put('/api/user/profile', data);
    return response.data;
  },

  async changePassword(currentPassword: string, newPassword: string): Promise<void> {
    await api.put('/api/user/profile', {
      current_password: currentPassword,
      new_password: newPassword,
    });
  },

  async deleteAccount(): Promise<void> {
    await api.delete('/api/user/account');
  },

  async exportData(): Promise<any> {
    const response = await api.get('/api/user/export-data');
    return response.data;
  },

  logout() {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
  },
};

