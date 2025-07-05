import { formatLocalDateTime } from '../dateFormatting';

/**
 * Get the next 30-minute interval from a given date
 */
export function getNext30MinInterval(date: Date): Date {
  const minutes = date.getMinutes();
  const roundedMinutes = minutes < 30 ? 30 : 60;
  const result = new Date(date);
  
  if (roundedMinutes === 60) {
    result.setHours(result.getHours() + 1);
    result.setMinutes(0);
  } else {
    result.setMinutes(roundedMinutes);
  }
  
  result.setSeconds(0);
  result.setMilliseconds(0);
  
  return result;
}

/**
 * Calculate end time based on start time and duration
 */
export function calculateEndTime(startTime: Date, durationMinutes: number = 30): Date {
  return new Date(startTime.getTime() + durationMinutes * 60 * 1000);
}

/**
 * Preserve time when changing date
 */
export function preserveTimeOnDateChange(originalDate: Date, newDate: Date): Date {
  const result = new Date(newDate);
  result.setHours(originalDate.getHours());
  result.setMinutes(originalDate.getMinutes());
  result.setSeconds(0);
  result.setMilliseconds(0);
  return result;
}

/**
 * Create a date at midnight (for all-day events)
 */
export function createMidnightDate(date: Date): Date {
  return new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate(),
    0, 0, 0, 0
  );
}

/**
 * Create a date with specific time
 */
export function createDateWithTime(date: Date, hours: number, minutes: number): Date {
  const result = new Date(date);
  result.setHours(hours, minutes, 0, 0);
  return result;
}

/**
 * Parse time string to hours and minutes
 */
export function parseTimeString(timeString: string): { hours: number; minutes: number } {
  const [hours, minutes] = timeString.split(':').map(Number);
  return { hours, minutes };
}

/**
 * Format datetime for DateTimeInput component
 */
export function formatDateTimeForInput(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  if (isNaN(d.getTime())) {
    return new Date().toISOString();
  }
  return d.toISOString();
}

/**
 * Format date for HTML date input
 */
export function formatDateForInput(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Format dates for form inputs based on all-day status
 */
export function formatDateTimeForFormInput(date: Date | string, isAllDay: boolean): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return isAllDay ? formatDateForInput(dateObj) : formatDateTimeForInput(dateObj);
}

/**
 * Calculate event duration in milliseconds
 */
export function calculateEventDuration(startDateTime: Date | string, endDateTime: Date | string): number {
  const start = typeof startDateTime === 'string' ? new Date(startDateTime) : startDateTime;
  const end = typeof endDateTime === 'string' ? new Date(endDateTime) : endDateTime;
  return end.getTime() - start.getTime();
}

/**
 * Update event times while preserving duration
 */
export function updateEventTimesPreservingDuration(
  newStartDate: Date,
  originalStart: Date | string,
  originalEnd: Date | string,
  isAllDay: boolean
): { startDateTime: string; endDateTime: string } {
  const duration = calculateEventDuration(originalStart, originalEnd);
  
  let newStart: Date;
  if (isAllDay) {
    newStart = createMidnightDate(newStartDate);
  } else {
    newStart = newStartDate;
  }
  
  const newEnd = new Date(newStart.getTime() + duration);
  
  return {
    startDateTime: formatLocalDateTime(newStart),
    endDateTime: formatLocalDateTime(newEnd),
  };
}