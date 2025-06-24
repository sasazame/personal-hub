import apiClient from '@/lib/api-client';
import { CalendarEvent, CreateCalendarEventDto, UpdateCalendarEventDto } from '@/types/calendar';

// Use the unified apiClient instance that includes OIDC support and proper token management
const api = apiClient;

export const calendarService = {
  // Get events for a specific date range
  async getEventsByDateRange(startDate: string, endDate: string): Promise<CalendarEvent[]> {
    try {
      // Spring Boot LocalDateTime format: YYYY-MM-DDTHH:mm:ss (without timezone)
      const startDateTime = `${startDate}T00:00:00`;
      const endDateTime = `${endDate}T23:59:59`;
      
      const response = await api.get<CalendarEvent[]>('/events/range', { 
        params: { 
          startDate: startDateTime, // LocalDateTime format
          endDate: endDateTime 
        } 
      });
      // Ensure we return an array even if the response is not what we expect
      return Array.isArray(response.data) ? response.data : [];
    } catch (error) {
      console.error('Failed to fetch events by date range:', error);
      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as { response: { data: unknown } };
        console.error('Error details:', axiosError.response?.data);
      }
      return [];
    }
  },

  // Get events for a specific month
  async getMonthEvents(year: number, month: number): Promise<CalendarEvent[]> {
    // Try basic getAllEvents first, then filter if range endpoint has issues
    try {
      // month is 1-based from the frontend, so we use it directly
      const startDate = `${year}-${month.toString().padStart(2, '0')}-01`;
      const lastDay = new Date(year, month, 0).getDate(); // month is 1-based for this calculation
      const endDate = `${year}-${month.toString().padStart(2, '0')}-${lastDay.toString().padStart(2, '0')}`;
      
      return await this.getEventsByDateRange(startDate, endDate);
    } catch (error) {
      // Fallback to getAllEvents if range endpoint fails
      try {
        const allEvents = await this.getAllEvents(0, 1000);
        return allEvents;
      } catch (fallbackError) {
        console.error('Both range and getAllEvents failed:', fallbackError);
        return [];
      }
    }
  },

  // Get all events (paginated) - extract content from paginated response
  async getAllEvents(page = 0, size = 100): Promise<CalendarEvent[]> {
    try {
      const response = await api.get<{ content: CalendarEvent[] }>('/events', { 
        params: { page, size, sort: 'startDateTime' }
      });
      // Handle both paginated and direct array responses
      if (response.data && typeof response.data === 'object' && 'content' in response.data) {
        return Array.isArray(response.data.content) ? response.data.content : [];
      }
      return Array.isArray(response.data) ? response.data : [];
    } catch (error) {
      console.error('Failed to fetch events:', error);
      return [];
    }
  },

  async getEvent(id: number): Promise<CalendarEvent | null> {
    try {
      const response = await api.get<CalendarEvent>(`/events/${id}`);
      return response.data;
    } catch (error) {
      // Return null if event not found (404)
      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as { response: { status: number } };
        if (axiosError.response?.status === 404) {
          return null;
        }
      }
      throw error;
    }
  },

  async createEvent(data: CreateCalendarEventDto): Promise<CalendarEvent> {
    try {
      const response = await api.post<CalendarEvent>('/events', data);
      return response.data;
    } catch (error) {
      console.error('Failed to create event:', error);
      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as { response: { data: unknown } };
        console.error('Error details:', axiosError.response?.data);
      }
      throw error;
    }
  },

  async updateEvent(id: number, data: UpdateCalendarEventDto): Promise<CalendarEvent> {
    const response = await api.put<CalendarEvent>(`/events/${id}`, data);
    return response.data;
  },

  async deleteEvent(id: number): Promise<void> {
    await api.delete(`/events/${id}`);
  },

  // Get today's events
  async getTodaysEvents(): Promise<CalendarEvent[]> {
    const today = new Date().toISOString().split('T')[0];
    return this.getEventsByDateRange(today, today);
  },
};