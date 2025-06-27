'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useTranslations } from 'next-intl';
import { CalendarEvent, CreateCalendarEventDto } from '@/types/calendar';
import { Button, Input, TextArea, Modal } from '@/components/ui';
import { Switch } from '@/components/ui/switch';
import { useGoogleAuth } from '@/hooks/useGoogleIntegration';
import { useFormSubmit } from '@/hooks/useFormSubmit';
import { useLocale } from '@/contexts/LocaleContext';

// Schema and type will be created inside component to access translations

interface EventFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateCalendarEventDto) => void;
  event?: CalendarEvent;
  defaultDate?: Date;
  isSubmitting?: boolean;
  onDelete?: () => void;
}

// Color options will be created inside component to access translations

export function EventForm({ isOpen, onClose, onSubmit, event, defaultDate, isSubmitting, onDelete }: EventFormProps) {
  const t = useTranslations();
  const { hasIntegration } = useGoogleAuth();
  const { locale } = useLocale();
  const [selectedColor, setSelectedColor] = useState(event?.color || 'blue');
  
  const eventSchema = z.object({
    title: z.string().min(1, t('calendar.titleRequired')),
    description: z.string().optional(),
    startDateTime: z.string().min(1, t('calendar.startDateRequired')),
    endDateTime: z.string().min(1, t('calendar.endDateRequired')),
    location: z.string().optional(),
    allDay: z.boolean(),
    color: z.string().optional(),
    reminders: z.array(z.any()).optional(),
    recurrence: z.any().optional(),
    syncToGoogle: z.boolean().optional(),
  });
  
  type EventFormData = z.infer<typeof eventSchema>;
  
  const colorOptions = [
    { value: 'blue', label: t('calendar.colors.blue'), class: 'bg-blue-500' },
    { value: 'green', label: t('calendar.colors.green'), class: 'bg-green-500' },
    { value: 'red', label: t('calendar.colors.red'), class: 'bg-red-500' },
    { value: 'purple', label: t('calendar.colors.purple'), class: 'bg-purple-500' },
    { value: 'orange', label: t('calendar.colors.orange'), class: 'bg-orange-500' },
  ];
  
  // Helper to format datetime for HTML datetime-local input
  const formatDateTimeForInput = (date: Date | string) => {
    const d = typeof date === 'string' ? new Date(date) : date;
    // datetime-local requires YYYY-MM-DDTHH:mm format
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const hours = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };

  const getDefaultValues = () => {
    if (event) {
      return {
        title: event.title,
        description: event.description || '',
        startDateTime: formatDateTimeForInput(event.startDateTime),
        endDateTime: formatDateTimeForInput(event.endDateTime),
        location: event.location || '',
        allDay: event.allDay,
        color: event.color || 'blue',
        reminders: event.reminders || [],
        recurrence: event.recurrence,
        syncToGoogle: event.syncToGoogle ?? true,
      };
    }
    return {
      title: '',
      description: '',
      startDateTime: defaultDate ? formatDateTimeForInput(defaultDate) : formatDateTimeForInput(new Date()),
      endDateTime: defaultDate ? formatDateTimeForInput(new Date(defaultDate.getTime() + 60 * 60 * 1000)) : formatDateTimeForInput(new Date(Date.now() + 60 * 60 * 1000)),
      location: '',
      allDay: false,
      color: 'blue',
      reminders: [],
      recurrence: undefined,
      syncToGoogle: true,
    };
  };

  const form = useForm<EventFormData>({
    resolver: zodResolver(eventSchema),
    defaultValues: getDefaultValues()
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
    reset,
  } = form;

  const allDay = watch('allDay');

  // Update form when defaultDate changes or when modal opens with event
  useEffect(() => {
    if (isOpen) {
      const newValues = getDefaultValues();
      reset(newValues);
      setSelectedColor(newValues.color || 'blue');
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, event, defaultDate, reset]);

  // Get datetime input pattern based on locale
  const getDateTimePattern = () => {
    if (locale === 'ja') {
      return 'yyyy/MM/dd HH:mm';
    }
    return 'MM/dd/yyyy, hh:mm a';
  };

  // Transform function for event form data
  const transformEventData = (data: EventFormData): CreateCalendarEventDto => {
    const formatDateTime = (dateTimeLocal: string, allDay: boolean) => {
      if (!dateTimeLocal) return '';
      
      if (allDay) {
        // For all-day events, use date only and set to start of day
        const dateOnly = dateTimeLocal.split('T')[0];
        return `${dateOnly}T00:00:00`;
      } else {
        // For timed events, convert datetime-local to ISO 8601
        // datetime-local format: YYYY-MM-DDTHH:mm
        // We need to treat this as local time and convert properly
        const date = new Date(dateTimeLocal);
        return date.toISOString();
      }
    };

    return {
      ...data,
      startDateTime: formatDateTime(data.startDateTime, data.allDay),
      endDateTime: formatDateTime(data.endDateTime, data.allDay),
      // Ensure required fields have default values
      reminders: data.reminders || [],
      recurrence: data.recurrence || undefined,
      location: data.location || undefined,
      description: data.description || undefined,
    };
  };

  // Use the generic form submit hook
  const { handleSubmit: handleFormSubmit, isSubmitting: isFormSubmitting } = useFormSubmit<EventFormData, CreateCalendarEventDto>(
    {
      onSubmit,
      transform: transformEventData,
      resetOnSuccess: true,
      closeOnSuccess: true,
    },
    form,
    onClose
  );
  
  // Use either the prop or the hook's isSubmitting state
  const submitting = isSubmitting ?? isFormSubmitting;

  const handleClose = () => {
    reset();
    onClose();
  };

  return (
    <Modal open={isOpen} onClose={handleClose}>
      <div className="p-6">
        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
        <div>
          <h2 className="text-xl font-semibold text-foreground mb-4">
            {event ? t('calendar.editEvent') : t('calendar.newEvent')}
          </h2>
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            {t('calendar.eventTitle')} *
          </label>
          <Input
            {...register('title')}
            label=""
            placeholder={t('calendar.eventTitlePlaceholder')}
            error={errors.title?.message}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            {t('calendar.eventDescription')}
          </label>
          <TextArea
            {...register('description')}
            label=""
            placeholder={t('calendar.eventDescriptionPlaceholder')}
            rows={3}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            {t('calendar.location')}
          </label>
          <Input
            {...register('location')}
            label=""
            placeholder={t('calendar.locationPlaceholder')}
          />
        </div>

        <div className="flex items-center gap-4">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              {...register('allDay')}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-sm text-foreground">{t('calendar.allDay')}</span>
          </label>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              {t('calendar.startDate')} * {!allDay && <span className="text-xs text-muted-foreground">({getDateTimePattern()})</span>}
            </label>
            <Input
              type={allDay ? 'date' : 'datetime-local'}
              {...register('startDateTime')}
              label=""
              error={errors.startDateTime?.message}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              {t('calendar.endDate')} * {!allDay && <span className="text-xs text-muted-foreground">({getDateTimePattern()})</span>}
            </label>
            <Input
              type={allDay ? 'date' : 'datetime-local'}
              {...register('endDateTime')}
              label=""
              error={errors.endDateTime?.message}
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            {t('calendar.color')} *
          </label>
          <div className="flex gap-2">
            {colorOptions.map((color) => (
              <button
                key={color.value}
                type="button"
                onClick={() => {
                  setSelectedColor(color.value);
                  setValue('color', color.value);
                }}
                className={`w-8 h-8 rounded-full ${color.class} ${
                  selectedColor === color.value
                    ? 'ring-2 ring-gray-400 ring-offset-2'
                    : 'hover:ring-2 hover:ring-gray-300 hover:ring-offset-1'
                } transition-all`}
                title={color.label}
              />
            ))}
          </div>
          {errors.color && (
            <p className="text-sm text-red-600 dark:text-red-400 mt-1">
              {errors.color.message}
            </p>
          )}
        </div>

        {hasIntegration && (
          <div className="flex items-center justify-between rounded-lg border p-4 bg-muted/50">
            <div className="flex items-center gap-3">
              <div className="text-blue-500">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect width="18" height="18" x="3" y="4" rx="2" ry="2"/>
                  <line x1="16" x2="16" y1="2" y2="6"/>
                  <line x1="8" x2="8" y1="2" y2="6"/>
                  <line x1="3" x2="21" y1="10" y2="10"/>
                </svg>
              </div>
              <div>
                <p className="text-sm font-medium">{t('calendar.syncToGoogle')}</p>
                <p className="text-xs text-muted-foreground">{t('calendar.syncToGoogleDescription')}</p>
              </div>
            </div>
            <Switch
              {...register('syncToGoogle')}
              defaultChecked={watch('syncToGoogle')}
            />
          </div>
        )}

        <div className="flex gap-3 justify-between pt-4 border-t border-border">
          {event && onDelete && (
            <Button
              type="button"
              variant="danger"
              onClick={onDelete}
              disabled={submitting}
            >
              {t('common.delete')}
            </Button>
          )}
          <div className="flex gap-3 ml-auto">
            <Button
              type="button"
              variant="secondary"
              onClick={handleClose}
              disabled={submitting}
            >
              {t('common.cancel')}
            </Button>
            <Button
              type="submit"
              disabled={submitting}
            >
              {submitting ? t('calendar.saving') : event ? t('calendar.update') : t('calendar.create')}
            </Button>
          </div>
        </div>
        </form>
      </div>
    </Modal>
  );
}