import api from './api';

export interface SpendingTrendsData {
  dates: string[];
  amounts: number[];
}

export interface CategoryBreakdownData {
  name: string;
  value: number;
  percentage: number;
}

export interface IncomeVsExpensesData {
  income: number;
  expenses: number;
  savings: number;
}

export const reportService = {
  getSpendingTrends: async (startDate: string, endDate: string): Promise<SpendingTrendsData> => {
    const response = await api.get('/api/reports/spending-trends', {
      params: { start_date: startDate, end_date: endDate },
    });
    return response.data;
  },

  getCategoryBreakdown: async (startDate: string, endDate: string): Promise<CategoryBreakdownData[]> => {
    const response = await api.get('/api/reports/category-breakdown', {
      params: { start_date: startDate, end_date: endDate },
    });
    return response.data;
  },

  getIncomeVsExpenses: async (startDate: string, endDate: string): Promise<IncomeVsExpensesData> => {
    const response = await api.get('/api/reports/income-vs-expenses', {
      params: { start_date: startDate, end_date: endDate },
    });
    return response.data;
  },

  exportReport: async (format: 'pdf' | 'csv', startDate: string, endDate: string): Promise<Blob> => {
    const response = await api.post(
      '/api/reports/export',
      { format, start_date: startDate, end_date: endDate },
      { responseType: 'blob' }
    );
    return response.data;
  },
};

