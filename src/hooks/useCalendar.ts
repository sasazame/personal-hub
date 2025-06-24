import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { CreateCalendarEventDto, UpdateCalendarEventDto } from '@/types/calendar';
import { calendarService } from '@/services/calendar';

export function useCalendarEvents(year: number, month: number) {
  return useQuery({
    queryKey: ['calendar', 'events', year, month],
    queryFn: () => calendarService.getMonthEvents(year, month),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

export function useAllCalendarEvents() {
  return useQuery({
    queryKey: ['calendar', 'events', 'all'],
    queryFn: () => calendarService.getAllEvents(),
    staleTime: 1000 * 60 * 5,
  });
}

export function useCalendarEvent(id: number) {
  return useQuery({
    queryKey: ['calendar', 'event', id],
    queryFn: () => calendarService.getEvent(id),
    enabled: !!id,
  });
}

export function useTodaysEvents() {
  return useQuery({
    queryKey: ['calendar', 'events', 'today'],
    queryFn: () => calendarService.getTodaysEvents(),
    staleTime: 1000 * 60 * 1, // 1 minute for today's events
  });
}

export function useCreateCalendarEvent() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: CreateCalendarEventDto) => calendarService.createEvent(data),
    onSuccess: () => {
      // Invalidate all calendar queries
      queryClient.invalidateQueries({ queryKey: ['calendar'] });
    },
  });
}

export function useUpdateCalendarEvent() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateCalendarEventDto }) => 
      calendarService.updateEvent(id, data),
    onSuccess: (updatedEvent) => {
      // Update the specific event in cache
      queryClient.setQueryData(['calendar', 'event', updatedEvent.id], updatedEvent);
      
      // Invalidate calendar events queries
      queryClient.invalidateQueries({ queryKey: ['calendar', 'events'] });
    },
  });
}

export function useDeleteCalendarEvent() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: number) => calendarService.deleteEvent(id),
    onSuccess: (_, deletedId) => {
      // Remove from specific event cache
      queryClient.removeQueries({ queryKey: ['calendar', 'event', deletedId] });
      
      // Invalidate calendar events queries
      queryClient.invalidateQueries({ queryKey: ['calendar', 'events'] });
    },
  });
}