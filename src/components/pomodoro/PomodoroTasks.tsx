'use client';

import React, { useState } from 'react';
import { PomodoroTask } from '@/types/pomodoro';
import { useAddTask, useUpdateTask, useRemoveTask } from '@/hooks/usePomodoro';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { showError } from '@/components/ui/toast';
import { Trash2, Plus, List } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { TodoPickerModal } from './TodoPickerModal';
import { TaskTemplates } from './TaskTemplates';
import { cn } from '@/lib/cn';

interface PomodoroTasksProps {
  sessionId?: string;
  tasks: PomodoroTask[];
  isActiveSession?: boolean;
  onCreateSession?: (initialTask?: string) => void;
}

export function PomodoroTasks({ sessionId, tasks, isActiveSession = false, onCreateSession }: PomodoroTasksProps) {
  const t = useTranslations('pomodoro');
  const [newTaskDescription, setNewTaskDescription] = useState('');
  const [showTodoPicker, setShowTodoPicker] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState<PomodoroTask | null>(null);
  
  const addTask = useAddTask();
  const updateTask = useUpdateTask();
  const removeTask = useRemoveTask();

  const handleAddTask = () => {
    if (!newTaskDescription.trim()) {
      showError(t('taskRequired'));
      return;
    }
    
    if (!sessionId) {
      if (onCreateSession) {
        // Create session with initial task
        onCreateSession(newTaskDescription);
        setNewTaskDescription('');
      } else {
        showError(t('noActiveSession'));
      }
      return;
    }
    
    addTask.mutate({
      sessionId,
      description: newTaskDescription
    });
    
    setNewTaskDescription('');
  };

  const handleToggleTask = (task: PomodoroTask) => {
    if (!sessionId) return;
    
    updateTask.mutate({
      sessionId,
      taskId: task.id,
      completed: !task.completed
    });
  };

  const handleRemoveTask = (task: PomodoroTask) => {
    setTaskToDelete(task);
  };

  const handleConfirmDelete = () => {
    if (!taskToDelete || !sessionId) {
      setTaskToDelete(null);
      return;
    }
    
    removeTask.mutate({ sessionId, taskId: taskToDelete.id }, {
      onSuccess: () => {
        setTaskToDelete(null);
      }
    });
  };

  const handleSelectTodo = (todoId: string, todoTitle: string) => {
    if (!sessionId) {
      showError(t('noActiveSession'));
      return;
    }
    
    addTask.mutate({
      sessionId: sessionId!,
      description: todoTitle,
      todoId: parseInt(todoId)
    });
    setShowTodoPicker(false);
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold mb-3">{t('tasks')}</h3>
        
        {/* Add task form */}
        <div className="mb-4">
          <div className="flex gap-2 items-end">
            <div className="flex-1">
              <Input
                value={newTaskDescription}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewTaskDescription(e.target.value)}
                label={t('newTask')}
                placeholder={t('addTask')}
                onKeyPress={(e: React.KeyboardEvent) => e.key === 'Enter' && handleAddTask()}
              />
            </div>
            <Button onClick={handleAddTask} size="sm" className="mb-1">
              <Plus className="h-4 w-4" />
            </Button>
            <Button 
              onClick={() => setShowTodoPicker(true)} 
              size="sm"
              variant="outline"
              title={t('selectFromTodos')}
              data-testid="link-todo-button"
              className="mb-1"
            >
              <List className="h-4 w-4" />
            </Button>
            <TaskTemplates 
              onApplyTemplate={(templateTasks) => {
                // Add all template tasks
                templateTasks.forEach(description => {
                  if (!sessionId) {
                    if (onCreateSession) {
                      onCreateSession(description);
                      return;
                    }
                  } else {
                    addTask.mutate({
                      sessionId,
                      description
                    });
                  }
                });
              }}
              currentTasks={tasks.map(t => t.description)}
            />
          </div>
        </div>

        {/* Task list */}
        <div className="space-y-2" data-testid="linked-todos">
          {tasks.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              {t('noTasks')}
            </p>
          ) : (
            tasks.map((task) => {
              // Task is pending if not completed and no active session
              const isPending = !task.completed && !isActiveSession;
              
              return (
                <Card key={task.id} className={cn(
                  "transition-opacity",
                  task.completed && "opacity-60",
                  isPending && "border-dashed opacity-75"
                )}>
                  <CardContent className="flex items-center gap-3 p-3">
                    <input
                      type="checkbox"
                      checked={task.completed}
                      onChange={() => handleToggleTask(task)}
                      className="h-4 w-4"
                    />
                    <span className={cn(
                      "flex-1 text-sm",
                      task.completed && "line-through",
                      isPending && "text-muted-foreground"
                    )}>
                      {task.description}
                    </span>
                    {isPending && (
                      <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded">
                        {t('pending')}
                      </span>
                    )}
                    {task.linkedTodo && (
                      <span className="text-xs text-muted-foreground">
                        {t('linkedToTodo')}
                      </span>
                    )}
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleRemoveTask(task)}
                      className="h-8 w-8"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </CardContent>
                </Card>
              );
            })
          )}
        </div>

      {/* Todo picker modal */}
      <TodoPickerModal
        open={showTodoPicker}
        onClose={() => setShowTodoPicker(false)}
        onSelect={handleSelectTodo}
      />

      {/* Delete confirmation modal */}
      {taskToDelete && (
        <Modal open={true} onClose={() => setTaskToDelete(null)}>
          <div className="p-6 space-y-4">
            <h2 className="text-xl font-semibold text-foreground">{t('deleteTask')}</h2>
            <p className="text-muted-foreground">
              {t('confirmDeleteTask', { description: taskToDelete.description })}
            </p>
            <div className="flex gap-3 justify-end">
              <Button
                variant="secondary"
                onClick={() => setTaskToDelete(null)}
                disabled={removeTask.isPending}
              >
                {t('cancel')}
              </Button>
              <Button
                variant="danger"
                onClick={handleConfirmDelete}
                disabled={removeTask.isPending}
              >
                {t('delete')}
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}