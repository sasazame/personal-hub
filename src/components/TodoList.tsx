'use client';

import { Todo } from '@/types/todo';
import TodoItem from './TodoItem';

interface TodoListProps {
  todos: Todo[];
  onUpdate: (id: number, todo: Todo) => void;
  onDelete: (id: number, todo: Todo) => void;
  onAddChild?: (parentId: number) => void;
}

export default function TodoList({ todos, onUpdate, onDelete, onAddChild }: TodoListProps) {
  return (
    <div className="space-y-4">
      {todos.map((todo) => (
        <TodoItem
          key={todo.id}
          todo={todo}
          onUpdate={onUpdate}
          onDelete={onDelete}
          onAddChild={onAddChild || (() => {})}
          level={0}
        />
      ))}
    </div>
  );
}