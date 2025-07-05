import { useQuery } from '@tanstack/react-query';
import { CalendarEvent, CreateCalendarEventDto, UpdateCalendarEventDto } from '@/types/calendar';
import { calendarService } from '@/services/calendar';
import { createEntityHooks } from './useEntityHooks';

// Create filter type for calendar
interface CalendarFilters {
  year?: number;
  month?: number;
  date?: string;
}

// Create the base entity hooks
const entityHooks = createEntityHooks<CalendarEvent, CreateCalendarEventDto, UpdateCalendarEventDto, CalendarFilters>({
  entityName: 'CalendarEvent',
  service: {
    getAll: () => calendarService.getAllEvents(),
    getById: (id: number) => calendarService.getEvent(id),
    create: (data: CreateCalendarEventDto) => calendarService.createEvent(data),
    update: (id: number, data: UpdateCalendarEventDto) => calendarService.updateEvent(id, data),
    delete: (id: number) => calendarService.deleteEvent(id),
  },
  queryKey: 'calendar',
  getFilters: async (filters: CalendarFilters) => {
    if (filters.year && filters.month) {
      return calendarService.getMonthEvents(filters.year, filters.month);
    }
    if (filters.date) {
      return calendarService.getTodaysEvents();
    }
    return calendarService.getAllEvents();
  },
  staleTime: 1000 * 60 * 5, // 5 minutes
  additionalInvalidateKeys: [['calendar']],
});

// Export the standard CRUD hooks
export const useCalendarEvent = entityHooks.useCalendarEvent;
export const useCreateCalendarEvent = entityHooks.useCreateCalendarEvent;
export const useUpdateCalendarEvent = entityHooks.useUpdateCalendarEvent;
export const useDeleteCalendarEvent = entityHooks.useDeleteCalendarEvent;

// Custom hooks for specific queries
export function useCalendarEvents(year: number, month: number) {
  return entityHooks.useCalendarEventList({ year, month });
}

export function useAllCalendarEvents() {
  return entityHooks.useCalendarEventList({});
}

export function useTodaysEvents() {
  return useQuery({
    queryKey: ['calendar', 'events', 'today'],
    queryFn: () => calendarService.getTodaysEvents(),
    staleTime: 1000 * 60 * 1, // 1 minute for today's events
  });
}

// Additional calendar-specific hooks
export function useEventsByDateRange(startDate: string, endDate: string) {
  return useQuery({
    queryKey: ['calendar', 'events', 'range', startDate, endDate],
    queryFn: () => calendarService.getEventsByDateRange(startDate, endDate),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

// Google Calendar integration hooks
export function useGoogleCalendarSync() {
  return useQuery({
    queryKey: ['calendar', 'google', 'sync-status'],
    queryFn: () => calendarService.getGoogleSyncStatus(),
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
}