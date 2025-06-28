/**
 * Date formatting utilities for API communication
 */

/**
 * Formats a Date object to local ISO string without timezone
 * Example: 2025-06-17T23:00:00 (no Z or timezone offset)
 * 
 * This format is used by the API which expects local time without timezone information
 * 
 * @param date - The date to format
 * @returns Local ISO string without timezone
 */
export function formatLocalDateTime(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');
  
  return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`;
}

/**
 * Formats a datetime-local input value for API
 * Handles both date and datetime-local input formats
 * 
 * @param dateTimeLocal - Value from datetime-local or date input
 * @param allDay - Whether this is an all-day event
 * @returns Formatted string for API
 */
export function formatDateTimeForAPI(dateTimeLocal: string, allDay: boolean): string {
  if (!dateTimeLocal) return '';
  
  if (allDay) {
    // For all-day events, use date only and set to start of day
    const dateOnly = dateTimeLocal.split('T')[0];
    return `${dateOnly}T00:00:00`;
  } else {
    // For timed events, the datetime-local input already has the correct format
    // Just ensure it has seconds
    if (dateTimeLocal.length === 16) { // YYYY-MM-DDTHH:mm
      return `${dateTimeLocal}:00`;
    }
    return dateTimeLocal;
  }
}