const API_URL = 'http://localhost:3333';

export const getAuthToken = (): string | null => localStorage.getItem('vv_auth_token');
export const setAuthToken = (token: string): void => localStorage.setItem('vv_auth_token', token);
export const removeAuthToken = (): void => localStorage.removeItem('vv_auth_token');

interface FetchOptions extends RequestInit {
  headers?: Record<string, string>;
}

async function request<T>(endpoint: string, options: FetchOptions = {}): Promise<T> {
  const token = getAuthToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token) {
    headers['X-Authorization'] = token;
  }

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (response.status === 401) {
    removeAuthToken();
    window.location.hash = '#/login';
    throw new Error('Unauthorized');
  }

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: response.statusText }));
    throw new Error(errorData.error_message || errorData.message || `API Error: ${response.statusText}`);
  }

  if (response.status === 204 || response.status === 200) {
    const text = await response.text();
    return text ? JSON.parse(text) : {} as T;
  }

  return response.json();
}

export const api = {
  // Auth
  login: (data: any) => request<{ token: string; user: any }>('/login', {
    method: 'POST',
    body: JSON.stringify(data)
  }),

  register: (data: any) => request<{ token: string; user: any }>('/users', {
    method: 'POST',
    body: JSON.stringify(data)
  }),

  logout: () => request('/logout', { method: 'POST' }),

  // Categories
  getCategories: () => request<any[]>('/categories'),

  // Items
  searchItems: (params: any) => {
    const query = new URLSearchParams();
    Object.keys(params).forEach(key => {
      if (params[key] !== undefined && params[key] !== null && params[key] !== '') {
        query.append(key, String(params[key]));
      }
    });
    return request<any[]>(`/search?${query.toString()}`);
  },

  getItem: (id: number) => request<any>(`/item/${id}`),

  createItem: (data: any) => request<any>('/item', {
    method: 'POST',
    body: JSON.stringify(data)
  }),

  // Bids
  placeBid: (itemId: number, amount: number) => request(`/item/${itemId}/bid`, {
    method: 'POST',
    body: JSON.stringify({ amount })
  }),

  getItemBids: (itemId: number) => request<any[]>(`/item/${itemId}/bid`),

  // Questions
  postQuestion: (itemId: number, text: string) => request(`/item/${itemId}/question`, {
    method: 'POST',
    body: JSON.stringify({ question_text: text })
  }),

  answerQuestion: (questionId: number, text: string) => request(`/question/${questionId}`, {
    method: 'POST',
    body: JSON.stringify({ answer_text: text })
  }),

  getQuestions: (itemId: number) => request<any[]>(`/item/${itemId}/question`),
};
