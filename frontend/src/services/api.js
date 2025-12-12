import axios from 'axios';

const API_BASE_URL = 'http://localhost:3333';

const api = axios.create({
  baseURL: API_BASE_URL,
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('session_token');
  if (token) {
    config.headers['X-Authorization'] = token;
  }
  return config;
});

export const authAPI = {
  register: (userData) => api.post('/users', userData),
  login: (credentials) => api.post('/login', credentials),
  logout: () => api.post('/logout'),
};

export const usersAPI = {
  getById: (id) => api.get(`/users/${id}`),
};

export const itemsAPI = {
  create: (itemData) => api.post('/item', itemData),
  getById: (id) => api.get(`/item/${id}`),
  search: (params) => api.get('/search', { params }),
};

export const bidsAPI = {
  place: (itemId, amount) => api.post(`/item/${itemId}/bid`, { amount }),
  getHistory: (itemId) => api.get(`/item/${itemId}/bid`),
};

export const questionsAPI = {
  ask: (itemId, question_text) => api.post(`/item/${itemId}/question`, { question_text }),
  getAll: (itemId) => api.get(`/item/${itemId}/question`),
  answer: (questionId, answer_text) => api.post(`/question/${questionId}`, { answer_text }),
};

export const categoriesAPI = {
  getAll: () => api.get('/categories'),
};

export default api;
