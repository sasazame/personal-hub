import apiClient from '@/lib/api-client';
import { Moment, CreateMomentDto, UpdateMomentDto, MomentPage } from '@/types/moment';

// Use the unified apiClient instance that includes OIDC support and proper token management
const api = apiClient;

export const momentsService = {
  // Get moments with pagination
  async getMoments(page = 0, size = 20, sort = 'createdAt,desc'): Promise<MomentPage> {
    const response = await api.get<MomentPage>('/moments', { 
      params: { 
        page: page.toString(),
        size: size.toString(),
        sort: sort
      } 
    });
    return response.data;
  },

  // Get all moments as array (for compatibility)
  // LIMITATION: This method has a hardcoded limit of 1000 moments
  // This can cause issues with large datasets where moments beyond the 1000th won't be retrieved
  // TODO: Consider implementing a paginated approach or remove this limitation
  async getAllMoments(): Promise<Moment[]> {
    const response = await this.getMoments(0, 1000);
    return response.content;
  },

  // Get moments by date range with pagination
  async getMomentsByDateRange(
    startDate: string, 
    endDate: string, 
    page = 0, 
    size = 20, 
    sort = 'createdAt,desc'
  ): Promise<MomentPage> {
    const response = await api.get<MomentPage>('/moments/range', { 
      params: { 
        startDate,
        endDate,
        page: page.toString(),
        size: size.toString(),
        sort: sort
      } 
    });
    return response.data;
  },

  async getMoment(id: number): Promise<Moment | null> {
    try {
      const response = await api.get<Moment>(`/moments/${id}`);
      return response.data;
    } catch (error) {
      // Return null if moment not found (404)
      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as { response: { status: number } };
        if (axiosError.response?.status === 404) {
          return null;
        }
      }
      throw error;
    }
  },

  async createMoment(data: CreateMomentDto): Promise<Moment> {
    const response = await api.post<Moment>('/moments', data);
    return response.data;
  },

  async updateMoment(id: number, data: UpdateMomentDto): Promise<Moment> {
    const response = await api.put<Moment>(`/moments/${id}`, data);
    return response.data;
  },

  async deleteMoment(id: number): Promise<void> {
    await api.delete(`/moments/${id}`);
  },

  // Search moments
  async searchMoments(query: string, tag?: string): Promise<Moment[]> {
    const params: Record<string, string> = { query };
    if (tag) {
      params.tag = tag;
    }
    const response = await api.get<Moment[]>('/moments/search', { params });
    return response.data;
  },

  // Get moments by tag
  async getMomentsByTag(tag: string): Promise<Moment[]> {
    const response = await api.get<Moment[]>(`/moments/tag/${encodeURIComponent(tag)}`);
    return response.data;
  },

  // Get default tags
  async getDefaultTags(): Promise<string[]> {
    const response = await api.get<string[]>('/moments/tags/default');
    return response.data;
  },

  // Get all unique tags
  async getTags(): Promise<string[]> {
    // Get default tags first
    const defaultTags = await this.getDefaultTags();
    
    // Extract custom tags from all moments
    const allMoments = await this.getAllMoments();
    const tagSet = new Set<string>(defaultTags);
    allMoments.forEach(moment => {
      moment.tags.forEach(tag => tagSet.add(tag));
    });
    return Array.from(tagSet).sort();
  },

  // Get recently created moments
  async getRecentMoments(limit: number = 10): Promise<Moment[]> {
    const response = await this.getMoments(0, limit, 'createdAt,desc');
    return response.content;
  },

  // Get moments for today
  async getTodaysMoments(): Promise<Moment[]> {
    const today = new Date();
    const startOfDay = new Date(today);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(today);
    endOfDay.setHours(23, 59, 59, 999);
    
    const response = await this.getMomentsByDateRange(
      startOfDay.toISOString(),
      endOfDay.toISOString(),
      0,
      100
    );
    return response.content;
  },
};