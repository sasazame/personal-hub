'use client';

import { useState, useRef, useEffect } from 'react';
import { Calendar, X } from 'lucide-react';
import { format, subMonths } from 'date-fns';
import { useTranslations } from 'next-intl';

interface DateRangePickerProps {
  startDate?: Date;
  endDate?: Date;
  onChange: (range: { startDate?: Date; endDate?: Date }) => void;
  placeholder?: string;
  className?: string;
}

export function DateRangePicker({ 
  startDate, 
  endDate, 
  onChange, 
  placeholder,
  className = ''
}: DateRangePickerProps) {
  const t = useTranslations();
  const [isOpen, setIsOpen] = useState(false);
  const [localStartDate, setLocalStartDate] = useState<string>(
    startDate ? format(startDate, 'yyyy-MM-dd') : ''
  );
  const [localEndDate, setLocalEndDate] = useState<string>(
    endDate ? format(endDate, 'yyyy-MM-dd') : ''
  );
  const [isEnabled, setIsEnabled] = useState(!!startDate || !!endDate);
  const [error, setError] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (startDate) {
      setLocalStartDate(format(startDate, 'yyyy-MM-dd'));
    }
    if (endDate) {
      setLocalEndDate(format(endDate, 'yyyy-MM-dd'));
    }
  }, [startDate, endDate]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleApply = () => {
    if (isEnabled && localStartDate && localEndDate) {
      const start = new Date(localStartDate);
      const end = new Date(localEndDate);
      
      // Validate that end date is not before start date
      if (end < start) {
        setError(t('validation.endDateBeforeStartDate'));
        return;
      }
      
      setError(null);
      onChange({
        startDate: start,
        endDate: end,
      });
    } else {
      setError(null);
      onChange({
        startDate: undefined,
        endDate: undefined,
      });
    }
    setIsOpen(false);
  };

  const handleToggleEnabled = (checked: boolean) => {
    setIsEnabled(checked);
    if (checked && !localStartDate && !localEndDate) {
      // Default to last month
      const end = new Date();
      const start = subMonths(end, 1);
      setLocalStartDate(format(start, 'yyyy-MM-dd'));
      setLocalEndDate(format(end, 'yyyy-MM-dd'));
    }
  };

  const handleClear = () => {
    setLocalStartDate('');
    setLocalEndDate('');
    setIsEnabled(false);
    setError(null);
    onChange({
      startDate: undefined,
      endDate: undefined,
    });
    setIsOpen(false);
  };

  const formatDisplayDate = () => {
    if (!isEnabled || !startDate || !endDate) {
      return placeholder || t('common.selectDateRange');
    }
    return `${format(startDate, 'yyyy/MM/dd')} - ${format(endDate, 'yyyy/MM/dd')}`;
  };

  return (
    <div className={`relative ${className}`} ref={containerRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 border border-border rounded-lg bg-background text-foreground hover:bg-muted transition-colors"
      >
        <Calendar className="w-4 h-4 text-muted-foreground" />
        <span className="text-sm">{formatDisplayDate()}</span>
        {isEnabled && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              handleClear();
            }}
            className="ml-2 text-muted-foreground hover:text-foreground"
          >
            <X className="w-3 h-3" />
          </button>
        )}
      </button>

      {isOpen && (
        <div className="absolute top-full mt-2 right-0 w-80 bg-card border border-border rounded-lg shadow-lg z-50">
          <div className="p-4 space-y-4">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="date-range-enabled"
                checked={isEnabled}
                onChange={(e) => handleToggleEnabled(e.target.checked)}
                className="rounded border-input text-primary focus:ring-primary"
              />
              <label htmlFor="date-range-enabled" className="text-sm font-medium text-foreground">
                {t('common.enableDateFilter')}
              </label>
            </div>

            {isEnabled && (
              <>
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-foreground">
                    {t('common.startDate')}
                  </label>
                  <input
                    type="date"
                    value={localStartDate}
                    onChange={(e) => {
                      setLocalStartDate(e.target.value);
                      setError(null); // Clear error when user changes date
                      // Auto-adjust end date if it's before the new start date
                      if (localEndDate && new Date(e.target.value) > new Date(localEndDate)) {
                        setLocalEndDate(e.target.value);
                      }
                    }}
                    max={localEndDate || undefined}
                    className="w-full px-3 py-2 border border-input rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-foreground">
                    {t('common.endDate')}
                  </label>
                  <input
                    type="date"
                    value={localEndDate}
                    onChange={(e) => {
                      setLocalEndDate(e.target.value);
                      setError(null); // Clear error when user changes date
                      // Auto-adjust start date if it's after the new end date
                      if (localStartDate && new Date(e.target.value) < new Date(localStartDate)) {
                        setLocalStartDate(e.target.value);
                      }
                    }}
                    min={localStartDate || undefined}
                    className="w-full px-3 py-2 border border-input rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                </div>
              </>
            )}

            {error && (
              <div className="text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-lg px-3 py-2">
                {error}
              </div>
            )}

            <div className="flex gap-2 justify-end pt-2 border-t border-border">
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="px-3 py-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                {t('common.cancel')}
              </button>
              <button
                type="button"
                onClick={handleApply}
                className="px-3 py-1.5 text-sm bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
              >
                {t('common.apply')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}