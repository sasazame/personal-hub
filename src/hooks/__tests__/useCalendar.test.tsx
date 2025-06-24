import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactNode } from 'react';
import {
  useCalendarEvents,
  useAllCalendarEvents,
  useTodaysEvents,
  useCreateCalendarEvent,
  useUpdateCalendarEvent,
  useDeleteCalendarEvent,
} from '../useCalendar';
import { calendarService } from '@/services/calendar';

// Mock the calendar service
jest.mock('@/services/calendar', () => ({
  calendarService: {
    getMonthEvents: jest.fn(),
    getAllEvents: jest.fn(),
    getTodaysEvents: jest.fn(),
    createEvent: jest.fn(),
    updateEvent: jest.fn(),
    deleteEvent: jest.fn(),
  },
}));

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  const Wrapper = ({ children }: { children: ReactNode }) => {
    return (
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    );
  };
  
  return Wrapper;
};

const mockEvent = {
  id: 1,
  title: 'Test Event',
  startDateTime: new Date().toISOString(),
  endDateTime: new Date().toISOString(),
  allDay: false,
  color: 'blue',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

describe('useCalendar hooks', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('useCalendarEvents', () => {
    it('fetches events for specific month', async () => {
      (calendarService.getMonthEvents as jest.Mock).mockResolvedValue([mockEvent]);

      const { result } = renderHook(
        () => useCalendarEvents(2025, 5),
        { wrapper: createWrapper() }
      );

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(calendarService.getMonthEvents).toHaveBeenCalledWith(2025, 5);
      expect(result.current.data).toEqual([mockEvent]);
    });

    it('handles loading state', () => {
      (calendarService.getMonthEvents as jest.Mock).mockImplementation(
        () => new Promise(() => {}) // Never resolves
      );

      const { result } = renderHook(
        () => useCalendarEvents(2025, 5),
        { wrapper: createWrapper() }
      );

      expect(result.current.isLoading).toBe(true);
    });
  });

  describe('useAllCalendarEvents', () => {
    it('fetches all events', async () => {
      (calendarService.getAllEvents as jest.Mock).mockResolvedValue([mockEvent]);

      const { result } = renderHook(
        () => useAllCalendarEvents(),
        { wrapper: createWrapper() }
      );

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(calendarService.getAllEvents).toHaveBeenCalled();
      expect(result.current.data).toEqual([mockEvent]);
    });
  });

  describe('useTodaysEvents', () => {
    it('fetches today\'s events', async () => {
      (calendarService.getTodaysEvents as jest.Mock).mockResolvedValue([mockEvent]);

      const { result } = renderHook(
        () => useTodaysEvents(),
        { wrapper: createWrapper() }
      );

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(calendarService.getTodaysEvents).toHaveBeenCalled();
      expect(result.current.data).toEqual([mockEvent]);
    });
  });

  describe('useCreateCalendarEvent', () => {
    it('creates event successfully', async () => {
      (calendarService.createEvent as jest.Mock).mockResolvedValue(mockEvent);

      const { result } = renderHook(
        () => useCreateCalendarEvent(),
        { wrapper: createWrapper() }
      );

      const createData = {
        title: 'New Event',
        startDateTime: new Date().toISOString(),
        endDateTime: new Date().toISOString(),
        allDay: false,
        color: 'blue',
      };

      result.current.mutate(createData);

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(calendarService.createEvent).toHaveBeenCalledWith(createData);
    });

    it('handles creation error', async () => {
      const error = new Error('Create failed');
      (calendarService.createEvent as jest.Mock).mockRejectedValue(error);

      const { result } = renderHook(
        () => useCreateCalendarEvent(),
        { wrapper: createWrapper() }
      );

      const createData = {
        title: 'New Event',
        startDateTime: new Date().toISOString(),
        endDateTime: new Date().toISOString(),
        allDay: false,
        color: 'blue',
      };

      result.current.mutate(createData);

      await waitFor(() => {
        expect(result.current.isError).toBe(true);
      });

      expect(result.current.error).toBe(error);
    });
  });

  describe('useUpdateCalendarEvent', () => {
    it('updates event successfully', async () => {
      const updatedEvent = { ...mockEvent, title: 'Updated Event' };
      (calendarService.updateEvent as jest.Mock).mockResolvedValue(updatedEvent);

      const { result } = renderHook(
        () => useUpdateCalendarEvent(),
        { wrapper: createWrapper() }
      );

      const updateData = { title: 'Updated Event' };

      result.current.mutate({ id: 1, data: updateData });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(calendarService.updateEvent).toHaveBeenCalledWith(1, updateData);
    });
  });

  describe('useDeleteCalendarEvent', () => {
    it('deletes event successfully', async () => {
      (calendarService.deleteEvent as jest.Mock).mockResolvedValue({});

      const { result } = renderHook(
        () => useDeleteCalendarEvent(),
        { wrapper: createWrapper() }
      );

      result.current.mutate(1);

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(calendarService.deleteEvent).toHaveBeenCalledWith(1);
    });

    it('handles deletion error', async () => {
      const error = new Error('Delete failed');
      (calendarService.deleteEvent as jest.Mock).mockRejectedValue(error);

      const { result } = renderHook(
        () => useDeleteCalendarEvent(),
        { wrapper: createWrapper() }
      );

      result.current.mutate(1);

      await waitFor(() => {
        expect(result.current.isError).toBe(true);
      });

      expect(result.current.error).toBe(error);
    });
  });

  describe('Query invalidation', () => {
    it('invalidates calendar queries on successful creation', async () => {
      (calendarService.createEvent as jest.Mock).mockResolvedValue(mockEvent);

      const queryClient = new QueryClient({
        defaultOptions: {
          queries: { retry: false },
          mutations: { retry: false },
        },
      });

      const invalidateSpy = jest.spyOn(queryClient, 'invalidateQueries');

      const wrapper = ({ children }: { children: ReactNode }) => (
        <QueryClientProvider client={queryClient}>
          {children}
        </QueryClientProvider>
      );

      const { result } = renderHook(
        () => useCreateCalendarEvent(),
        { wrapper }
      );

      const createData = {
        title: 'New Event',
        startDateTime: new Date().toISOString(),
        endDateTime: new Date().toISOString(),
        allDay: false,
        color: 'blue',
      };

      result.current.mutate(createData);

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['calendar'] });
    });
  });
});