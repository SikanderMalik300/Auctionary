import { defineStore } from 'pinia';
import { authAPI } from '@/services/api';

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null,
    token: localStorage.getItem('session_token'),
    userId: localStorage.getItem('user_id'),
  }),

  getters: {
    isAuthenticated: (state) => !!state.token,
  },

  actions: {
    async register(userData) {
      const response = await authAPI.register(userData);
      return response.data;
    },

    async login(credentials) {
      const response = await authAPI.login(credentials);
      this.token = response.data.session_token;
      this.userId = response.data.user_id;
      localStorage.setItem('session_token', this.token);
      localStorage.setItem('user_id', this.userId);
    },

    async logout() {
      try {
        await authAPI.logout();
      } catch (error) {
        // Ignore logout errors
      }
      this.token = null;
      this.userId = null;
      this.user = null;
      localStorage.removeItem('session_token');
      localStorage.removeItem('user_id');
    },
  },
});
