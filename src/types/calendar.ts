export interface Reminder {
  type: 'EMAIL' | 'POPUP';
  minutesBefore: number;
}

export interface RecurrenceRule {
  frequency: 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'YEARLY';
  interval: number;
  endDate?: string;
  count?: number;
}

export interface CalendarEvent {
  id?: number;
  title: string;
  description?: string;
  startDateTime: string; // ISO 8601
  endDateTime: string;   // ISO 8601
  location?: string;
  allDay: boolean;
  reminders?: Reminder[];
  color?: string;
  recurrence?: RecurrenceRule;
  googleEventId?: string; // Google Calendar event ID
  syncToGoogle?: boolean; // Whether to sync this event to Google
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateCalendarEventDto {
  title: string;
  description?: string;
  startDateTime: string;
  endDateTime: string;
  location?: string;
  allDay: boolean;
  reminders?: Reminder[];
  color?: string;
  recurrence?: RecurrenceRule;
  syncToGoogle?: boolean; // Whether to sync this event to Google
}

export interface UpdateCalendarEventDto {
  title?: string;
  description?: string;
  startDateTime?: string;
  endDateTime?: string;
  location?: string;
  allDay?: boolean;
  reminders?: Reminder[];
  color?: string;
  recurrence?: RecurrenceRule;
}

export type CalendarView = 'month' | 'week' | 'day';

export interface CalendarViewProps {
  events: CalendarEvent[];
  currentDate: Date;
  onDateChange: (date: Date) => void;
  onEventClick: (event: CalendarEvent) => void;
  onDateClick?: (date: Date) => void;
}

export interface DragSelection {
  date: Date;
  startTime: string; // HH:mm format
  endTime: string; // HH:mm format
}

export interface WeeklyViewProps extends CalendarViewProps {
  onDragSelection?: (selection: DragSelection) => void;
  weekStartsOn?: 0 | 1; // 0 = Sunday, 1 = Monday
}

export interface TimeSlot {
  date: Date;
  time: string; // HH:mm format
  events: CalendarEvent[];
}