'use client';

import { useTranslations } from 'next-intl';
import { TodoStatus } from '@/types/todo';
import { Button } from '@/components/ui';
import { mapApiStatusToDisplay } from '@/utils/todoStatusMapper';

interface TodoStatusFilterProps {
  selectedStatus: TodoStatus | 'ALL';
  onStatusChange: (status: TodoStatus | 'ALL') => void;
}

export default function TodoStatusFilter({ selectedStatus, onStatusChange }: TodoStatusFilterProps) {
  const t = useTranslations();

  const statusOptions: { value: TodoStatus | 'ALL'; label: string }[] = [
    { value: 'ALL', label: t('todo.filter.all') },
    { value: 'TODO', label: t(`todo.statusOptions.${mapApiStatusToDisplay('TODO')}`) },
    { value: 'IN_PROGRESS', label: t(`todo.statusOptions.${mapApiStatusToDisplay('IN_PROGRESS')}`) },
    { value: 'DONE', label: t(`todo.statusOptions.${mapApiStatusToDisplay('DONE')}`) },
  ];

  return (
    <div className="flex gap-2 flex-wrap">
      {statusOptions.map((option) => (
        <Button
          key={option.value}
          variant={selectedStatus === option.value ? 'primary' : 'secondary'}
          size="sm"
          onClick={() => onStatusChange(option.value)}
        >
          {option.label}
        </Button>
      ))}
    </div>
  );
}