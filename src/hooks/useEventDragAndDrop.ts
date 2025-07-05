import { useState, useCallback } from 'react';
import { CalendarEvent } from '@/types/calendar';
import { preserveTimeOnDateChange, createMidnightDate } from '@/utils/calendar/dateTimeHelpers';

export interface DragAndDropHandlers {
  draggedEvent: CalendarEvent | null;
  dragOverDate: Date | null;
  handleDragStart: (e: React.DragEvent, event: CalendarEvent) => void;
  handleDragOver: (e: React.DragEvent) => void;
  handleDragEnter: (date: Date) => void;
  handleDragLeave: () => void;
  handleDrop: (e: React.DragEvent, date: Date, timeMinutes?: number) => void;
  handleEventDateChange: (eventId: number, newDate: Date) => void;
}

export function useEventDragAndDrop(
  onEventDateChange?: (eventId: number, newDate: Date) => void
): DragAndDropHandlers {
  const [draggedEvent, setDraggedEvent] = useState<CalendarEvent | null>(null);
  const [dragOverDate, setDragOverDate] = useState<Date | null>(null);

  const handleDragStart = useCallback((e: React.DragEvent, event: CalendarEvent) => {
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', event.id?.toString() || '');
    setDraggedEvent(event);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  }, []);

  const handleDragEnter = useCallback((date: Date) => {
    setDragOverDate(date);
  }, []);

  const handleDragLeave = useCallback(() => {
    setDragOverDate(null);
  }, []);

  const handleEventDateChange = useCallback(
    (eventId: number, newDate: Date) => {
      if (!draggedEvent || !draggedEvent.id || !onEventDateChange) return;

      const originalStart = new Date(draggedEvent.startDateTime);

      if (!draggedEvent.allDay) {
        // For timed events, preserve the exact time
        const newStart = preserveTimeOnDateChange(originalStart, newDate);
        onEventDateChange(eventId, newStart);
      } else {
        // For all-day events, use midnight
        const newStart = createMidnightDate(newDate);
        onEventDateChange(eventId, newStart);
      }
    },
    [draggedEvent, onEventDateChange]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent, date: Date, timeMinutes?: number) => {
      e.preventDefault();

      if (draggedEvent && draggedEvent.id && onEventDateChange) {
        let newDate: Date;

        if (timeMinutes !== undefined && !draggedEvent.allDay) {
          // For time slot drops (like in weekly view)
          const hours = Math.floor(timeMinutes / 60);
          const minutes = timeMinutes % 60;
          newDate = new Date(date);
          newDate.setHours(hours, minutes, 0, 0);
        } else {
          // For date-only drops
          newDate = date;
        }

        handleEventDateChange(draggedEvent.id, newDate);
      }

      setDraggedEvent(null);
      setDragOverDate(null);
    },
    [draggedEvent, onEventDateChange, handleEventDateChange]
  );

  return {
    draggedEvent,
    dragOverDate,
    handleDragStart,
    handleDragOver,
    handleDragEnter,
    handleDragLeave,
    handleDrop,
    handleEventDateChange,
  };
}