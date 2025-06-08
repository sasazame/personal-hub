'use client';

import { useState } from 'react';
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
    startDate: z.string().min(1, t('calendar.startDateRequired')),
    endDate: z.string().min(1, t('calendar.endDateRequired')),
    allDay: z.boolean(),
    color: z.string().min(1, t('calendar.colorRequired')),
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
      startDate: format(new Date(event.startDate), "yyyy-MM-dd'T'HH:mm"),
      endDate: format(new Date(event.endDate), "yyyy-MM-dd'T'HH:mm"),
      allDay: event.allDay,
      color: event.color,
    } : {
      title: '',
      description: '',
      startDate: defaultDate ? format(defaultDate, "yyyy-MM-dd'T'09:00") : '',
      endDate: defaultDate ? format(defaultDate, "yyyy-MM-dd'T'10:00") : '',
      allDay: false,
      color: 'blue',
    }
  });

  const allDay = watch('allDay');

  const handleFormSubmit = (data: EventFormData) => {
    onSubmit(data);
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
              {...register('startDate')}
              label=""
              error={errors.startDate?.message}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              {t('calendar.endDate')}{allDay ? '' : ''} *
            </label>
            <Input
              type={allDay ? 'date' : 'datetime-local'}
              {...register('endDate')}
              label=""
              error={errors.endDate?.message}
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