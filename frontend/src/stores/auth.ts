import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { api, getAuthToken, setAuthToken, removeAuthToken } from '../services/api';
import type { User } from '../types';

export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>(null);
  const isLoading = ref(true);

  const isAuthenticated = computed(() => !!user.value);

  // Hydrate user from localStorage
  function init() {
    const token = getAuthToken();
    const storedUser = localStorage.getItem('vv_user');
    if (token && storedUser) {
      try {
        user.value = JSON.parse(storedUser);
      } catch (e) {
        console.error('Failed to parse stored user', e);
      }
    }
    isLoading.value = false;
  }

  async function login(credentials: { email: string; password: string }) {
    try {
      const res = await api.login(credentials);
      setAuthToken(res.token);

      // Store user info
      const userData = res.user || {
        id: 0,
        username: 'User',
        email: credentials.email
      };
      user.value = userData;
      localStorage.setItem('vv_user', JSON.stringify(userData));
    } catch (error) {
      throw error;
    }
  }

  async function register(data: { username: string; email: string; password: string }) {
    try {
      const res = await api.register(data);
      setAuthToken(res.token);

      const userData = res.user || {
        id: 0,
        username: data.username,
        email: data.email
      };
      user.value = userData;
      localStorage.setItem('vv_user', JSON.stringify(userData));
    } catch (error) {
      throw error;
    }
  }

  function logout() {
    api.logout().catch(() => {});
    removeAuthToken();
    localStorage.removeItem('vv_user');
    user.value = null;
    window.location.hash = '#/';
  }

  // Initialize on store creation
  init();

  return {
    user,
    isLoading,
    isAuthenticated,
    login,
    register,
    logout
  };
});
