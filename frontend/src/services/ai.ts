import api from './api';

export interface AIAnalysisRequest {
  months: number;
}

export interface AIAnalysisResponse {
  recommendations: Array<{
    category_id?: string;
    category_name: string;
    recommended_limit: number;
    reasoning: string;
  }>;
  patterns: string[];
  suggestions: string[];
}

export interface LifeEventRequest {
  event_type: string;
  event_date: string;
  description?: string;
}

export interface AIInsight {
  id: string;
  insight_type?: string;
  content: string;
  created_at: string;
  is_read: boolean;
}

export interface AIAskRequest {
  question: string;
}

export interface AIAskResponse {
  answer: string;
}

export const aiService = {
  analyze: async (months: number = 6): Promise<AIAnalysisResponse> => {
    const response = await api.post('/api/ai/analyze', { months });
    return response.data;
  },

  logLifeEvent: async (data: LifeEventRequest) => {
    const response = await api.post('/api/ai/life-event', data);
    return response.data;
  },

  getInsights: async (): Promise<AIInsight[]> => {
    const response = await api.get('/api/ai/insights');
    return response.data;
  },

  ask: async (question: string): Promise<string> => {
    const response = await api.post('/api/ai/ask', { question });
    return response.data.answer;
  },
};

