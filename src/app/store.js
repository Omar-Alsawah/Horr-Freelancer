import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useAuthStore = create(
  persist(
    (set) => ({
      token: null,
      user: null,
      login: (token, user = null) => set({ token, user }),
      logout: () => set({ token: null, user: null }),
    }),
    {
      name: 'horr_token',
      partialize: (state) => ({ token: state.token, user: state.user }),
    }
  )
);
