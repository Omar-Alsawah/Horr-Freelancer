import { create } from 'zustand';

export const useAuthStore = create((set) => ({
  user: null,
  token: localStorage.getItem('horr_token') || null,
  role: null,
  isAuthenticated: !!localStorage.getItem('horr_token'),
  login: (token, user) => {
    localStorage.setItem('horr_token', token);
    set({ token, user, role: user?.role, isAuthenticated: true });
  },
  logout: () => {
    localStorage.clear();
    set({ token: null, user: null, role: null, isAuthenticated: false });
  }
}));
