import { formatLocalDateTime, formatDateTimeForAPI } from '../dateFormatting';

describe('dateFormatting', () => {
  describe('formatLocalDateTime', () => {
    it('should format date to local ISO string without timezone', () => {
      // Create a date at 23:00 local time on June 28, 2025
      const date = new Date(2025, 5, 28, 23, 0, 0);
      const result = formatLocalDateTime(date);
      
      // Should return local time without timezone
      expect(result).toBe('2025-06-28T23:00:00');
      
      // Should NOT contain Z or timezone offset
      expect(result).not.toContain('Z');
      expect(result).not.toMatch(/[+-]\d{2}:\d{2}$/);
    });

    it('should pad single digits correctly', () => {
      const date = new Date(2025, 0, 5, 5, 5, 5);
      const result = formatLocalDateTime(date);
      
      expect(result).toBe('2025-01-05T05:05:05');
    });

    it('should handle midnight correctly', () => {
      const date = new Date(2025, 5, 28, 0, 0, 0);
      const result = formatLocalDateTime(date);
      
      expect(result).toBe('2025-06-28T00:00:00');
    });

    it('should handle end of day correctly', () => {
      const date = new Date(2025, 5, 28, 23, 59, 59);
      const result = formatLocalDateTime(date);
      
      expect(result).toBe('2025-06-28T23:59:59');
    });
  });

  describe('formatDateTimeForAPI', () => {
    it('should format datetime-local input for timed events', () => {
      const input = '2025-06-28T23:00';
      const result = formatDateTimeForAPI(input, false);
      
      expect(result).toBe('2025-06-28T23:00:00');
    });

    it('should handle datetime-local with seconds', () => {
      const input = '2025-06-28T23:00:45';
      const result = formatDateTimeForAPI(input, false);
      
      expect(result).toBe('2025-06-28T23:00:45');
    });

    it('should format date input for all-day events', () => {
      const input = '2025-06-28';
      const result = formatDateTimeForAPI(input, true);
      
      expect(result).toBe('2025-06-28T00:00:00');
    });

    it('should format datetime input for all-day events', () => {
      const input = '2025-06-28T14:30';
      const result = formatDateTimeForAPI(input, true);
      
      // Should ignore the time part and set to midnight
      expect(result).toBe('2025-06-28T00:00:00');
    });

    it('should handle empty input', () => {
      const result = formatDateTimeForAPI('', false);
      
      expect(result).toBe('');
    });
  });
});