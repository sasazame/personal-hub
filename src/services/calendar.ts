import apiClient from '@/lib/api-client';
import { CalendarEvent, CreateCalendarEventDto, UpdateCalendarEventDto } from '@/types/calendar';

// Use the unified apiClient instance that includes OIDC support and proper token management
const api = apiClient;

export const calendarService = {
  async getEvents(year: number, month: number): Promise<CalendarEvent[]> {
    const response = await api.get<CalendarEvent[]>('/calendar/events', { 
      params: { year, month } 
    });
    return response.data;
  },

  async getAllEvents(): Promise<CalendarEvent[]> {
    const response = await api.get<CalendarEvent[]>('/calendar/events');
    return response.data;
  },

  async getEvent(id: number): Promise<CalendarEvent | null> {
    try {
      const response = await api.get<CalendarEvent>(`/calendar/events/${id}`);
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
    const response = await api.post<CalendarEvent>('/calendar/events', data);
    return response.data;
  },

  async updateEvent(id: number, data: UpdateCalendarEventDto): Promise<CalendarEvent> {
    const response = await api.put<CalendarEvent>(`/calendar/events/${id}`, data);
    return response.data;
  },

  async deleteEvent(id: number): Promise<void> {
    await api.delete(`/calendar/events/${id}`);
  },

  // Get events for a specific date range
  async getEventsByDateRange(startDate: Date, endDate: Date): Promise<CalendarEvent[]> {
    const response = await api.get<CalendarEvent[]>('/calendar/events/range', { 
      params: { 
        startDate: startDate.toISOString(), 
        endDate: endDate.toISOString() 
      } 
    });
    return response.data;
  },

  // Get today's events
  async getTodaysEvents(): Promise<CalendarEvent[]> {
    const response = await api.get<CalendarEvent[]>('/calendar/events/today');
    return response.data;
  },
};