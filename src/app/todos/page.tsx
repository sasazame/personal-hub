'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import TodoItem from '@/components/TodoItem';
import TodoForm from '@/components/TodoForm';
import TodoEditForm from '@/components/TodoEditForm';
import TodoStatusFilter from '@/components/TodoStatusFilter';
import { AuthGuard } from '@/components/auth';
import { AppLayout } from '@/components/layout';
import { todoApi } from '@/lib/api';
import { Todo, CreateTodoDto, UpdateTodoDto, TodoStatus } from '@/types/todo';
import { showSuccess, showError } from '@/components/ui/toast';
import { usePageTitle } from '@/hooks/usePageTitle';
import { Modal, Button } from '@/components/ui';
import { useRouter } from 'next/navigation';
import { Mail } from 'lucide-react';

function TodoApp() {
  const t = useTranslations();
  const router = useRouter();
  usePageTitle('TODOs - Personal Hub');
  const queryClient = useQueryClient();
  const [isAddingTodo, setIsAddingTodo] = useState(false);
  const [editingTodo, setEditingTodo] = useState<Todo | null>(null);
  const [deletingTodo, setDeletingTodo] = useState<Todo | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<TodoStatus | 'ALL'>('ALL');
  const [parentIdForNewTodo, setParentIdForNewTodo] = useState<number | null>(null);

  const { data: todosResponse, isLoading, error } = useQuery({
    queryKey: ['todos', selectedStatus],
    queryFn: async () => {
      if (selectedStatus === 'ALL') {
        return todoApi.getAll();
      } else {
        const statusTodos = await todoApi.getByStatus(selectedStatus);
        return {
          content: statusTodos,
          pageable: {
            pageNumber: 0,
            pageSize: statusTodos.length,
            sort: { sorted: false },
          },
          totalElements: statusTodos.length,
          totalPages: 1,
          first: true,
          last: true,
        };
      }
    },
  });

  const todos = todosResponse?.content || [];

  // Sort todos: incomplete tasks with near deadlines first
  const sortedTodos = [...todos].sort((a, b) => {
    // First, sort by completion status (incomplete first)
    if (a.status === 'DONE' && b.status !== 'DONE') return 1;
    if (a.status !== 'DONE' && b.status === 'DONE') return -1;
    
    // For incomplete tasks, sort by due date (nearest first)
    if (a.status !== 'DONE' && b.status !== 'DONE') {
      if (a.dueDate && b.dueDate) {
        return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
      }
      if (a.dueDate && !b.dueDate) return -1;
      if (!a.dueDate && b.dueDate) return 1;
    }
    
    // For completed tasks or same status, sort by priority (HIGH > MEDIUM > LOW)
    const priorityOrder = { HIGH: 3, MEDIUM: 2, LOW: 1 };
    const priorityDiff = priorityOrder[b.priority] - priorityOrder[a.priority];
    if (priorityDiff !== 0) return priorityDiff;
    
    // Finally, sort by creation date (newest first)
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  const createMutation = useMutation({
    mutationFn: todoApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['todos'] });
      setIsAddingTodo(false);
      setParentIdForNewTodo(null);
      showSuccess(t('todo.todoAdded'));
    },
    onError: (error) => {
      showError(error instanceof Error ? error.message : t('errors.general'));
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: UpdateTodoDto }) => {
      const updatedTodo = await todoApi.update(id, data);
      
      // If this is a recurring task instance being completed, generate new instances
      if (data.status === 'DONE' && editingTodo?.originalTodoId) {
        try {
          await todoApi.generateInstances();
        } catch (error) {
          console.warn('Failed to generate new recurring task instances:', error);
        }
      }
      
      return updatedTodo;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['todos'] });
      queryClient.invalidateQueries({ queryKey: ['recurring-tasks'] });
      setEditingTodo(null);
      showSuccess(t('todo.todoUpdated'));
    },
    onError: (error) => {
      showError(error instanceof Error ? error.message : t('errors.general'));
    },
  });

  const deleteMutation = useMutation({
    mutationFn: todoApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['todos'] });
      setDeletingTodo(null);
      showSuccess(t('todo.todoDeleted'));
    },
    onError: (error) => {
      showError(error instanceof Error ? error.message : t('errors.general'));
    },
  });

  const handleCreate = (data: CreateTodoDto) => {
    createMutation.mutate({ ...data, parentId: parentIdForNewTodo });
  };

  const handleUpdate = (_id: number, todo: Todo) => {
    setEditingTodo(todo);
  };

  const handleUpdateSubmit = (data: UpdateTodoDto) => {
    if (editingTodo) {
      updateMutation.mutate({ id: editingTodo.id, data });
    }
  };

  const handleDelete = (_id: number, todo: Todo) => {
    setDeletingTodo(todo);
  };

  const handleDeleteFromEdit = () => {
    if (editingTodo) {
      setDeletingTodo(editingTodo);
      setEditingTodo(null);
    }
  };

  const confirmDelete = () => {
    if (deletingTodo) {
      deleteMutation.mutate(deletingTodo.id);
    }
  };

  const cancelDelete = () => {
    setDeletingTodo(null);
  };

  const handleAddChild = (parentId: number) => {
    setParentIdForNewTodo(parentId);
    setIsAddingTodo(true);
  };

  // Handle Escape key for delete modal
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && deletingTodo) {
        cancelDelete();
      }
    };

    if (deletingTodo) {
      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }
  }, [deletingTodo]);

  if (isLoading) {
    return (
      <AppLayout>
        <div className="min-h-[400px] flex items-center justify-center">
          <div className="text-lg text-muted-foreground">{t('common.loading')}</div>
        </div>
      </AppLayout>
    );
  }

  if (error) {
    return (
      <AppLayout>
        <div className="min-h-[400px] flex items-center justify-center">
          <div className="text-lg text-destructive">{t('errors.general')}</div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">
              {t('todo.title')}
            </h1>
            <p className="text-muted-foreground mt-1">
              {t('app.subtitle')}
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="secondary"
              size="md"
              leftIcon={<Mail className="w-4 h-4" />}
              onClick={() => router.push('/todos/gmail')}
            >
              Gmail to Task
            </Button>
            <Button
              variant="primary"
              size="md"
              onClick={() => {
                setParentIdForNewTodo(null);
                setIsAddingTodo(true);
              }}
            >
              {t('todo.addTodo')}
            </Button>
          </div>
        </div>
        
        <TodoStatusFilter
          selectedStatus={selectedStatus}
          onStatusChange={setSelectedStatus}
        />

        {sortedTodos.length === 0 ? (
          <div className="text-center py-12 bg-card rounded-lg shadow">
            <p className="text-muted-foreground text-lg">{t('todo.noTodos')}</p>
          </div>
        ) : (
          <div className="space-y-4">
            {sortedTodos.filter(todo => !todo.parentId).map((todo) => (
              <TodoItem
                key={todo.id}
                todo={todo}
                onUpdate={handleUpdate}
                onDelete={handleDelete}
                onAddChild={handleAddChild}
              />
            ))}
          </div>
        )}

        {isAddingTodo && (
          <TodoForm
            onSubmit={handleCreate}
            onCancel={() => {
              setIsAddingTodo(false);
              setParentIdForNewTodo(null);
            }}
            isSubmitting={createMutation.isPending}
            parentId={parentIdForNewTodo}
          />
        )}

        {editingTodo && (
          <TodoEditForm
            todo={editingTodo}
            onSubmit={handleUpdateSubmit}
            onCancel={() => setEditingTodo(null)}
            onDelete={handleDeleteFromEdit}
            isSubmitting={updateMutation.isPending}
            isDeleting={deleteMutation.isPending}
          />
        )}

        {deletingTodo && (
          <Modal open={true} onClose={cancelDelete}>
            <div className="p-6 space-y-4">
              <h2 className="text-xl font-semibold">{t('todo.deleteTodo')}</h2>
              <p className="text-muted-foreground">
                {t('todo.confirmDelete')}
              </p>
              <div className="flex gap-3 justify-end">
                <Button
                  variant="secondary"
                  onClick={cancelDelete}
                  disabled={deleteMutation.isPending}
                >
                  {t('common.cancel')}
                </Button>
                <Button
                  variant="danger"
                  onClick={confirmDelete}
                  disabled={deleteMutation.isPending}
                >
                  {deleteMutation.isPending ? t('common.loading') : t('common.delete')}
                </Button>
              </div>
            </div>
          </Modal>
        )}
      </div>
    </AppLayout>
  );
}

export default function TodosPage() {
  return (
    <AuthGuard>
      <TodoApp />
    </AuthGuard>
  );
}