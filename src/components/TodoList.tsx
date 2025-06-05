'use client';

import { Todo } from '@/types/todo';

interface TodoListProps {
  todos: Todo[];
  onUpdate: (id: number, todo: Todo) => void;
  onDelete: (id: number, todo: Todo) => void;
}

export default function TodoList({ todos, onUpdate, onDelete }: TodoListProps) {
  const getStatusColor = (status: Todo['status']) => {
    switch (status) {
      case 'TODO':
        return 'bg-status-pending-bg text-status-pending-text';
      case 'IN_PROGRESS':
        return 'bg-status-in-progress-bg text-status-in-progress-text';
      case 'DONE':
        return 'bg-status-completed-bg text-status-completed-text';
    }
  };

  const getPriorityColor = (priority: Todo['priority']) => {
    switch (priority) {
      case 'LOW':
        return 'bg-priority-low-bg text-priority-low-text';
      case 'MEDIUM':
        return 'bg-priority-medium-bg text-priority-medium-text';
      case 'HIGH':
        return 'bg-priority-high-bg text-priority-high-text';
    }
  };

  return (
    <div className="space-y-4">
      {todos.map((todo) => (
        <div
          key={todo.id}
          className="bg-card p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow"
        >
          <div className="flex justify-between items-start mb-4">
            <h3 className="text-lg font-semibold text-card-foreground">{todo.title}</h3>
            <div className="flex gap-2">
              <span
                className={`px-3 py-1 text-xs font-medium rounded-full ${getStatusColor(
                  todo.status
                )}`}
              >
                {todo.status.replace('_', ' ')}
              </span>
              <span className={`px-2 py-1 text-xs font-medium rounded-full ${getPriorityColor(todo.priority)}`}>
                {todo.priority}
              </span>
            </div>
          </div>
          
          {todo.description && (
            <p className="text-muted-foreground mb-4">{todo.description}</p>
          )}
          
          <div className="flex justify-between items-center">
            <div className="text-sm text-muted-foreground">
              {todo.dueDate && (
                <span>Due: {new Date(todo.dueDate).toLocaleDateString()}</span>
              )}
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => onUpdate(todo.id, todo)}
                className="px-4 py-2 text-sm font-medium text-primary hover:text-primary/80 focus:outline-none focus:ring-2 focus:ring-ring"
              >
                Edit
              </button>
              <button
                onClick={() => onDelete(todo.id, todo)}
                className="px-4 py-2 text-sm font-medium text-destructive hover:text-destructive/80 focus:outline-none focus:ring-2 focus:ring-ring"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}