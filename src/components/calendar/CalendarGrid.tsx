'use client';

import { CalendarEvent } from '@/types/calendar';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, isToday } from 'date-fns';
import { cn } from '@/lib/cn';

interface CalendarGridProps {
  currentDate: Date;
  events: CalendarEvent[];
  onDateClick: (date: Date) => void;
  onEventClick: (event: CalendarEvent) => void;
}

export function CalendarGrid({ currentDate, events, onDateClick, onEventClick }: CalendarGridProps) {
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const startDate = new Date(monthStart);
  startDate.setDate(startDate.getDate() - monthStart.getDay());
  
  const endDate = new Date(monthEnd);
  endDate.setDate(endDate.getDate() + (6 - monthEnd.getDay()));

  const days = eachDayOfInterval({ start: startDate, end: endDate });

  const getEventsForDay = (date: Date) => {
    return events.filter(event => {
      const eventStart = new Date(event.startDate);
      const eventEnd = new Date(event.endDate);
      
      if (event.allDay) {
        return isSameDay(date, eventStart) || 
               (date >= eventStart && date <= eventEnd);
      }
      
      return isSameDay(date, eventStart);
    });
  };

  return (
    <div className="grid grid-cols-7 gap-px bg-gray-200 dark:bg-gray-700 rounded-lg overflow-hidden">
      {/* Header */}
      {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
        <div
          key={day}
          className="bg-gray-50 dark:bg-gray-800 p-3 text-center text-sm font-medium text-gray-500 dark:text-gray-400"
        >
          {day}
        </div>
      ))}
      
      {/* Calendar Days */}
      {days.map((day) => {
        const dayEvents = getEventsForDay(day);
        const isCurrentMonth = isSameMonth(day, currentDate);
        const isDayToday = isToday(day);
        
        return (
          <div
            key={day.toISOString()}
            className={cn(
              "bg-white dark:bg-gray-900 min-h-[120px] p-2 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors",
              !isCurrentMonth && "text-gray-400 dark:text-gray-600 bg-gray-50 dark:bg-gray-800"
            )}
            onClick={() => onDateClick(day)}
          >
            <div className={cn(
              "text-sm font-medium mb-1",
              isDayToday && "text-blue-600 dark:text-blue-400 font-bold"
            )}>
              {format(day, 'd')}
              {isDayToday && (
                <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs mt-1">
                  {format(day, 'd')}
                </div>
              )}
            </div>
            
            <div className="space-y-1">
              {dayEvents.slice(0, 3).map((event) => (
                <div
                  key={event.id}
                  className={cn(
                    "text-xs p-1 rounded truncate cursor-pointer hover:opacity-80 transition-opacity",
                    event.color === 'blue' && "bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200",
                    event.color === 'green' && "bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200",
                    event.color === 'red' && "bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200",
                    event.color === 'purple' && "bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200",
                    event.color === 'orange' && "bg-orange-100 dark:bg-orange-900 text-orange-800 dark:text-orange-200"
                  )}
                  onClick={(e) => {
                    e.stopPropagation();
                    onEventClick(event);
                  }}
                  title={event.title}
                >
                  {event.title}
                </div>
              ))}
              {dayEvents.length > 3 && (
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  +{dayEvents.length - 3} more
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}