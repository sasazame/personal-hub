import apiClient from './api-client';
import { Todo, CreateTodoDto, UpdateTodoDto, PaginatedResponse, PaginationParams, TodoStatus } from '@/types/todo';

// Use the unified apiClient instance that includes OIDC support and proper token management
const api = apiClient;

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