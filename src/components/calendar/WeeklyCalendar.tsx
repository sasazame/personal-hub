'use client';

import React, { useState, useRef, useMemo, useEffect } from 'react';
import { format, startOfWeek, addDays, isSameDay, isToday } from 'date-fns';
import { useTranslations } from 'next-intl';
import { CalendarEvent, DragSelection } from '@/types/calendar';
import { cn } from '@/lib/cn';
import { useTheme } from '@/hooks/useTheme';

interface WeeklyCalendarProps {
  currentDate: Date;
  events: CalendarEvent[];
  onEventClick: (event: CalendarEvent) => void;
  onDragSelection?: (selection: DragSelection) => void;
  onAllDayClick?: (date: Date) => void;
  onEventDateChange?: (eventId: number, newDate: Date) => void;
  weekStartsOn?: 0 | 1;
}

const HOUR_HEIGHT = 80;
const TIME_SLOT_INTERVAL = 10;
const SLOTS_PER_HOUR = 60 / TIME_SLOT_INTERVAL;
const HOURS_IN_DAY = 24;

export function WeeklyCalendar({
  currentDate,
  events,
  onEventClick,
  onDragSelection,
  onAllDayClick,
  onEventDateChange,
  weekStartsOn = 0
}: WeeklyCalendarProps) {
  const t = useTranslations('calendar');
  const { theme } = useTheme();
  const gridRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState<{ date: Date; time: number } | null>(null);
  const [dragEnd, setDragEnd] = useState<{ date: Date; time: number } | null>(null);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [scrollbarWidth, setScrollbarWidth] = useState(0);
  const [draggedEvent, setDraggedEvent] = useState<CalendarEvent | null>(null);
  const [dragOverDate, setDragOverDate] = useState<{ date: Date; time: number } | null>(null);

  // Calculate scrollbar width
  useEffect(() => {
    if (gridRef.current) {
      const width = gridRef.current.offsetWidth - gridRef.current.clientWidth;
      setScrollbarWidth(width);
    }
  }, []);

  // Update current time every minute
  useEffect(() => {
    const interval = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(interval);
  }, []);

  // Auto-scroll to current time on mount
  useEffect(() => {
    if (gridRef.current) {
      const currentHour = new Date().getHours();
      const scrollPosition = Math.max(0, (currentHour - 2) * HOUR_HEIGHT);
      gridRef.current.scrollTop = scrollPosition;
    }
  }, []);

  const weekStart = startOfWeek(currentDate, { weekStartsOn });
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  const timeSlots = useMemo(() => {
    const slots = [];
    for (let hour = 0; hour < HOURS_IN_DAY; hour++) {
      for (let minute = 0; minute < 60; minute += TIME_SLOT_INTERVAL) {
        slots.push({
          hour,
          minute,
          label: minute === 0 ? format(new Date(2024, 0, 1, hour, minute), 'HH:mm') : ''
        });
      }
    }
    return slots;
  }, []);

  const eventsByDay = useMemo(() => {
    const grouped = new Map<string, CalendarEvent[]>();
    
    weekDays.forEach(day => {
      const dayKey = format(day, 'yyyy-MM-dd');
      grouped.set(dayKey, []);
    });

    events.forEach(event => {
      const eventStart = new Date(event.startDateTime);
      const eventEnd = new Date(event.endDateTime);
      
      if (event.allDay) {
        // For all-day events, add to each day it spans
        weekDays.forEach(day => {
          // Set times to midnight for proper date comparison
          const dayStart = new Date(day);
          dayStart.setHours(0, 0, 0, 0);
          
          const eventStartDate = new Date(eventStart);
          eventStartDate.setHours(0, 0, 0, 0);
          
          const eventEndDate = new Date(eventEnd);
          eventEndDate.setHours(23, 59, 59, 999);
          
          if (dayStart >= eventStartDate && dayStart <= eventEndDate) {
            const dayKey = format(day, 'yyyy-MM-dd');
            if (grouped.has(dayKey)) {
              grouped.get(dayKey)!.push(event);
            }
          }
        });
      } else {
        // For timed events, only add to the start day
        const dayKey = format(eventStart, 'yyyy-MM-dd');
        if (grouped.has(dayKey)) {
          grouped.get(dayKey)!.push(event);
        }
      }
    });

    return grouped;
  }, [events, weekDays]);

  const getEventStyle = (event: CalendarEvent): React.CSSProperties | null => {
    if (event.allDay) return null;

    const start = new Date(event.startDateTime);
    const end = new Date(event.endDateTime);
    
    const startMinutes = start.getHours() * 60 + start.getMinutes();
    const endMinutes = end.getHours() * 60 + end.getMinutes();
    const duration = Math.max(endMinutes - startMinutes, 30);

    const top = (startMinutes / 60) * HOUR_HEIGHT;
    const height = Math.max((duration / 60) * HOUR_HEIGHT, HOUR_HEIGHT / 2);

    return {
      position: 'absolute',
      top: `${top}px`,
      height: `${height}px`,
      left: '4px',
      right: '4px',
      zIndex: 10
    };
  };

  const handleMouseDown = (e: React.MouseEvent, date: Date, slotIndex: number) => {
    if (!onDragSelection) return;
    
    setIsDragging(true);
    const time = slotIndex * TIME_SLOT_INTERVAL;
    setDragStart({ date, time });
    setDragEnd({ date, time });
    e.preventDefault();
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !dragStart || !gridRef.current) return;

    const rect = gridRef.current.getBoundingClientRect();
    const relativeY = e.clientY - rect.top + gridRef.current.scrollTop;
    const slotIndex = Math.floor(relativeY / (HOUR_HEIGHT / SLOTS_PER_HOUR));
    const time = Math.max(0, Math.min(slotIndex * TIME_SLOT_INTERVAL, 24 * 60 - TIME_SLOT_INTERVAL));

    if (dragEnd && isSameDay(dragStart.date, dragEnd.date)) {
      setDragEnd({ date: dragStart.date, time });
    }
  };

  const handleMouseUp = () => {
    if (!isDragging || !dragStart || !dragEnd || !onDragSelection) {
      setIsDragging(false);
      setDragStart(null);
      setDragEnd(null);
      return;
    }

    const startTime = Math.min(dragStart.time, dragEnd.time);
    const endTime = Math.max(dragStart.time, dragEnd.time) + TIME_SLOT_INTERVAL;

    const selection: DragSelection = {
      date: dragStart.date,
      startTime: `${Math.floor(startTime / 60).toString().padStart(2, '0')}:${(startTime % 60).toString().padStart(2, '0')}`,
      endTime: `${Math.floor(endTime / 60).toString().padStart(2, '0')}:${(endTime % 60).toString().padStart(2, '0')}`
    };

    onDragSelection(selection);
    
    setIsDragging(false);
    setDragStart(null);
    setDragEnd(null);
  };

  const getDragSelectionStyle = (): React.CSSProperties | null => {
    if (!isDragging || !dragStart || !dragEnd || !isSameDay(dragStart.date, dragEnd.date)) {
      return null;
    }

    const startTime = Math.min(dragStart.time, dragEnd.time);
    const endTime = Math.max(dragStart.time, dragEnd.time) + TIME_SLOT_INTERVAL;
    
    const top = (startTime / 60) * HOUR_HEIGHT;
    const height = ((endTime - startTime) / 60) * HOUR_HEIGHT;

    return {
      position: 'absolute',
      top: `${top}px`,
      height: `${height}px`,
      left: '2px',
      right: '2px',
      backgroundColor: 'rgb(59 130 246 / 0.15)',
      border: '2px solid rgb(59 130 246)',
      borderRadius: '0.375rem',
      pointerEvents: 'none'
    };
  };

  const getCurrentTimePosition = () => {
    const hours = currentTime.getHours();
    const minutes = currentTime.getMinutes();
    const totalMinutes = hours * 60 + minutes;
    return (totalMinutes / 60) * HOUR_HEIGHT;
  };

  const handleAllDayClick = (date: Date) => {
    if (onAllDayClick) {
      onAllDayClick(date);
    }
  };

  // Event drag and drop handlers
  const handleEventDragStart = (e: React.DragEvent, event: CalendarEvent) => {
    setDraggedEvent(event);
    if (e.dataTransfer) {
      e.dataTransfer.effectAllowed = 'move';
    }
    // Add visual effect
    if (e.currentTarget instanceof HTMLElement) {
      e.currentTarget.style.opacity = '0.5';
    }
  };

  const handleEventDragEnd = (e: React.DragEvent) => {
    setDraggedEvent(null);
    setDragOverDate(null);
    // Reset visual effect
    if (e.currentTarget instanceof HTMLElement) {
      e.currentTarget.style.opacity = '1';
    }
  };

  const handleSlotDragOver = (e: React.DragEvent, date: Date, slotIndex: number) => {
    e.preventDefault();
    if (draggedEvent) {
      const time = slotIndex * TIME_SLOT_INTERVAL;
      setDragOverDate({ date, time });
    }
  };

  const handleSlotDrop = (e: React.DragEvent, date: Date, slotIndex: number) => {
    e.preventDefault();
    if (draggedEvent && onEventDateChange) {
      const hours = Math.floor(slotIndex * TIME_SLOT_INTERVAL / 60);
      const minutes = (slotIndex * TIME_SLOT_INTERVAL) % 60;
      
      const newDate = new Date(date);
      newDate.setHours(hours, minutes, 0, 0);
      
      onEventDateChange(draggedEvent.id!, newDate);
    }
    setDraggedEvent(null);
    setDragOverDate(null);
  };

  // Custom scrollbar styles
  const scrollbarStyles = `
    .weekly-calendar-scrollbar::-webkit-scrollbar {
      width: 10px;
    }
    .weekly-calendar-scrollbar::-webkit-scrollbar-track {
      background: rgb(var(--muted) / 0.3);
      border-radius: 10px;
    }
    .weekly-calendar-scrollbar::-webkit-scrollbar-thumb {
      background: rgb(var(--muted-foreground) / 0.3);
      border-radius: 10px;
      border: 2px solid transparent;
      background-clip: padding-box;
    }
    .weekly-calendar-scrollbar::-webkit-scrollbar-thumb:hover {
      background: rgb(var(--muted-foreground) / 0.5);
      background-clip: padding-box;
    }
  `;

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: scrollbarStyles }} />
      <div 
        className={cn(
          "w-full backdrop-blur-xl rounded-lg overflow-hidden border flex flex-col",
          theme === 'dark' 
            ? "bg-gray-800/20 border-gray-700/50"
            : "bg-white/20 border-gray-300/50"
        )}
        style={{ height: 'calc(100vh - 300px)', minHeight: '600px' }}
        data-testid="weekly-calendar">
        
        {/* Header */}
        <div className={cn(
          "flex",
          theme === 'dark' ? "bg-gray-800/30" : "bg-gray-200/70"
        )} style={{ height: '80px', paddingRight: `${scrollbarWidth}px` }}>
          <div className={cn(
            "w-20 flex-shrink-0 border-r",
            theme === 'dark' ? "border-gray-700/30" : "border-gray-200"
          )} />
          {weekDays.map((day) => {
            const dayOfWeek = day.getDay();
            return (
              <div
                key={day.toISOString()}
                className={cn(
                  "flex-1 text-center border-r flex flex-col items-center justify-center py-2",
                  theme === 'dark' ? "border-gray-700/30" : "border-gray-200",
                  // Sunday (index 0) - red background
                  dayOfWeek === 0 && (theme === 'dark' ? "bg-red-900/20" : "bg-red-100"),
                  // Saturday (index 6) - blue background
                  dayOfWeek === 6 && (theme === 'dark' ? "bg-blue-900/20" : "bg-blue-100"),
                  // Weekdays - darker gray background to match monthly view
                  dayOfWeek > 0 && dayOfWeek < 6 && (theme === 'dark' ? "bg-gray-800/30" : "bg-gray-200/70"),
                  isToday(day) && "bg-primary/10"
                )}
              >
                <div className={cn(
                  "text-sm font-medium mb-1",
                  theme === 'dark' ? "text-gray-300" : "text-gray-600"
                )}>
                  {format(day, 'EEE')}
                </div>
                <div className={`text-lg font-semibold text-foreground ${
                  isToday(day) ? "bg-primary text-primary-foreground rounded-full w-10 h-10 flex items-center justify-center" : ""
                }`}>
                  {format(day, 'd')}
                </div>
              </div>
            )
          })}
        </div>

        {/* All-day section */}
        <div className={cn(
          "flex border-b min-h-[80px]",
          theme === 'dark' 
            ? "border-gray-700/30 bg-gray-800/20" 
            : "border-gray-200 bg-gray-100/30"
        )} style={{ paddingRight: `${scrollbarWidth}px` }}>
          <div className={cn(
            "text-xs p-2 w-20 flex-shrink-0 border-r flex items-start justify-end pt-3",
            theme === 'dark' 
              ? "text-gray-300 border-gray-700/30" 
              : "text-gray-600 border-gray-200"
          )}>
            {t('allDay')}
          </div>
          {weekDays.map((day) => {
            const dayKey = format(day, 'yyyy-MM-dd');
            const dayEvents = eventsByDay.get(dayKey) || [];
            const allDayEvents = dayEvents.filter(e => e.allDay);

            return (
              <div 
                key={day.toISOString()} 
                className={cn(
                  "flex-1 border-r p-2 flex flex-col gap-1 overflow-y-auto max-h-[120px] cursor-pointer transition-colors",
                  theme === 'dark' 
                    ? "border-gray-700/30 hover:bg-gray-800/40" 
                    : "border-gray-200 hover:bg-gray-100/40",
                  draggedEvent && draggedEvent.allDay && dragOverDate && isSameDay(dragOverDate.date, day) &&
                    (theme === 'dark' ? "bg-blue-900/30" : "bg-blue-100/30")
                )}
                onClick={() => handleAllDayClick(day)}
                onDragOver={(e) => {
                  e.preventDefault();
                  if (draggedEvent && draggedEvent.allDay) {
                    setDragOverDate({ date: day, time: 0 });
                  }
                }}
                onDrop={(e) => {
                  e.preventDefault();
                  if (draggedEvent && draggedEvent.allDay && onEventDateChange) {
                    onEventDateChange(draggedEvent.id!, day);
                  }
                  setDraggedEvent(null);
                  setDragOverDate(null);
                }}
              >
                {allDayEvents.map((event, index) => (
                  <div
                    key={`allday-${event.id}-${dayKey}-${index}`}
                    className={cn(
                      "text-xs rounded px-2 py-1.5 cursor-move truncate font-medium transition-opacity",
                      onEventDateChange && "hover:opacity-80",
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
                        : "bg-orange-500/20 text-orange-700 border border-orange-500/30"),
                      !event.color && (theme === 'dark'
                        ? "bg-blue-400/20 text-blue-300 border border-blue-400/30"
                        : "bg-blue-500/20 text-blue-700 border border-blue-500/30")
                    )}
                    onClick={(e) => {
                      e.stopPropagation();
                      onEventClick(event);
                    }}
                    draggable
                    onDragStart={(e) => {
                      e.stopPropagation();
                      handleEventDragStart(e, event);
                    }}
                    onDragEnd={handleEventDragEnd}
                  >
                    {event.title}
                  </div>
                ))}
              </div>
            );
          })}
        </div>

        {/* Time grid */}
        <div className="flex-1 relative overflow-hidden">
          <div 
            ref={gridRef}
            className={cn(
              "flex h-full overflow-y-auto overflow-x-hidden weekly-calendar-scrollbar",
              theme === 'dark' ? "bg-gray-900/40" : "bg-white/60"
            )}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
          >
            {/* Time labels */}
            <div className={cn(
              "w-20 flex-shrink-0 border-r sticky left-0 z-10",
              theme === 'dark' 
                ? "border-gray-700/30 bg-gray-800/20" 
                : "border-gray-200 bg-gray-100/50"
            )}>
              {timeSlots.filter(slot => slot.minute === 0).map((slot) => (
                <div key={`${slot.hour}-${slot.minute}`} className="relative" style={{ height: `${HOUR_HEIGHT}px` }}>
                  <span className={cn(
                    "absolute -top-2 right-2 text-xs font-medium",
                    theme === 'dark' ? "text-gray-300" : "text-gray-600"
                  )}>
                    {slot.label}
                  </span>
                </div>
              ))}
            </div>

            {/* Days grid */}
            <div className="flex flex-1">
              {weekDays.map((day, dayIndex) => {
                const dayKey = format(day, 'yyyy-MM-dd');
                const dayEvents = eventsByDay.get(dayKey) || [];
                const timedEvents = dayEvents.filter(e => !e.allDay);
                const dayOfWeek = day.getDay();

                return (
                  <div key={day.toISOString()} 
                    className={cn(
                      "flex-1 relative border-r",
                      theme === 'dark' ? "border-gray-700/30" : "border-gray-200",
                      dayIndex === weekDays.length - 1 && "border-r-0",
                      // Sunday - red background
                      dayOfWeek === 0 && (theme === 'dark' ? "bg-red-900/10" : "bg-red-50/50"),
                      // Saturday - blue background
                      dayOfWeek === 6 && (theme === 'dark' ? "bg-blue-900/10" : "bg-blue-50/50"),
                      // Weekdays - normal background
                      dayOfWeek > 0 && dayOfWeek < 6 && "bg-transparent"
                    )}
                    style={{ minHeight: `${HOURS_IN_DAY * HOUR_HEIGHT}px` }}>
                    {/* Hour lines */}
                    {timeSlots.filter(slot => slot.minute === 0).map((slot) => (
                      <div
                        key={`line-${slot.hour}`}
                        className={cn(
                          "absolute left-0 right-0 border-b",
                          theme === 'dark' ? "border-gray-700/30" : "border-gray-200"
                        )}
                        style={{ top: `${slot.hour * HOUR_HEIGHT}px` }}
                      />
                    ))}
                    
                    {/* Current time indicator */}
                    {isToday(day) && (
                      <div
                        className="absolute left-0 right-0 h-0.5 bg-red-500 z-30 pointer-events-none"
                        style={{ top: `${getCurrentTimePosition()}px` }}
                      >
                        <div className="absolute w-2 h-2 bg-red-500 rounded-full -left-1 -top-[3px]" />
                      </div>
                    )}
                    
                    {/* Time slots for interaction */}
                    {timeSlots.map((slot, index) => {
                      return (
                        <div
                          key={`${slot.hour}-${slot.minute}`}
                          className={cn(
                            "absolute left-0 right-0 cursor-pointer transition-colors",
                            theme === 'dark' 
                              ? "hover:bg-gray-700/30" 
                              : "hover:bg-gray-200/40"
                          )}
                          style={{ 
                            height: `${HOUR_HEIGHT / SLOTS_PER_HOUR}px`,
                            top: `${index * (HOUR_HEIGHT / SLOTS_PER_HOUR)}px`,
                            backgroundColor: dragOverDate && isSameDay(dragOverDate.date, day) && 
                              Math.abs(dragOverDate.time - (index * TIME_SLOT_INTERVAL)) < TIME_SLOT_INTERVAL
                              ? (theme === 'dark' ? 'rgba(59, 130, 246, 0.2)' : 'rgba(59, 130, 246, 0.1)')
                              : undefined
                          }}
                          onMouseDown={(e) => handleMouseDown(e, day, index)}
                          onDragOver={(e) => handleSlotDragOver(e, day, index)}
                          onDrop={(e) => handleSlotDrop(e, day, index)}
                        />
                      );
                    })}

                    {/* Events */}
                    {timedEvents.map((event, index) => {
                      const style = getEventStyle(event);
                      if (!style) return null;

                      return (
                        <div
                          key={`timed-${event.id}-${dayKey}-${index}`}
                          className={cn(
                            "absolute rounded px-2 py-1 cursor-move overflow-hidden text-xs transition-opacity",
                            onEventDateChange && "hover:opacity-80",
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
                              : "bg-orange-500/20 text-orange-700 border border-orange-500/30"),
                            !event.color && (theme === 'dark'
                              ? "bg-blue-400/20 text-blue-300 border border-blue-400/30"
                              : "bg-blue-500/20 text-blue-700 border border-blue-500/30")
                          )}
                          style={style}
                          onClick={() => onEventClick(event)}
                          draggable
                          onDragStart={(e) => handleEventDragStart(e, event)}
                          onDragEnd={handleEventDragEnd}
                        >
                          <div className="font-semibold">
                            {format(new Date(event.startDateTime), 'HH:mm')}
                          </div>
                          <div className="font-medium truncate mt-0.5">
                            {event.title}
                          </div>
                        </div>
                      );
                    })}

                    {/* Drag selection */}
                    {isDragging && dragStart && dragEnd && isSameDay(dragStart.date, day) && (
                      <div style={getDragSelectionStyle() || {}} />
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}