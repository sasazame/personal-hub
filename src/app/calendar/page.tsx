'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { AuthGuard } from '@/components/auth';
import { AppLayout } from '@/components/layout';
import { Button, Modal } from '@/components/ui';
import { CalendarGrid, EventForm } from '@/components/calendar';
import { useAllCalendarEvents, useCreateCalendarEvent, useUpdateCalendarEvent, useDeleteCalendarEvent } from '@/hooks/useCalendar';
import { CalendarEvent, CreateCalendarEventDto, UpdateCalendarEventDto } from '@/types/calendar';
import { showSuccess, showError } from '@/components/ui/toast';
import { format, addMonths, subMonths } from 'date-fns';
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react';

function CalendarPage() {
  const t = useTranslations();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [isEventFormOpen, setIsEventFormOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [eventToDelete, setEventToDelete] = useState<CalendarEvent | null>(null);

  const { data: events = [], isLoading } = useAllCalendarEvents();
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
    if (selectedEvent) {
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
    if (eventToDelete) {
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

  if (isLoading) {
    return (
      <AppLayout>
        <div className="min-h-[400px] flex items-center justify-center">
          <div className="text-lg text-muted-foreground">{t('common.loading')}</div>
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
          <Button onClick={handleNewEvent} className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700">
            <Plus className="w-5 h-5 mr-2" />
            {t('calendar.newEvent')}
          </Button>
        </div>

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
              {format(currentDate, 'yyyy年 M月')}
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