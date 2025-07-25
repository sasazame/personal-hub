'use client';

import { CalendarEvent } from '@/types/calendar';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, isToday } from 'date-fns';
import { cn } from '@/lib/cn';
import { useTheme } from '@/hooks/useTheme';
import { useState } from 'react';
import { useEventDragAndDrop } from '@/hooks/useEventDragAndDrop';

interface CalendarGridProps {
  currentDate: Date;
  events: CalendarEvent[];
  onDateClick: (date: Date) => void;
  onEventClick: (event: CalendarEvent) => void;
  onEventDateChange?: (eventId: number, newDate: Date) => void;
}

export function CalendarGrid({ currentDate, events, onDateClick, onEventClick, onEventDateChange }: CalendarGridProps) {
  // Ensure events is always an array
  const safeEvents = Array.isArray(events) ? events : [];
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const { theme } = useTheme();
  const startDate = new Date(monthStart);
  // Start from Sunday (getDay() returns 0 for Sunday)
  startDate.setDate(startDate.getDate() - monthStart.getDay());
  
  const endDate = new Date(monthEnd);
  endDate.setDate(endDate.getDate() + (6 - monthEnd.getDay()));

  const days = eachDayOfInterval({ start: startDate, end: endDate });
  
  const [expandedDates, setExpandedDates] = useState<Set<string>>(new Set());
  
  const {
    dragOverDate,
    handleDragStart,
    handleDragOver: baseDragOver,
    handleDragEnter,
    handleDragLeave,
    handleDrop: baseDrop,
  } = useEventDragAndDrop(onEventDateChange);

  const getEventsForDay = (date: Date) => {
    return safeEvents
      .filter(event => {
        const eventStart = new Date(event.startDateTime);
        const eventEnd = new Date(event.endDateTime);
        
        if (event.allDay) {
          // For all-day events, compare dates without considering time
          return isSameDay(date, eventStart) || 
                 (date >= eventStart && date <= eventEnd);
        }
        
        // For timed events, check if the event's local date matches the calendar date
        // This ensures events appear on the correct day regardless of timezone
        return eventStart.getFullYear() === date.getFullYear() &&
               eventStart.getMonth() === date.getMonth() &&
               eventStart.getDate() === date.getDate();
      })
      .sort((a, b) => {
        // Sort by start time first
        const startDiff = new Date(a.startDateTime).getTime() - new Date(b.startDateTime).getTime();
        if (startDiff !== 0) return startDiff;
        
        // If start times are equal, sort by end time
        return new Date(a.endDateTime).getTime() - new Date(b.endDateTime).getTime();
      });
  };

  const formatEventTitle = (event: CalendarEvent) => {
    if (event.allDay) {
      return event.title;
    }
    const eventDate = new Date(event.startDateTime);
    const hours = eventDate.getHours().toString().padStart(2, '0');
    const minutes = eventDate.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes} ${event.title}`;
  };

  const toggleDateExpansion = (date: Date) => {
    const dateKey = date.toISOString().split('T')[0];
    const newExpanded = new Set(expandedDates);
    if (newExpanded.has(dateKey)) {
      newExpanded.delete(dateKey);
    } else {
      newExpanded.add(dateKey);
    }
    setExpandedDates(newExpanded);
  };

  const isDateExpanded = (date: Date) => {
    const dateKey = date.toISOString().split('T')[0];
    return expandedDates.has(dateKey);
  };

  const handleDragStartWrapper = (e: React.DragEvent, event: CalendarEvent) => {
    handleDragStart(e, event);
    // Add a visual effect to the dragged element
    if (e.currentTarget instanceof HTMLElement) {
      e.currentTarget.style.opacity = '0.5';
    }
  };

  const handleDragEnd = (e: React.DragEvent) => {
    // Reset the opacity
    if (e.currentTarget instanceof HTMLElement) {
      e.currentTarget.style.opacity = '1';
    }
  };

  const handleDragOver = (e: React.DragEvent, date: Date) => {
    baseDragOver(e);
    handleDragEnter(date);
  };

  const handleDrop = (e: React.DragEvent, date: Date) => {
    baseDrop(e, date);
  };

  return (
    <div 
      data-testid="calendar-grid"
      className={cn(
        "grid grid-cols-7 backdrop-blur-xl rounded-lg border",
        theme === 'dark' 
          ? "bg-gray-800/20 border-gray-700/50"
          : "bg-white/20 border-gray-300/50",
        "pb-1" // Add small padding at bottom to ensure last row colors are visible
      )}>
      {/* Header */}
      {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day, index) => (
        <div
          key={day}
          className={cn(
            "backdrop-blur-xl p-3 text-center text-sm font-medium border-b border-r",
            theme === 'dark'
              ? "text-gray-300 border-gray-700/30"
              : "text-gray-600 border-gray-200",
            // Sunday (index 0) - red background
            index === 0 && (theme === 'dark' 
              ? "bg-red-900/20" 
              : "bg-red-100"),
            // Saturday (index 6) - blue background
            index === 6 && (theme === 'dark' 
              ? "bg-blue-900/20" 
              : "bg-blue-100"),
            // Weekdays - darker gray background to match weekly view
            index > 0 && index < 6 && (theme === 'dark'
              ? "bg-gray-800/30"
              : "bg-gray-200/70")
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
                ? "bg-gray-900/40 hover:bg-gray-800/60 border-gray-700/30"
                : "bg-white/40 hover:bg-white/60 border-gray-200",
              !isCurrentMonth && (theme === 'dark' 
                ? "text-gray-500 bg-gray-800/20"
                : "text-gray-400 bg-gray-100/50"),
              dragOverDate && isSameDay(dragOverDate, day) && (theme === 'dark'
                ? "bg-blue-900/40 border-blue-500"
                : "bg-blue-100/40 border-blue-500")
            )}
            onClick={() => onDateClick(day)}
            onDragOver={(e) => handleDragOver(e, day)}
            onDragLeave={handleDragLeave}
            onDrop={(e) => handleDrop(e, day)}
          >
            <div className="mb-1">
              {isDayToday ? (
                <div className="w-6 h-6 bg-gradient-to-br from-blue-500 to-indigo-600 text-white rounded-full flex items-center justify-center text-xs shadow-lg font-bold">
                  {format(day, 'd')}
                </div>
              ) : (
                <div className={cn(
                  "text-sm font-medium",
                  isCurrentMonth && (theme === 'dark' ? "text-gray-200" : "text-gray-700"),
                  !isCurrentMonth && (theme === 'dark' ? "text-gray-500" : "text-gray-400")
                )}>
                  {format(day, 'd')}
                </div>
              )}
            </div>
            
            <div className="space-y-1">
              {(isDateExpanded(day) ? dayEvents : dayEvents.slice(0, 3)).map((event) => (
                <div
                  key={event.id}
                  draggable={onEventDateChange !== undefined}
                  onDragStart={(e) => handleDragStartWrapper(e, event)}
                  onDragEnd={handleDragEnd}
                  className={cn(
                    "text-xs p-1 rounded truncate cursor-pointer hover:opacity-80 transition-opacity",
                    onEventDateChange && "cursor-move",
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
                  title={formatEventTitle(event)}
                >
                  {formatEventTitle(event)}
                </div>
              ))}
              {dayEvents.length > 3 && !isDateExpanded(day) && (
                <div 
                  className={cn(
                    "text-xs font-medium cursor-pointer hover:underline",
                    theme === 'dark' ? "text-gray-300" : "text-gray-600"
                  )}
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleDateExpansion(day);
                  }}
                >
                  +{dayEvents.length - 3} more
                </div>
              )}
              {isDateExpanded(day) && dayEvents.length > 3 && (
                <div 
                  className={cn(
                    "text-xs font-medium cursor-pointer hover:underline",
                    theme === 'dark' ? "text-gray-300" : "text-gray-600"
                  )}
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleDateExpansion(day);
                  }}
                >
                  Show less
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}