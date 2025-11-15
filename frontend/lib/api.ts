import axios from 'axios';

// API Configuration
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Clear tokens and redirect to login
      if (typeof window !== 'undefined') {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('idToken');
        localStorage.removeItem('refreshToken');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  signup: async (email: string, password: string, name: string) => {
    const response = await api.post('/auth/signup', { email, password, name });
    return response.data;
  },
  
  login: async (email: string, password: string) => {
    const response = await api.post('/auth/login', { email, password });
    return response.data;
  },
  
  confirmSignup: async (email: string, confirmationCode: string) => {
    const response = await api.post('/auth/confirm', { email, confirmationCode });
    return response.data;
  },
  
  refreshToken: async (refreshToken: string) => {
    const response = await api.post('/auth/refresh', { refreshToken });
    return response.data;
  },
};

// Projects API
export const projectsAPI = {
  list: async () => {
    const response = await api.get('/projects');
    return response.data;
  },
  
  get: async (projectId: string) => {
    const response = await api.get(`/projects/${projectId}`);
    return response.data;
  },
  
  create: async (name: string, description?: string) => {
    const response = await api.post('/projects', { name, description });
    return response.data;
  },
  
  update: async (projectId: string, name?: string, description?: string) => {
    const response = await api.put(`/projects/${projectId}`, { name, description });
    return response.data;
  },
  
  delete: async (projectId: string) => {
    await api.delete(`/projects/${projectId}`);
  },
};

// Tasks API
export const tasksAPI = {
  list: async (projectId: string) => {
    const response = await api.get(`/projects/${projectId}/tasks`);
    return response.data;
  },
  
  get: async (taskId: string) => {
    const response = await api.get(`/tasks/${taskId}`);
    return response.data;
  },
  
  create: async (projectId: string, title: string, description?: string, status?: string) => {
    const response = await api.post(`/projects/${projectId}/tasks`, {
      title,
      description,
      status: status || 'pending',
    });
    return response.data;
  },
  
  update: async (taskId: string, title?: string, description?: string, status?: string) => {
    const response = await api.put(`/tasks/${taskId}`, { title, description, status });
    return response.data;
  },
  
  delete: async (taskId: string) => {
    await api.delete(`/tasks/${taskId}`);
  },
};

export default api;

