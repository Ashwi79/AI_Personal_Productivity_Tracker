import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import api from '../utils/api';

const useAuthStore = create(
  persist(
    (set) => ({
      token: null,
      user: null,
      isAuthenticated: false,

      login: async (email, password) => {
        const res = await api.post('/api/auth/login', { email, password });
        const token = res.data.access_token;
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        set({ token, isAuthenticated: true });
      },

      register: async (name, email, password) => {
        await api.post('/api/auth/register', { name, email, password });
      },

      logout: () => {
        delete api.defaults.headers.common['Authorization'];
        set({ token: null, user: null, isAuthenticated: false });
      },

      restoreToken: (token) => {
        if (token) {
          api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
          set({ isAuthenticated: true });
        }
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ token: state.token }),
    }
  )
);

export default useAuthStore;
