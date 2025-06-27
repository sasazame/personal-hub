import { forwardRef, useEffect, useState } from 'react';
import { format, parse, isValid } from 'date-fns';
import { useLocale } from '@/contexts/LocaleContext';

interface DateTimeInputProps {
  value: string;
  onChange: (value: string) => void;
  label: string;
  error?: string;
  disabled?: boolean;
  required?: boolean;
}

export const DateTimeInput = forwardRef<HTMLInputElement, DateTimeInputProps>(
  ({ value, onChange, label, error, disabled, required }, ref) => {
    const { locale } = useLocale();
    const [dateValue, setDateValue] = useState('');
    const [timeValue, setTimeValue] = useState('');

    // Date format based on locale
    const dateFormat = locale === 'ja' ? 'yyyy/MM/dd' : 'MM/dd/yyyy';
    const timeFormat = 'HH:mm';
    const datePattern = locale === 'ja' ? 
      '\\d{4}/\\d{2}/\\d{2}' : 
      '\\d{2}/\\d{2}/\\d{4}';

    // Parse the ISO datetime string to date and time
    useEffect(() => {
      if (value) {
        try {
          const date = new Date(value);
          if (isValid(date)) {
            setDateValue(format(date, dateFormat));
            setTimeValue(format(date, timeFormat));
          }
        } catch {
          // Invalid date, keep empty
        }
      }
    }, [value, dateFormat]);

    // Combine date and time into ISO string
    const handleDateChange = (newDate: string) => {
      setDateValue(newDate);
      combineDateTime(newDate, timeValue);
    };

    const handleTimeChange = (newTime: string) => {
      setTimeValue(newTime);
      combineDateTime(dateValue, newTime);
    };

    const combineDateTime = (date: string, time: string) => {
      if (date && time) {
        try {
          // Parse date based on locale format
          const parsedDate = parse(date, dateFormat, new Date());
          
          if (isValid(parsedDate)) {
            // Parse time
            const [hours, minutes] = time.split(':').map(Number);
            parsedDate.setHours(hours);
            parsedDate.setMinutes(minutes);
            parsedDate.setSeconds(0);
            parsedDate.setMilliseconds(0);
            
            // Convert to ISO string for form submission
            onChange(parsedDate.toISOString());
          }
        } catch {
          // Invalid format, don't update
        }
      }
    };

    return (
      <div className="space-y-2">
        <label className="block text-sm font-medium text-foreground">
          {label} {required && <span className="text-destructive">*</span>}
        </label>
        <div className="flex gap-2">
          <div className="flex-1">
            <input
              ref={ref}
              type="text"
              value={dateValue}
              onChange={(e) => handleDateChange(e.target.value)}
              placeholder={dateFormat}
              pattern={datePattern}
              className="w-full border border-input bg-background text-foreground transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent disabled:cursor-not-allowed disabled:opacity-50 h-10 px-3 py-2 rounded-md"
              disabled={disabled}
              required={required}
            />
          </div>
          <div className="w-32">
            <input
              type="time"
              value={timeValue}
              onChange={(e) => handleTimeChange(e.target.value)}
              className="w-full border border-input bg-background text-foreground transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent disabled:cursor-not-allowed disabled:opacity-50 h-10 px-3 py-2 rounded-md"
              disabled={disabled}
              required={required}
            />
          </div>
        </div>
        {error && (
          <p className="text-sm text-destructive">{error}</p>
        )}
      </div>
    );
  }
);

DateTimeInput.displayName = 'DateTimeInput';