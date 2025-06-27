'use client';

import { CalendarEvent } from '@/types/calendar';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, isToday } from 'date-fns';
import { cn } from '@/lib/cn';
import { useTheme } from '@/hooks/useTheme';

interface CalendarGridProps {
  currentDate: Date;
  events: CalendarEvent[];
  onDateClick: (date: Date) => void;
  onEventClick: (event: CalendarEvent) => void;
}

export function CalendarGrid({ currentDate, events, onDateClick, onEventClick }: CalendarGridProps) {
  // Ensure events is always an array
  const safeEvents = Array.isArray(events) ? events : [];
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const { theme } = useTheme();
  const startDate = new Date(monthStart);
  startDate.setDate(startDate.getDate() - monthStart.getDay());
  
  const endDate = new Date(monthEnd);
  endDate.setDate(endDate.getDate() + (6 - monthEnd.getDay()));

  const days = eachDayOfInterval({ start: startDate, end: endDate });

  const getEventsForDay = (date: Date) => {
    return safeEvents.filter(event => {
      const eventStart = new Date(event.startDateTime);
      const eventEnd = new Date(event.endDateTime);
      
      if (event.allDay) {
        return isSameDay(date, eventStart) || 
               (date >= eventStart && date <= eventEnd);
      }
      
      return isSameDay(date, eventStart);
    });
  };

  return (
    <div className={cn(
      "grid grid-cols-7 gap-px backdrop-blur-xl rounded-lg overflow-hidden border",
      theme === 'dark' 
        ? "bg-gray-800/20 border-gray-700/20"
        : "bg-white/20 border-white/20"
    )}>
      {/* Header */}
      {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
        <div
          key={day}
          className={cn(
            "backdrop-blur-xl p-3 text-center text-sm font-medium border-b",
            theme === 'dark'
              ? "bg-gray-800/30 text-gray-300 border-gray-700/10"
              : "bg-white/30 text-gray-600 border-white/10"
          )}
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
              "backdrop-blur-xl min-h-[120px] p-2 cursor-pointer transition-all duration-200 border-r border-b",
              theme === 'dark'
                ? "bg-gray-900/40 hover:bg-gray-800/60 border-gray-700/10"
                : "bg-white/40 hover:bg-white/60 border-white/10",
              !isCurrentMonth && (theme === 'dark' 
                ? "text-gray-500 bg-gray-800/20"
                : "text-gray-400 bg-white/20")
            )}
            onClick={() => onDateClick(day)}
          >
            <div className={cn(
              "text-sm font-medium mb-1",
              isDayToday && (theme === 'dark' ? "text-blue-400 font-bold" : "text-blue-600 font-bold"),
              !isDayToday && isCurrentMonth && (theme === 'dark' ? "text-gray-200" : "text-gray-700"),
              !isDayToday && !isCurrentMonth && (theme === 'dark' ? "text-gray-500" : "text-gray-400")
            )}>
              {format(day, 'd')}
              {isDayToday && (
                <div className="w-6 h-6 bg-gradient-to-br from-blue-500 to-indigo-600 text-white rounded-full flex items-center justify-center text-xs mt-1 shadow-lg">
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
                    event.color === 'blue' && (theme === 'dark' 
                      ? "bg-blue-400/20 text-blue-300 border border-blue-400/30"
                      : "bg-blue-500/20 text-blue-700 border border-blue-500/30"),
                    event.color === 'green' && (theme === 'dark'
                      ? "bg-green-400/20 text-green-300 border border-green-400/30"
                      : "bg-green-500/20 text-green-700 border border-green-500/30"),
                    event.color === 'red' && (theme === 'dark'
                      ? "bg-red-400/20 text-red-300 border border-red-400/30"
                      : "bg-red-500/20 text-red-700 border border-red-500/30"),
                    event.color === 'purple' && (theme === 'dark'
                      ? "bg-purple-400/20 text-purple-300 border border-purple-400/30"
                      : "bg-purple-500/20 text-purple-700 border border-purple-500/30"),
                    event.color === 'orange' && (theme === 'dark'
                      ? "bg-orange-400/20 text-orange-300 border border-orange-400/30"
                      : "bg-orange-500/20 text-orange-700 border border-orange-500/30")
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
                <div className={cn("text-xs font-medium", theme === 'dark' ? "text-gray-300" : "text-gray-600")}>
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