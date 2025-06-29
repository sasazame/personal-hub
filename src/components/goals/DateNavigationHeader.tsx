'use client';

import React, { useEffect, useCallback } from 'react';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';
import { format, addDays, subDays } from 'date-fns';
import { ja, enUS } from 'date-fns/locale';
import { useTranslations, useLocale } from 'next-intl';
import { DatePicker } from '@/components/ui/DatePicker';

interface DateNavigationHeaderProps {
  selectedDate: Date;
  onDateChange: (date: Date) => void;
}

export function DateNavigationHeader({ selectedDate, onDateChange }: DateNavigationHeaderProps) {
  const t = useTranslations();
  const locale = useLocale();
  const dateLocale = locale === 'ja' ? ja : enUS;
  
  const handlePrevDay = useCallback(() => {
    onDateChange(subDays(selectedDate, 1));
  }, [selectedDate, onDateChange]);

  const handleNextDay = useCallback(() => {
    onDateChange(addDays(selectedDate, 1));
  }, [selectedDate, onDateChange]);

  const handleToday = useCallback(() => {
    onDateChange(new Date());
  }, [onDateChange]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      switch (e.key) {
        case 'ArrowLeft':
          e.preventDefault();
          e.stopPropagation();
          handlePrevDay();
          break;
        case 'ArrowRight':
          e.preventDefault();
          e.stopPropagation();
          handleNextDay();
          break;
        case 't':
        case 'T':
          e.preventDefault();
          e.stopPropagation();
          handleToday();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [handlePrevDay, handleNextDay, handleToday]);

  return (
    <div className="bg-card border border-border rounded-lg shadow-sm p-4 mb-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        {/* Navigation Controls */}
        <div className="flex items-center space-x-2">
          <button
            onClick={handlePrevDay}
            className="p-2 text-muted-foreground hover:text-foreground rounded-lg hover:bg-muted transition-colors"
            aria-label={t('goal.previousDay')}
          >
            <ChevronLeftIcon className="h-5 w-5" />
          </button>

          <button
            onClick={handleToday}
            className="px-4 py-2 text-sm font-medium bg-blue-600 text-white hover:bg-blue-700 rounded-lg transition-colors"
          >
            {t('goal.today')}
          </button>

          <button
            onClick={handleNextDay}
            className="p-2 text-muted-foreground hover:text-foreground rounded-lg hover:bg-muted transition-colors"
            aria-label={t('goal.nextDay')}
          >
            <ChevronRightIcon className="h-5 w-5" />
          </button>
        </div>

        {/* Date Display and Picker */}
        <div className="flex items-center space-x-4">
          <span className="text-lg font-semibold text-foreground">
            {format(selectedDate, locale === 'ja' ? 'yyyy年M月d日(EEEE)' : 'EEEE, MMMM d, yyyy', { locale: dateLocale })}
          </span>
          
          <DatePicker
            value={selectedDate}
            onChange={(date) => date && onDateChange(date)}
            placeholder={t('goal.changeDate')}
          />
        </div>

        {/* Keyboard Shortcuts */}
        <div className="text-sm text-muted-foreground hidden lg:flex items-center gap-1">
          <span>{t('goal.shortcuts')}:</span>
          <kbd className="px-2 py-0.5 text-xs font-semibold bg-muted border border-border rounded">←</kbd>
          <kbd className="px-2 py-0.5 text-xs font-semibold bg-muted border border-border rounded">→</kbd>
          <kbd className="px-2 py-0.5 text-xs font-semibold bg-muted border border-border rounded">T</kbd>
        </div>
      </div>
    </div>
  );
}