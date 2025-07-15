'use client';

import React, { useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useTodos } from '@/hooks/useTodos';
import type { Todo } from '@/types/todo';
import { Search } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { cn } from '@/lib/cn';

interface TodoPickerModalProps {
  open: boolean;
  onClose: () => void;
  onSelect: (todoId: number, todoTitle: string) => void;
}

export function TodoPickerModal({ open, onClose, onSelect }: TodoPickerModalProps) {
  const t = useTranslations('pomodoro');
  const [searchTerm, setSearchTerm] = useState('');
  const { data: todos, isLoading } = useTodos();

  // Filter only pending and in-progress todos
  const availableTodos = todos?.filter(
    (todo: Todo) => todo.status === 'TODO' || todo.status === 'IN_PROGRESS'
  ) || [];

  // Further filter by search term
  const filteredTodos = availableTodos.filter(
    (todo: Todo) => todo.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSelect = (todoId: string, todoTitle: string) => {
    onSelect(todoId, todoTitle);
    setSearchTerm('');
  };

  return (
    <Modal open={open} onClose={onClose} size="md">
      <div className="p-6">
        <h2 className="text-lg font-semibold mb-4">{t('selectTodo')}</h2>

        <div className="space-y-4">
          {/* Search input */}
          <div>
            <Input
              value={searchTerm}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
              label={t('search')}
              placeholder={t('searchTodos')}
              leftIcon={<Search className="h-4 w-4" />}
            />
          </div>

          {/* Todo list */}
          <div className="h-[300px] overflow-y-auto">
            {isLoading ? (
              <div className="text-center py-4">{t('loading')}</div>
            ) : filteredTodos.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                {searchTerm ? t('noTodosFound') : t('noAvailableTodos')}
              </div>
            ) : (
              <div className="space-y-2">
                {filteredTodos.map((todo: Todo) => (
                  <Button
                    key={todo.id}
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left",
                      "hover:bg-muted"
                    )}
                    onClick={() => handleSelect(todo.id, todo.title)}
                  >
                    <div className="flex-1 truncate">
                      <div className="font-medium">{todo.title}</div>
                      {todo.description && (
                        <div className="text-xs text-muted-foreground truncate">
                          {todo.description}
                        </div>
                      )}
                    </div>
                    <span className={cn(
                      "text-xs px-2 py-1 rounded",
                      todo.status === 'IN_PROGRESS'
                        ? "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300"
                        : "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300"
                    )}>
                      {t(`todoStatus.${todo.status.toLowerCase()}`)}
                    </span>
                  </Button>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="flex justify-end">
          <Button variant="outline" onClick={onClose}>
            {t('cancel')}
          </Button>
        </div>
      </div>
    </Modal>
  );
}