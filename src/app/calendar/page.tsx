'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { AuthGuard } from '@/components/auth';
import { AppLayout } from '@/components/layout';
import { Button, Modal } from '@/components/ui';
import { CalendarGrid, EventForm, GoogleCalendarSettings, WeeklyCalendar } from '@/components/calendar';
import { useCalendarEvents, useCreateCalendarEvent, useUpdateCalendarEvent, useDeleteCalendarEvent } from '@/hooks/useCalendar';
import { useCalendarEventMutation } from '@/hooks/useCalendarEventMutation';
import { CalendarEvent, CreateCalendarEventDto, UpdateCalendarEventDto, DragSelection, CalendarView } from '@/types/calendar';
import { usePageTitle } from '@/hooks/usePageTitle';
import { showSuccess, showError } from '@/components/ui/toast';
import { format, addMonths, subMonths, addWeeks, subWeeks, startOfWeek, endOfWeek } from 'date-fns';
import { ChevronLeft, ChevronRight, Plus, Settings, Calendar as CalendarIcon, CalendarDays } from 'lucide-react';

function CalendarPage() {
  const t = useTranslations();
  usePageTitle('Calendar - Personal Hub');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [isEventFormOpen, setIsEventFormOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [eventToDelete, setEventToDelete] = useState<CalendarEvent | null>(null);
  const [showGoogleSettings, setShowGoogleSettings] = useState(false);
  const [viewMode, setViewMode] = useState<CalendarView>('month');

  // For weekly view, we need events for the entire week
  const weekStart = startOfWeek(currentDate, { weekStartsOn: 0 });
  const weekEnd = endOfWeek(currentDate, { weekStartsOn: 0 });
  
  // Fetch events for both months if week spans across months
  const { data: events = [], isLoading, error } = useCalendarEvents(
    currentDate.getFullYear(),
    currentDate.getMonth() + 1
  );
  
  // Also fetch next month's events if week spans into next month
  const needsNextMonth = viewMode === 'week' && weekEnd.getMonth() !== weekStart.getMonth();
  const { data: nextMonthEvents = [] } = useCalendarEvents(
    weekEnd.getFullYear(),
    weekEnd.getMonth() + 1
  );
  
  // Combine events from both months if needed for weekly view
  const allEvents = viewMode === 'week' && needsNextMonth ? [...events, ...nextMonthEvents] : events;
  const createMutation = useCreateCalendarEvent();
  const updateMutation = useUpdateCalendarEvent();
  const deleteMutation = useDeleteCalendarEvent();

  const handleCreateEvent = (data: CreateCalendarEventDto) => {
    createMutation.mutate(data, {
      onSuccess: () => {
        showSuccess(t('calendar.eventCreated'));
        setIsEventFormOpen(false);
        setSelectedDate(null);
      },
      onError: (error) => {
        showError(error instanceof Error ? error.message : t('calendar.createFailed'));
      },
    });
  };

  const handleUpdateEvent = (data: UpdateCalendarEventDto) => {
    if (selectedEvent && selectedEvent.id) {
      updateMutation.mutate({ id: selectedEvent.id, data }, {
        onSuccess: () => {
          showSuccess(t('calendar.eventUpdated'));
          setIsEventFormOpen(false);
          setSelectedEvent(null);
        },
        onError: (error) => {
          showError(error instanceof Error ? error.message : t('calendar.updateFailed'));
        },
      });
    }
  };

  const handleDeleteEvent = () => {
    if (eventToDelete && eventToDelete.id) {
      deleteMutation.mutate(eventToDelete.id, {
        onSuccess: () => {
          showSuccess(t('calendar.eventDeleted'));
          setEventToDelete(null);
        },
        onError: (error) => {
          showError(error instanceof Error ? error.message : t('calendar.deleteFailed'));
        },
      });
    }
  };

  const handleDateClick = (date: Date, isAllDay: boolean = false) => {
    // Store whether this should be an all-day event
    const dateToUse = new Date(date);
    if (isAllDay) {
      // Add a marker to indicate this should be an all-day event
      (dateToUse as Date & { isAllDayEvent?: boolean }).isAllDayEvent = true;
    }
    setSelectedDate(dateToUse);
    setSelectedEvent(null);
    setIsEventFormOpen(true);
  };

  const handleEventClick = (event: CalendarEvent) => {
    setSelectedEvent(event);
    setSelectedDate(null);
    setIsEventFormOpen(true);
  };

  const handleNewEvent = () => {
    setSelectedEvent(null);
    setSelectedDate(new Date());
    setIsEventFormOpen(true);
  };

  const handlePrevPeriod = () => {
    if (viewMode === 'week') {
      setCurrentDate(subWeeks(currentDate, 1));
    } else {
      setCurrentDate(subMonths(currentDate, 1));
    }
  };

  const handleNextPeriod = () => {
    if (viewMode === 'week') {
      setCurrentDate(addWeeks(currentDate, 1));
    } else {
      setCurrentDate(addMonths(currentDate, 1));
    }
  };

  const handleDragSelection = (selection: DragSelection) => {
    // Create a date with the selected start time and store end time info
    const startDateTime = new Date(selection.date);
    const [startHour, startMinute] = selection.startTime.split(':').map(Number);
    startDateTime.setHours(startHour, startMinute, 0, 0);
    
    // Store the end time in a way EventForm can access
    (startDateTime as Date & { dragEndTime?: string }).dragEndTime = selection.endTime;
    
    setSelectedDate(startDateTime);
    setSelectedEvent(null);
    setIsEventFormOpen(true);
  };

  const handleCloseEventForm = () => {
    setIsEventFormOpen(false);
    setSelectedEvent(null);
    setSelectedDate(null);
  };

  const { handleEventDateChange: handleEventDateChangeBase } = useCalendarEventMutation();

  const handleEventDateChange = (eventId: number, newDate: Date) => {
    handleEventDateChangeBase({ eventId, newDate, events: allEvents });
  };

  if (isLoading) {
    return (
      <AppLayout>
        <div className="min-h-[400px] flex items-center justify-center">
          <div className="text-lg text-muted-foreground">{t('common.loading')}</div>
        </div>
      </AppLayout>
    );
  }

  if (error) {
    return (
      <AppLayout>
        <div className="min-h-[400px] flex items-center justify-center">
          <div className="text-center">
            <div className="text-lg text-red-500 mb-2">カレンダーデータの読み込みに失敗しました</div>
            <div className="text-sm text-muted-foreground">
              サーバーエラー: {error.message}
            </div>
            <Button 
              onClick={() => window.location.reload()} 
              className="mt-4"
              variant="secondary"
            >
              再読み込み
            </Button>
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">
              {t('calendar.title')}
            </h1>
            <p className="text-muted-foreground mt-1">
              {t('calendar.subtitle')}
            </p>
          </div>
          <div className="flex gap-2">
            <Button 
              variant="outline"
              onClick={() => setShowGoogleSettings(!showGoogleSettings)}
              className="gap-2"
            >
              <Settings className="w-4 h-4" />
              {t('calendar.googleSettings')}
            </Button>
            <Button 
              onClick={handleNewEvent} 
              gradient="green"
              size="lg"
              leftIcon={<Plus className="w-5 h-5" />}
            >
              {t('calendar.newEvent')}
            </Button>
          </div>
        </div>

        {/* Google Calendar Settings */}
        {showGoogleSettings && (
          <GoogleCalendarSettings />
        )}

        {/* Calendar Navigation */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={handlePrevPeriod}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            
            <h2 className="text-xl font-semibold text-foreground min-w-[200px] text-center">
              {viewMode === 'week' 
                ? `${format(weekStart, 'MMM d')} - ${format(weekEnd, 'MMM d, yyyy')}`
                : format(currentDate, 'MMMM yyyy')
              }
            </h2>
            
            <button
              onClick={handleNextPeriod}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>

          <div className="flex items-center gap-2">
            {/* View Mode Toggle */}
            <div className="flex rounded-lg border border-border overflow-hidden">
              <button
                onClick={() => setViewMode('month')}
                className={`px-3 py-2 text-sm font-medium transition-colors ${
                  viewMode === 'month'
                    ? 'bg-primary text-primary-foreground'
                    : 'hover:bg-muted'
                }`}
                title={t('calendar.monthlyView')}
              >
                <CalendarIcon className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('week')}
                className={`px-3 py-2 text-sm font-medium transition-colors border-l border-border ${
                  viewMode === 'week'
                    ? 'bg-primary text-primary-foreground'
                    : 'hover:bg-muted'
                }`}
                title={t('calendar.weeklyView')}
              >
                <CalendarDays className="w-4 h-4" />
              </button>
            </div>
            
            <Button
              variant="secondary"
              onClick={() => setCurrentDate(new Date())}
            >
              {t('calendar.today')}
            </Button>
          </div>
        </div>

        {/* Calendar View */}
        {viewMode === 'month' ? (
          <CalendarGrid
            currentDate={currentDate}
            events={allEvents}
            onDateClick={handleDateClick}
            onEventClick={handleEventClick}
            onEventDateChange={handleEventDateChange}
          />
        ) : (
          <WeeklyCalendar
            currentDate={currentDate}
            events={allEvents}
            onEventClick={handleEventClick}
            onDragSelection={handleDragSelection}
            onAllDayClick={(date) => handleDateClick(date, true)}
            onEventDateChange={handleEventDateChange}
            weekStartsOn={0}
          />
        )}

        {/* Event Form */}
        <EventForm
          isOpen={isEventFormOpen}
          onClose={handleCloseEventForm}
          onSubmit={selectedEvent ? 
            (data) => handleUpdateEvent(data as UpdateCalendarEventDto) : 
            handleCreateEvent
          }
          event={selectedEvent || undefined}
          defaultDate={selectedDate || undefined}
          isSubmitting={createMutation.isPending || updateMutation.isPending}
          onDelete={selectedEvent ? () => setEventToDelete(selectedEvent) : undefined}
        />

        {/* Delete Confirmation Modal */}
        {eventToDelete && (
          <Modal open={true} onClose={() => setEventToDelete(null)}>
            <div className="p-6 space-y-4">
              <h2 className="text-xl font-semibold text-foreground">{t('calendar.deleteEvent')}</h2>
              <p className="text-muted-foreground">
                {t('calendar.confirmDelete', { title: eventToDelete.title })}
              </p>
              <div className="flex gap-3 justify-end">
                <Button
                  variant="secondary"
                  onClick={() => setEventToDelete(null)}
                  disabled={deleteMutation.isPending}
                >
                  {t('common.cancel')}
                </Button>
                <Button
                  variant="danger"
                  onClick={handleDeleteEvent}
                  disabled={deleteMutation.isPending}
                >
                  {deleteMutation.isPending ? t('common.deleting') : t('common.delete')}
                </Button>
              </div>
            </div>
          </Modal>
        )}
      </div>
    </AppLayout>
  );
}

export default function Calendar() {
  return (
    <AuthGuard>
      <CalendarPage />
    </AuthGuard>
  );
}