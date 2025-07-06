import { useTranslations } from 'next-intl';
import { CalendarEvent, UpdateCalendarEventDto } from '@/types/calendar';
import { calendarService } from '@/services/calendar';
import { updateEventTimesPreservingDuration } from '@/utils/calendar/dateTimeHelpers';
import { useCrudMutation } from './useCrudMutation';

export interface EventDateChangeParams {
  eventId: number;
  newDate: Date;
  events: CalendarEvent[];
}

export function useCalendarEventMutation() {
  const t = useTranslations();

  const updateMutation = useCrudMutation<
    CalendarEvent,
    { id: number; data: UpdateCalendarEventDto }
  >({
    mutationFn: ({ id, data }) => calendarService.updateEvent(id, data),
    queryKey: ['calendar-events'],
    successMessage: t('calendar.eventUpdated'),
    errorMessage: (error) => error.message || t('calendar.updateFailed'),
  });

  const handleEventDateChange = ({ eventId, newDate, events }: EventDateChangeParams) => {
    const event = events.find(e => e.id === eventId);
    if (!event) return;

    const { startDateTime, endDateTime } = updateEventTimesPreservingDuration(
      newDate,
      event.startDateTime,
      event.endDateTime,
      event.allDay
    );

    const updateData: UpdateCalendarEventDto = {
      startDateTime,
      endDateTime,
    };

    updateMutation.mutate({ id: eventId, data: updateData });
  };

  return {
    updateMutation: updateMutation.mutate,
    handleEventDateChange,
  };
}