import apiClient from '@/lib/api-client';
import { Note, CreateNoteDto, UpdateNoteDto, NoteFilters } from '@/types/note';

// Use the unified apiClient instance that includes OIDC support and proper token management
const api = apiClient;

export const notesService = {
  async getNotes(filters?: NoteFilters): Promise<Note[]> {
    const response = await api.get<Note[]>('/notes', { params: filters });
    return response.data;
  },

  async getNote(id: number): Promise<Note | null> {
    try {
      const response = await api.get<Note>(`/notes/${id}`);
      return response.data;
    } catch (error) {
      // Return null if note not found (404)
      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as { response: { status: number } };
        if (axiosError.response?.status === 404) {
          return null;
        }
      }
      throw error;
    }
  },

  async createNote(data: CreateNoteDto): Promise<Note> {
    const response = await api.post<Note>('/notes', data);
    return response.data;
  },

  async updateNote(id: number, data: UpdateNoteDto): Promise<Note> {
    const response = await api.put<Note>(`/notes/${id}`, data);
    return response.data;
  },

  async deleteNote(id: number): Promise<void> {
    await api.delete(`/notes/${id}`);
  },

  async togglePin(id: number): Promise<Note> {
    const response = await api.post<Note>(`/notes/${id}/toggle-pin`);
    return response.data;
  },

  // Get all unique categories
  async getCategories(): Promise<string[]> {
    const response = await api.get<string[]>('/notes/categories');
    return response.data;
  },

  // Get all unique tags
  async getTags(): Promise<string[]> {
    const response = await api.get<string[]>('/notes/tags');
    return response.data;
  },

  // Get recently updated notes
  async getRecentNotes(limit: number = 5): Promise<Note[]> {
    const response = await api.get<Note[]>('/notes/recent', { params: { limit } });
    return response.data;
  },
};