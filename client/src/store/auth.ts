import { create } from 'zustand';
import { api } from '@/lib/api';
import type { User } from '@/types';

interface AuthState {
  user: User | null;
  loading: boolean;
  initialized: boolean;
  error: string | null;

  init: () => Promise<void>;
  login: (email: string, password: string) => Promise<boolean>;
  register: (data: { name: string; email: string; password: string }) => Promise<boolean>;
  logout: () => Promise<void>;
  clearError: () => void;
}

function pickError(e: unknown, fallback: string): string {
  const ax = e as { response?: { data?: { error?: string } } };
  return ax.response?.data?.error ?? fallback;
}

export const useAuth = create<AuthState>((set) => ({
  user: null,
  loading: false,
  initialized: false,
  error: null,

  async init() {
    try {
      const { data } = await api.get<{ user: User }>('/auth/me');
      set({ user: data.user, initialized: true });
    } catch {
      set({ user: null, initialized: true });
    }
  },

  async login(email, password) {
    set({ loading: true, error: null });
    try {
      const { data } = await api.post<{ user: User }>('/auth/login', { email, password });
      set({ user: data.user, loading: false });
      return true;
    } catch (e) {
      set({ loading: false, error: pickError(e, 'Не удалось войти') });
      return false;
    }
  },

  async register(input) {
    set({ loading: true, error: null });
    try {
      const { data } = await api.post<{ user: User }>('/auth/register', input);
      set({ user: data.user, loading: false });
      return true;
    } catch (e) {
      set({ loading: false, error: pickError(e, 'Не удалось зарегистрироваться') });
      return false;
    }
  },

  async logout() {
    try {
      await api.post('/auth/logout');
    } catch {
      // ignore
    }
    set({ user: null });
  },

  clearError: () => set({ error: null }),
}));
