import { create } from 'zustand';
import { User, FinancialProfile } from '../types';
import { authService } from '../services/auth';

interface UserState {
  user: User | null;
  financialProfile: FinancialProfile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  setUser: (user: User | null) => void;
  setFinancialProfile: (profile: FinancialProfile | null) => void;
  loadUser: () => Promise<void>;
  logout: () => void;
}

export const useUserStore = create<UserState>((set, get) => ({
  user: null,
  financialProfile: null,
  isAuthenticated: false,
  isLoading: false,

  setUser: (user) => set({ user, isAuthenticated: !!user }),

  setFinancialProfile: (profile) => set({ financialProfile: profile }),

  loadUser: async () => {
    const token = localStorage.getItem('access_token');
    if (!token) {
      set({ user: null, financialProfile: null, isAuthenticated: false });
      return;
    }

    set({ isLoading: true });
    try {
      const [user, profile] = await Promise.all([
        authService.getProfile(),
        authService.getFinancialProfile().catch(() => null),
      ]);
      set({ user, financialProfile: profile, isAuthenticated: true });
    } catch (error) {
      set({ user: null, financialProfile: null, isAuthenticated: false });
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
    } finally {
      set({ isLoading: false });
    }
  },

  logout: () => {
    authService.logout();
    set({ user: null, financialProfile: null, isAuthenticated: false });
  },
}));

