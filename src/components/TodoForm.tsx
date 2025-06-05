'use client';

import { useForm } from 'react-hook-form';
import { useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { CreateTodoDto } from '@/types/todo';
import { Modal, ModalHeader, ModalTitle, ModalContent } from '@/components/ui';
import { Input } from '@/components/ui';
import { TextArea } from '@/components/ui';
import { Button } from '@/components/ui';

interface TodoFormProps {
  onSubmit: (data: CreateTodoDto) => void;
  onCancel: () => void;
  isSubmitting?: boolean;
  parentId?: number | null;
}

export default function TodoForm({ onSubmit, onCancel, isSubmitting, parentId }: TodoFormProps) {
  const t = useTranslations();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CreateTodoDto>({
    defaultValues: {
      status: 'TODO',
      priority: 'MEDIUM',
      parentId: parentId || undefined,
    },
  });

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
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
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

          <div className="flex gap-3 justify-end mt-6">
            <Button
              type="button"
              variant="secondary"
              onClick={onCancel}
              disabled={isSubmitting}
            >
              {t('common.cancel')}
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
            >
              {isSubmitting ? t('todo.creating') : t('todo.createTodo')}
            </Button>
          </div>
        </form>
      </ModalContent>
    </Modal>
  );
}