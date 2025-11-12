import api from './api';
import { Alert } from '../types';

export interface AlertPreferences {
  email_enabled: boolean;
  in_app_enabled: boolean;
  warning_threshold: number;
  critical_threshold: number;
  unusual_spending_enabled: boolean;
  bill_reminders_enabled: boolean;
  weekly_summary_enabled: boolean;
}

export const alertService = {
  getAll: async (unreadOnly: boolean = false): Promise<Alert[]> => {
    const params = unreadOnly ? '?unread_only=true' : '';
    const response = await api.get(`/api/alerts${params}`);
    return response.data;
  },

  markAsRead: async (id: string): Promise<Alert> => {
    const response = await api.put(`/api/alerts/${id}/read`);
    return response.data;
  },

  markRead: async (id: string): Promise<Alert> => {
    const response = await api.put(`/api/alerts/${id}/read`);
    return response.data;
  },

  dismiss: async (id: string): Promise<void> => {
    await api.delete(`/api/alerts/${id}`);
  },

  getPreferences: async (): Promise<AlertPreferences> => {
    const response = await api.get('/api/alerts/preferences');
    return response.data;
  },

  updatePreferences: async (preferences: Partial<AlertPreferences>): Promise<AlertPreferences> => {
    const response = await api.put('/api/alerts/preferences', preferences);
    return response.data;
  },
};

