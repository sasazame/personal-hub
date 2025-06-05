'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { CalendarEvent, CreateCalendarEventDto } from '@/types/calendar';
import { Button, Input, TextArea, Modal } from '@/components/ui';
import { format } from 'date-fns';

const eventSchema = z.object({
  title: z.string().min(1, 'タイトルは必須です'),
  description: z.string().optional(),
  startDate: z.string().min(1, '開始日時は必須です'),
  endDate: z.string().min(1, '終了日時は必須です'),
  allDay: z.boolean(),
  color: z.string().min(1, '色を選択してください'),
});

type EventFormData = z.infer<typeof eventSchema>;

interface EventFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateCalendarEventDto) => void;
  event?: CalendarEvent;
  defaultDate?: Date;
  isSubmitting?: boolean;
}

const colorOptions = [
  { value: 'blue', label: 'ブルー', class: 'bg-blue-500' },
  { value: 'green', label: 'グリーン', class: 'bg-green-500' },
  { value: 'red', label: 'レッド', class: 'bg-red-500' },
  { value: 'purple', label: 'パープル', class: 'bg-purple-500' },
  { value: 'orange', label: 'オレンジ', class: 'bg-orange-500' },
];

export function EventForm({ isOpen, onClose, onSubmit, event, defaultDate, isSubmitting }: EventFormProps) {
  const [selectedColor, setSelectedColor] = useState(event?.color || 'blue');
  
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
      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
        <div>
          <h2 className="text-xl font-semibold text-foreground mb-4">
            {event ? 'イベントを編集' : '新しいイベント'}
          </h2>
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            タイトル *
          </label>
          <Input
            {...register('title')}
            label=""
            placeholder="イベントタイトル"
            error={errors.title?.message}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            説明
          </label>
          <TextArea
            {...register('description')}
            label=""
            placeholder="イベントの詳細説明"
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
            <span className="text-sm text-foreground">終日</span>
          </label>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              開始{allDay ? '日' : '日時'} *
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
              終了{allDay ? '日' : '日時'} *
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
            色 *
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

        <div className="flex gap-3 justify-end pt-4 border-t border-border">
          <Button
            type="button"
            variant="secondary"
            onClick={handleClose}
            disabled={isSubmitting}
          >
            キャンセル
          </Button>
          <Button
            type="submit"
            disabled={isSubmitting}
          >
            {isSubmitting ? '保存中...' : event ? '更新' : '作成'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}