export interface CalendarEvent {
  id: number;
  title: string;
  description?: string;
  startDate: string; // ISO string
  endDate: string;   // ISO string
  allDay: boolean;
  color: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCalendarEventDto {
  title: string;
  description?: string;
  startDate: string;
  endDate: string;
  allDay: boolean;
  color: string;
}

export interface UpdateCalendarEventDto {
  title?: string;
  description?: string;
  startDate?: string;
  endDate?: string;
  allDay?: boolean;
  color?: string;
}

export type CalendarView = 'month' | 'week' | 'day';

export interface CalendarViewProps {
  events: CalendarEvent[];
  currentDate: Date;
  onDateChange: (date: Date) => void;
  onEventClick: (event: CalendarEvent) => void;
  onDateClick?: (date: Date) => void;
}