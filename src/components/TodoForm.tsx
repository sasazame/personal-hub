'use client';

import { useForm } from 'react-hook-form';
import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { CreateTodoDto, RepeatType } from '@/types/todo';
import { Modal, ModalHeader, ModalTitle, ModalContent } from '@/components/ui';
import { Input } from '@/components/ui';
import { TextArea } from '@/components/ui';
import { Button } from '@/components/ui';
import { Repeat, Calendar } from 'lucide-react';
import { useFormSubmit } from '@/hooks/useFormSubmit';

interface TodoFormProps {
  onSubmit: (data: CreateTodoDto) => void;
  onCancel: () => void;
  isSubmitting?: boolean;
  parentId?: number | null;
}

export default function TodoForm({ onSubmit, onCancel, isSubmitting, parentId }: TodoFormProps) {
  const t = useTranslations();
  const [isRepeatable, setIsRepeatable] = useState(false);
  const [repeatType, setRepeatType] = useState<RepeatType>('DAILY');
  const [selectedDays, setSelectedDays] = useState<number[]>([]);
  
  const form = useForm<CreateTodoDto>({
    defaultValues: {
      status: 'TODO',
      priority: 'MEDIUM',
      parentId: parentId || undefined,
      isRepeatable: false,
    },
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = form;

  const { handleSubmit: handleFormSubmit, isSubmitting: isFormSubmitting } = useFormSubmit<CreateTodoDto>(
    {
      onSubmit,
      resetOnSuccess: true,
      closeOnSuccess: true,
    },
    form,
    onCancel
  );

  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onCancel();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [onCancel]);

  return (
    <Modal open={true} onClose={onCancel}>
      <ModalHeader onClose={onCancel}>
        <ModalTitle>{parentId ? t('todo.createSubtask') : t('todo.createNewTodo')}</ModalTitle>
      </ModalHeader>
      
      <ModalContent>
        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
          <div>
            <Input
              {...register('title', { required: t('todo.titleRequired') })}
              type="text"
              id="title"
              label={`${t('todo.todoTitle')} *`}
            />
            {errors.title && (
              <p className="mt-1 text-sm text-destructive">{errors.title.message}</p>
            )}
          </div>

          <div>
            <TextArea
              {...register('description')}
              id="description"
              rows={3}
              label={t('todo.todoDescription')}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="status" className="block text-sm font-medium text-foreground mb-1">
                {t('todo.todoStatus')}
              </label>
              <select
                {...register('status')}
                id="status"
                className="w-full px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring bg-background text-foreground"
              >
                <option value="TODO">{t('todo.statusOptions.TODO')}</option>
                <option value="IN_PROGRESS">{t('todo.statusOptions.IN_PROGRESS')}</option>
                <option value="DONE">{t('todo.statusOptions.DONE')}</option>
              </select>
            </div>

            <div>
              <label htmlFor="priority" className="block text-sm font-medium text-foreground mb-1">
                {t('todo.todoPriority')}
              </label>
              <select
                {...register('priority')}
                id="priority"
                className="w-full px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring bg-background text-foreground"
              >
                <option value="LOW">{t('todo.priorityOptions.LOW')}</option>
                <option value="MEDIUM">{t('todo.priorityOptions.MEDIUM')}</option>
                <option value="HIGH">{t('todo.priorityOptions.HIGH')}</option>
              </select>
            </div>
          </div>

          <div>
            <Input
              {...register('dueDate')}
              type="date"
              id="dueDate"
              label={t('todo.dueDate')}
            />
          </div>

          {/* Recurring Task Settings */}
          <div className="border-t pt-4">
            <div className="flex items-center gap-2 mb-4">
              <input
                type="checkbox"
                id="isRepeatable"
                checked={isRepeatable}
                onChange={(e) => {
                  const checked = e.target.checked;
                  setIsRepeatable(checked);
                  setValue('isRepeatable', checked);
                  if (!checked) {
                    setValue('repeatConfig', null);
                  } else {
                    setValue('repeatConfig', {
                      repeatType: 'DAILY',
                      interval: 1,
                    });
                  }
                }}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <label htmlFor="isRepeatable" className="flex items-center gap-2 text-sm font-medium text-foreground">
                <Repeat className="h-4 w-4" />
                {t('recurring.title')}
              </label>
            </div>

            {isRepeatable && (
              <div className="space-y-4 pl-6 border-l-2 border-gray-200 dark:border-gray-700">
                {/* Repeat Type */}
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    {t('recurring.pattern')}
                  </label>
                  <select
                    {...register('repeatConfig.repeatType')}
                    value={repeatType}
                    onChange={(e) => {
                      const type = e.target.value as RepeatType;
                      setRepeatType(type);
                      setValue('repeatConfig.repeatType', type);
                      setSelectedDays([]);
                    }}
                    className="w-full px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring bg-background text-foreground"
                  >
                    <option value="DAILY">{t('recurring.types.daily')}</option>
                    <option value="WEEKLY">{t('recurring.types.weekly')}</option>
                    <option value="MONTHLY">{t('recurring.types.monthly')}</option>
                    <option value="YEARLY">{t('recurring.types.yearly')}</option>
                  </select>
                </div>

                {/* Interval */}
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    {t('recurring.interval')}
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      {...register('repeatConfig.interval', { min: 1, max: 365 })}
                      type="number"
                      min="1"
                      max="365"
                      defaultValue="1"
                      className="w-20 px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring bg-background text-foreground"
                    />
                    <span className="text-sm text-muted-foreground">
                      {repeatType === 'DAILY' && t('recurring.intervalSuffixes.day')}
                      {repeatType === 'WEEKLY' && t('recurring.intervalSuffixes.week')}
                      {repeatType === 'MONTHLY' && t('recurring.intervalSuffixes.month')}
                      {repeatType === 'YEARLY' && t('recurring.intervalSuffixes.year')}
                    </span>
                  </div>
                </div>

                {/* Days of Week (for WEEKLY) */}
                {repeatType === 'WEEKLY' && (
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      {t('recurring.daySelection')}
                    </label>
                    <div className="flex gap-2">
                      {[
                        t('recurring.daysOfWeek.sun'),
                        t('recurring.daysOfWeek.mon'),
                        t('recurring.daysOfWeek.tue'),
                        t('recurring.daysOfWeek.wed'),
                        t('recurring.daysOfWeek.thu'),
                        t('recurring.daysOfWeek.fri'),
                        t('recurring.daysOfWeek.sat')
                      ].map((day, index) => (
                        <button
                          key={index}
                          type="button"
                          onClick={() => {
                            const dayNumber = index === 0 ? 7 : index; // Sunday is 7 in backend
                            const newDays = selectedDays.includes(dayNumber)
                              ? selectedDays.filter(d => d !== dayNumber)
                              : [...selectedDays, dayNumber];
                            setSelectedDays(newDays);
                            setValue('repeatConfig.daysOfWeek', newDays.length > 0 ? newDays : null);
                          }}
                          className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                            selectedDays.includes(index === 0 ? 7 : index)
                              ? 'bg-blue-600 text-white'
                              : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                          }`}
                        >
                          {day}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Day of Month (for MONTHLY) */}
                {repeatType === 'MONTHLY' && (
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      {t('recurring.monthDay')}
                    </label>
                    <input
                      {...register('repeatConfig.dayOfMonth', { min: 1, max: 31 })}
                      type="number"
                      min="1"
                      max="31"
                      placeholder={t('recurring.monthDayPlaceholder')}
                      className="w-full px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring bg-background text-foreground"
                    />
                  </div>
                )}

                {/* End Date */}
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    {t('recurring.endDate')}
                  </label>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <input
                      {...register('repeatConfig.endDate')}
                      type="date"
                      className="flex-1 px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring bg-background text-foreground"
                    />
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {t('recurring.endDateHelper')}
                  </p>
                </div>
              </div>
            )}
          </div>

          <div className="flex gap-3 justify-end mt-6">
            <Button
              type="button"
              variant="secondary"
              onClick={onCancel}
              disabled={isFormSubmitting || isSubmitting}
            >
              {t('common.cancel')}
            </Button>
            <Button
              type="submit"
              disabled={isFormSubmitting || isSubmitting}
              className="flex items-center gap-2"
            >
              {isRepeatable && <Repeat className="h-4 w-4" />}
              {(isFormSubmitting || isSubmitting) ? t('todo.creating') : (isRepeatable ? t('recurring.createRecurring') : t('todo.createTodo'))}
            </Button>
          </div>
        </form>
      </ModalContent>
    </Modal>
  );
}