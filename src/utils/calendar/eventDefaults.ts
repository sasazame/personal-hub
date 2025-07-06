import { CalendarEvent, Reminder } from '@/types/calendar';
import { 
  getNext30MinInterval, 
  calculateEndTime, 
  createDateWithTime,
  parseTimeString,
  formatDateTimeForFormInput,
  createMidnightDate
} from './dateTimeHelpers';

export interface EventFormValues {
  title: string;
  description: string;
  startDateTime: string;
  endDateTime: string;
  location: string;
  allDay: boolean;
  color: string;
  reminders: Reminder[];
  recurrence?: CalendarEvent['recurrence'];
  syncToGoogle: boolean;
}

export interface DefaultDateOptions {
  isAllDayEvent?: boolean;
  dragEndTime?: string;
}

/**
 * Generate default values for event form
 */
export function generateEventDefaultValues(
  event?: CalendarEvent,
  defaultDate?: Date & DefaultDateOptions
): EventFormValues {
  // If editing existing event
  if (event) {
    return {
      title: event.title,
      description: event.description || '',
      startDateTime: formatDateTimeForFormInput(event.startDateTime, event.allDay),
      endDateTime: formatDateTimeForFormInput(event.endDateTime, event.allDay),
      location: event.location || '',
      allDay: event.allDay,
      color: event.color || 'blue',
      reminders: event.reminders || [],
      recurrence: event.recurrence,
      syncToGoogle: event.syncToGoogle ?? true,
    };
  }
  
  // For new events
  const baseDefaults = {
    title: '',
    description: '',
    location: '',
    color: 'blue',
    reminders: [],
    recurrence: undefined,
    syncToGoogle: true,
  };
  
  // Handle all-day event request
  if (defaultDate?.isAllDayEvent) {
    const midnightDate = createMidnightDate(defaultDate);
    return {
      ...baseDefaults,
      startDateTime: formatDateTimeForFormInput(midnightDate, true),
      endDateTime: formatDateTimeForFormInput(midnightDate, true),
      allDay: true,
    };
  }
  
  // Handle drag selection
  if (defaultDate?.dragEndTime) {
    const startTime = new Date(defaultDate);
    const { hours, minutes } = parseTimeString(defaultDate.dragEndTime);
    const endTime = createDateWithTime(defaultDate, hours, minutes);
    
    return {
      ...baseDefaults,
      startDateTime: formatDateTimeForFormInput(startTime, false),
      endDateTime: formatDateTimeForFormInput(endTime, false),
      allDay: false,
    };
  }
  
  // Default case: next 30-minute interval
  const now = defaultDate || new Date();
  const startTime = defaultDate ? new Date(defaultDate) : getNext30MinInterval(now);
  const endTime = calculateEndTime(startTime);
  
  return {
    ...baseDefaults,
    startDateTime: formatDateTimeForFormInput(startTime, false),
    endDateTime: formatDateTimeForFormInput(endTime, false),
    allDay: false,
  };
}