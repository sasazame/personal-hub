'use client';

import React, { forwardRef } from 'react';
import ReactDatePicker from 'react-datepicker';
import { CalendarIcon } from '@heroicons/react/24/outline';
import { cn } from '@/lib/cn';
import { useTheme } from '@/hooks/useTheme';
import { ja, enUS } from 'date-fns/locale';
import { useLocale } from 'next-intl';
import 'react-datepicker/dist/react-datepicker.css';

interface DatePickerProps {
  value?: Date | null;
  onChange?: (date: Date | null) => void;
  placeholder?: string;
  className?: string;
  calendarClassName?: string;
}

interface CustomInputProps {
  value?: string;
  onClick?: () => void;
  onChange?: () => void;
  placeholder?: string;
  className?: string;
}

const CustomInput = forwardRef<HTMLButtonElement, CustomInputProps>(
  ({ value, onClick, placeholder, className }, ref) => (
    <button
      ref={ref}
      type="button"
      onClick={onClick}
      className={cn(
        'p-2 text-sm border rounded-lg transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2',
        'bg-background text-foreground border-border hover:bg-muted',
        className
      )}
      aria-label={value || placeholder || 'Select date'}
    >
      <CalendarIcon className="h-4 w-4" />
    </button>
  )
);

CustomInput.displayName = 'CustomInput';

export function DatePicker({
  value,
  onChange,
  placeholder,
  className,
  calendarClassName
}: DatePickerProps) {
  const { theme } = useTheme();
  const locale = useLocale();
  const dateLocale = locale === 'ja' ? ja : enUS;

  return (
    <div className="relative">
      <style jsx global>{`
        .date-picker-light .react-datepicker {
          background-color: #ffffff;
          border: 1px solid #e2e8f0;
        }

        .date-picker-light .react-datepicker__header {
          background-color: #f8fafc;
          border-bottom: 1px solid #e2e8f0;
        }

        .date-picker-light .react-datepicker__current-month,
        .date-picker-light .react-datepicker__day-name,
        .date-picker-light .react-datepicker__day {
          color: #0f172a;
        }

        .date-picker-light .react-datepicker__day:hover {
          background-color: #f1f5f9;
        }

        .date-picker-light .react-datepicker__day--selected {
          background-color: #2563eb;
          color: #ffffff;
        }

        .date-picker-light .react-datepicker__day--selected:hover {
          background-color: #1d4ed8;
        }

        .date-picker-light .react-datepicker__day--outside-month {
          color: #94a3b8;
        }

        .date-picker-light .react-datepicker__navigation-icon::before {
          border-color: #64748b;
        }

        .date-picker-light .react-datepicker__navigation:hover .react-datepicker__navigation-icon::before {
          border-color: #0f172a;
        }

        /* Dark mode styles */
        .date-picker-dark .react-datepicker {
          background-color: #1e293b;
          border: 1px solid #334155;
        }

        .date-picker-dark .react-datepicker__header {
          background-color: #0f172a;
          border-bottom: 1px solid #334155;
        }

        .date-picker-dark .react-datepicker__current-month,
        .date-picker-dark .react-datepicker__day-name,
        .date-picker-dark .react-datepicker__day {
          color: #f1f5f9;
        }

        .date-picker-dark .react-datepicker__day:hover {
          background-color: #334155;
        }

        .date-picker-dark .react-datepicker__day--selected {
          background-color: #60a5fa;
          color: #0f172a;
        }

        .date-picker-dark .react-datepicker__day--selected:hover {
          background-color: #3b82f6;
        }

        .date-picker-dark .react-datepicker__day--outside-month {
          color: #64748b;
        }

        .date-picker-dark .react-datepicker__navigation-icon::before {
          border-color: #94a3b8;
        }

        .date-picker-dark .react-datepicker__navigation:hover .react-datepicker__navigation-icon::before {
          border-color: #f1f5f9;
        }

        /* Common styles */
        .react-datepicker-popper {
          z-index: 50;
        }

        .react-datepicker {
          font-family: inherit;
          border-radius: 0.5rem;
          box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
        }

        .react-datepicker__header {
          padding-top: 0.5rem;
          border-radius: 0.5rem 0.5rem 0 0;
        }

        .react-datepicker__navigation {
          top: 0.5rem;
        }

        .react-datepicker__current-month {
          font-weight: 500;
        }

        .react-datepicker__day {
          border-radius: 0.25rem;
          line-height: 1.75rem;
          margin: 0.125rem;
        }

        .react-datepicker__day--today {
          font-weight: 700;
        }

        .react-datepicker__day--outside-month {
          opacity: 0.5;
        }
      `}</style>
      
      <ReactDatePicker
        selected={value}
        onChange={onChange}
        dateFormat={locale === 'ja' ? 'yyyy年MM月dd日' : 'MMMM d, yyyy'}
        locale={dateLocale}
        placeholderText={placeholder}
        popperClassName={theme === 'dark' ? 'date-picker-dark' : 'date-picker-light'}
        className={className}
        calendarClassName={calendarClassName}
        customInput={
          <CustomInput 
            placeholder={placeholder} 
            className={className}
          />
        }
        showPopperArrow={false}
      />
    </div>
  );
}