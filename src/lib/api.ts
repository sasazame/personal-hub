import axios from 'axios';
import { Todo, CreateTodoDto, UpdateTodoDto, PaginatedResponse, PaginationParams, TodoStatus } from '@/types/todo';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api/v1';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Handle token expiration
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      
      // Redirect to login if not already there
      if (typeof window !== 'undefined' && !window.location.pathname.includes('/login')) {
        // Use replace to prevent going back to unauthorized page
        window.location.replace('/login');
      }
    }
    return Promise.reject(error);
  }
);

export const todoApi = {
  getAll: async (params?: PaginationParams): Promise<PaginatedResponse<Todo>> => {
    const response = await api.get<PaginatedResponse<Todo>>('/todos', { params });
    return response.data;
  },

  getById: async (id: number): Promise<Todo> => {
    const response = await api.get<Todo>(`/todos/${id}`);
    return response.data;
  },

  create: async (dto: CreateTodoDto): Promise<Todo> => {
    const response = await api.post<Todo>('/todos', dto);
    return response.data;
  },

  update: async (id: number, dto: UpdateTodoDto): Promise<Todo> => {
    const response = await api.put<Todo>(`/todos/${id}`, dto);
    return response.data;
  },

  delete: async (id: number): Promise<void> => {
    await api.delete(`/todos/${id}`);
  },

  getByStatus: async (status: TodoStatus): Promise<Todo[]> => {
    const response = await api.get<Todo[]>(`/todos/status/${status}`);
    return response.data;
  },

  getChildren: async (parentId: number): Promise<Todo[]> => {
    const response = await api.get<Todo[]>(`/todos/${parentId}/children`);
    return response.data;
  },

  // Recurring tasks API
  getRepeatable: async (): Promise<Todo[]> => {
    const response = await api.get<Todo[]>('/todos/repeatable');
    return response.data;
  },

  getInstances: async (originalTodoId: number): Promise<Todo[]> => {
    const response = await api.get<Todo[]>(`/todos/${originalTodoId}/instances`);
    return response.data;
  },

  generateInstances: async (): Promise<Todo[]> => {
    const response = await api.post<Todo[]>('/todos/repeat/generate');
    return response.data;
  },

  toggleStatus: async (id: number): Promise<Todo> => {
    const response = await api.post<Todo>(`/todos/${id}/toggle-status`);
    return response.data;
  },
};

export default api;