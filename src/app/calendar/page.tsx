'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { AuthGuard } from '@/components/auth';
import { AppLayout } from '@/components/layout';
import { Button, Modal } from '@/components/ui';
import { CalendarGrid, EventForm, GoogleCalendarSettings } from '@/components/calendar';
import { useCalendarEvents, useCreateCalendarEvent, useUpdateCalendarEvent, useDeleteCalendarEvent } from '@/hooks/useCalendar';
import { CalendarEvent, CreateCalendarEventDto, UpdateCalendarEventDto } from '@/types/calendar';
import { usePageTitle } from '@/hooks/usePageTitle';
import { showSuccess, showError } from '@/components/ui/toast';
import { format, addMonths, subMonths } from 'date-fns';
import { ChevronLeft, ChevronRight, Plus, Settings } from 'lucide-react';
import { formatLocalDateTime } from '@/utils/dateFormatting';

function CalendarPage() {
  const t = useTranslations();
  usePageTitle('Calendar - Personal Hub');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [isEventFormOpen, setIsEventFormOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [eventToDelete, setEventToDelete] = useState<CalendarEvent | null>(null);
  const [showGoogleSettings, setShowGoogleSettings] = useState(false);

  const { data: events = [], isLoading, error } = useCalendarEvents(currentDate.getFullYear(), currentDate.getMonth() + 1);
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

  const handleDateClick = (date: Date) => {
    setSelectedDate(date);
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

  const handlePrevMonth = () => {
    setCurrentDate(subMonths(currentDate, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(addMonths(currentDate, 1));
  };

  const handleCloseEventForm = () => {
    setIsEventFormOpen(false);
    setSelectedEvent(null);
    setSelectedDate(null);
  };

  const handleEventDateChange = (eventId: number, newDate: Date) => {
    const event = events.find(e => e.id === eventId);
    if (!event) return;

    // Calculate the duration to maintain it
    const originalStart = new Date(event.startDateTime);
    const originalEnd = new Date(event.endDateTime);
    const duration = originalEnd.getTime() - originalStart.getTime();

    // For all-day events, set to midnight local time
    if (event.allDay) {
      const newStart = new Date(
        newDate.getFullYear(),
        newDate.getMonth(),
        newDate.getDate(),
        0, 0, 0, 0
      );
      const newEnd = new Date(newStart.getTime() + duration);

      const updateData: UpdateCalendarEventDto = {
        startDateTime: formatLocalDateTime(newStart),
        endDateTime: formatLocalDateTime(newEnd),
      };

      updateMutation.mutate({ id: eventId, data: updateData }, {
        onSuccess: () => {
          showSuccess(t('calendar.eventUpdated'));
        },
        onError: (error) => {
          showError(error instanceof Error ? error.message : t('calendar.updateFailed'));
        },
      });
    } else {
      // For timed events, preserve the local time
      // newDate already has the correct local time from CalendarGrid
      const newEnd = new Date(newDate.getTime() + duration);

      const updateData: UpdateCalendarEventDto = {
        startDateTime: formatLocalDateTime(newDate),
        endDateTime: formatLocalDateTime(newEnd),
      };

      updateMutation.mutate({ id: eventId, data: updateData }, {
        onSuccess: () => {
          showSuccess(t('calendar.eventUpdated'));
        },
        onError: (error) => {
          showError(error instanceof Error ? error.message : t('calendar.updateFailed'));
        },
      });
    }
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
              onClick={handlePrevMonth}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            
            <h2 className="text-xl font-semibold text-foreground min-w-[200px] text-center">
              {format(currentDate, 'MMMM yyyy')}
            </h2>
            
            <button
              onClick={handleNextMonth}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>

          <Button
            variant="secondary"
            onClick={() => setCurrentDate(new Date())}
          >
            {t('calendar.today')}
          </Button>
        </div>

        {/* Calendar Grid */}
        <CalendarGrid
          currentDate={currentDate}
          events={events}
          onDateClick={handleDateClick}
          onEventClick={handleEventClick}
          onEventDateChange={handleEventDateChange}
        />

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