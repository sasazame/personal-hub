'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useTranslations } from 'next-intl';
import { CalendarEvent, CreateCalendarEventDto } from '@/types/calendar';
import { Button, Input, TextArea, Modal } from '@/components/ui';
import { format } from 'date-fns';

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
  });
  
  type EventFormData = z.infer<typeof eventSchema>;
  
  const colorOptions = [
    { value: 'blue', label: t('calendar.colors.blue'), class: 'bg-blue-500' },
    { value: 'green', label: t('calendar.colors.green'), class: 'bg-green-500' },
    { value: 'red', label: t('calendar.colors.red'), class: 'bg-red-500' },
    { value: 'purple', label: t('calendar.colors.purple'), class: 'bg-purple-500' },
    { value: 'orange', label: t('calendar.colors.orange'), class: 'bg-orange-500' },
  ];
  
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
    reset,
  } = useForm<EventFormData>({
    resolver: zodResolver(eventSchema),
    defaultValues: event ? {
      title: event.title,
      description: event.description || '',
      startDateTime: format(new Date(event.startDateTime), "yyyy-MM-dd'T'HH:mm"),
      endDateTime: format(new Date(event.endDateTime), "yyyy-MM-dd'T'HH:mm"),
      location: event.location || '',
      allDay: event.allDay,
      color: event.color || 'blue',
      reminders: event.reminders || [],
      recurrence: event.recurrence,
    } : {
      title: '',
      description: '',
      startDateTime: defaultDate ? format(defaultDate, "yyyy-MM-dd'T'09:00") : format(new Date(), "yyyy-MM-dd'T'09:00"),
      endDateTime: defaultDate ? format(defaultDate, "yyyy-MM-dd'T'10:00") : format(new Date(), "yyyy-MM-dd'T'10:00"),
      location: '',
      allDay: false,
      color: 'blue',
      reminders: [],
      recurrence: undefined,
    }
  });

  const allDay = watch('allDay');

  // Update form when defaultDate changes
  useEffect(() => {
    if (defaultDate && !event) {
      setValue('startDateTime', format(defaultDate, "yyyy-MM-dd'T'09:00"));
      setValue('endDateTime', format(defaultDate, "yyyy-MM-dd'T'10:00"));
    }
  }, [defaultDate, event, setValue]);

  const handleFormSubmit = (data: EventFormData) => {
    // Convert datetime-local format to ISO 8601 format
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

    const formattedData = {
      ...data,
      startDateTime: formatDateTime(data.startDateTime, data.allDay),
      endDateTime: formatDateTime(data.endDateTime, data.allDay),
      // Ensure required fields have default values
      reminders: data.reminders || [],
      recurrence: data.recurrence || undefined,
      location: data.location || undefined,
      description: data.description || undefined,
    };

    onSubmit(formattedData);
    reset();
    onClose();
  };

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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              {t('calendar.startDate')}{allDay ? '' : ''} *
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
              {t('calendar.endDate')}{allDay ? '' : ''} *
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

        <div className="flex gap-3 justify-between pt-4 border-t border-border">
          {event && onDelete && (
            <Button
              type="button"
              variant="danger"
              onClick={onDelete}
              disabled={isSubmitting}
            >
              {t('common.delete')}
            </Button>
          )}
          <div className="flex gap-3 ml-auto">
            <Button
              type="button"
              variant="secondary"
              onClick={handleClose}
              disabled={isSubmitting}
            >
              {t('common.cancel')}
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
            >
              {isSubmitting ? t('calendar.saving') : event ? t('calendar.update') : t('calendar.create')}
            </Button>
          </div>
        </div>
        </form>
      </div>
    </Modal>
  );
}