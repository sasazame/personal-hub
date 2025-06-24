import apiClient from '@/lib/api-client';
import { Note, CreateNoteDto, UpdateNoteDto, NotePage } from '@/types/note';

// Use the unified apiClient instance that includes OIDC support and proper token management
const api = apiClient;

export const notesService = {
  // Get notes with pagination
  async getNotes(page = 0, size = 10, sort = 'updatedAt,desc'): Promise<NotePage> {
    const response = await api.get<NotePage>('/notes', { 
      params: { 
        page: page.toString(),
        size: size.toString(),
        sort: sort
      } 
    });
    return response.data;
  },

  // Get all notes as array (for compatibility)
  async getAllNotes(): Promise<Note[]> {
    const response = await this.getNotes(0, 1000);
    return response.content;
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

  // Search notes
  async searchNotes(query: string): Promise<Note[]> {
    const response = await api.get<Note[]>('/notes/search', { 
      params: { query } 
    });
    return response.data;
  },

  // Get notes by tag
  async getNotesByTag(tag: string): Promise<Note[]> {
    const response = await api.get<Note[]>(`/notes/tag/${encodeURIComponent(tag)}`);
    return response.data;
  },

  // Get all unique tags
  async getTags(): Promise<string[]> {
    // Extract tags from all notes since backend doesn't have dedicated endpoint
    const allNotes = await this.getAllNotes();
    const tagSet = new Set<string>();
    allNotes.forEach(note => {
      note.tags.forEach(tag => tagSet.add(tag));
    });
    return Array.from(tagSet).sort();
  },

  // Get recently updated notes
  async getRecentNotes(limit: number = 5): Promise<Note[]> {
    const response = await this.getNotes(0, limit, 'updatedAt,desc');
    return response.content;
  },
};