'use client';

import { useForm } from 'react-hook-form';
import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { CreateTodoDto, RepeatType } from '@/types/todo';
import { Modal, ModalHeader, ModalTitle, ModalContent } from '@/components/ui';
import { FormInput, FormTextArea, FormSelect, FormCheckbox } from '@/components/ui/FormField';
import { Button } from '@/components/ui';
import { Input } from '@/components/ui';
import { Calendar } from 'lucide-react';
import { useFormSubmit } from '@/hooks/useFormSubmit';
import { mapApiStatusToDisplay } from '@/utils/todoStatusMapper';

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
    setValue('isRepeatable', isRepeatable);
  }, [isRepeatable, setValue]);

  useEffect(() => {
    if (isRepeatable) {
      setValue('repeatConfig', {
        repeatType,
        daysOfWeek: repeatType === 'WEEKLY' ? selectedDays : null,
      });
    } else {
      setValue('repeatConfig', null);
    }
  }, [isRepeatable, repeatType, selectedDays, setValue]);

  const statusOptions = [
    { value: 'TODO', label: t(`todo.statusOptions.${mapApiStatusToDisplay('TODO')}`) },
    { value: 'IN_PROGRESS', label: t(`todo.statusOptions.${mapApiStatusToDisplay('IN_PROGRESS')}`) },
    { value: 'DONE', label: t(`todo.statusOptions.${mapApiStatusToDisplay('DONE')}`) },
  ];

  const priorityOptions = [
    { value: 'LOW', label: t('todo.priorityOptions.LOW') },
    { value: 'MEDIUM', label: t('todo.priorityOptions.MEDIUM') },
    { value: 'HIGH', label: t('todo.priorityOptions.HIGH') },
  ];

  const repeatTypeOptions = [
    { value: 'DAILY', label: t('todo.repeatTypeOptions.DAILY') },
    { value: 'WEEKLY', label: t('todo.repeatTypeOptions.WEEKLY') },
    { value: 'MONTHLY', label: t('todo.repeatTypeOptions.MONTHLY') },
  ];

  return (
    <Modal open={true} onClose={onCancel}>
      <ModalHeader>
        <ModalTitle>
          {parentId ? t('todo.newSubtask') : t('todo.newTodo')}
        </ModalTitle>
      </ModalHeader>
      
      <ModalContent>
        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
          <FormInput
            {...register('title', { required: t('todo.titleRequired') })}
            id="title"
            label={t('todo.todoTitle')}
            required
            error={errors.title}
          />

          <FormTextArea
            {...register('description')}
            id="description"
            label={t('todo.todoDescription')}
            rows={3}
          />

          <div className="grid grid-cols-2 gap-4">
            <FormSelect
              {...register('status')}
              id="status"
              label={t('todo.todoStatus')}
              options={statusOptions}
            />

            <FormSelect
              {...register('priority')}
              id="priority"
              label={t('todo.todoPriority')}
              options={priorityOptions}
            />
          </div>

          <div>
            <label htmlFor="dueDate" className="block text-sm font-medium text-foreground mb-1">
              {t('todo.todoDueDate')}
            </label>
            <div className="relative">
              <Input
                {...register('dueDate')}
                type="datetime-local"
                id="dueDate"
                className="pl-10"
                label=""
              />
              <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            </div>
          </div>

          {!parentId && (
            <div className="border-t pt-4">
              <FormCheckbox
                id="isRepeatable"
                label={t('todo.makeRepeatable')}
                checked={isRepeatable}
                onChange={(e) => setIsRepeatable(e.target.checked)}
              />

              {isRepeatable && (
                <div className="mt-4 space-y-4">
                  <FormSelect
                    value={repeatType}
                    onChange={(e) => setRepeatType(e.target.value as RepeatType)}
                    id="repeatType"
                    label={t('todo.repeatType')}
                    options={repeatTypeOptions}
                  />

                  {repeatType === 'WEEKLY' && (
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">
                        {t('todo.repeatOnDays')}
                      </label>
                      <div className="grid grid-cols-7 gap-2">
                        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day, index) => (
                          <label key={day} className="flex items-center justify-center">
                            <input
                              type="checkbox"
                              checked={selectedDays.includes(index)}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setSelectedDays([...selectedDays, index].sort());
                                } else {
                                  setSelectedDays(selectedDays.filter(d => d !== index));
                                }
                              }}
                              className="sr-only"
                            />
                            <span className={`
                              w-10 h-10 flex items-center justify-center rounded-md text-xs font-medium cursor-pointer
                              ${selectedDays.includes(index)
                                ? 'bg-primary text-primary-foreground'
                                : 'bg-muted text-muted-foreground hover:bg-muted/80'
                              }
                            `}>
                              {t(`todo.days.${day}`)}
                            </span>
                          </label>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          <div className="flex justify-end gap-2 pt-4">
            <Button
              type="button"
              variant="ghost"
              onClick={onCancel}
              disabled={isFormSubmitting || isSubmitting}
            >
              {t('common.cancel')}
            </Button>
            <Button
              type="submit"
              loading={isFormSubmitting || isSubmitting}
            >
              {parentId ? t('todo.addSubtask') : t('todo.addTodo')}
            </Button>
          </div>
        </form>
      </ModalContent>
    </Modal>
  );
}