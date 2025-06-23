# Component Design Document

## Overview
Component design for Personal Hub (integrated application) using Next.js 15 (App Router) + React 19

## Design Principles

### 1. Server Components First
- **Default**: Server Components
- **Client Components**: Only when user interaction is required
- **Clear boundaries**: Apply `'use client'` at minimal units

### 2. Component Classification
```
components/
├── ui/                 # Basic UI components (focus on reusability)
├── todos/              # TODO feature components
├── calendar/           # Calendar feature components
├── notes/              # Notes feature components
├── dashboard/          # Dashboard feature components
├── auth/               # Authentication-related components
└── layout/             # Layout components
```

## Component Hierarchy

### 1. UI Components (ui/)
**Characteristics**: Reusable, styling only, no business logic

#### Button
```typescript
interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  children: React.ReactNode;
  onClick?: () => void;
}
```

#### Input
```typescript
interface InputProps {
  type?: 'text' | 'email' | 'password' | 'date';
  placeholder?: string;
  value?: string;
  onChange?: (value: string) => void;
  error?: string;
  required?: boolean;
}
```

#### Select
```typescript
interface SelectProps<T> {
  options: { value: T; label: string }[];
  value?: T;
  onChange?: (value: T) => void;
  placeholder?: string;
  error?: string;
}
```

### 2. Feature Components (Feature-specific folders)
**Characteristics**: Contains business logic, specialized for specific features

#### TodoList (Server Component)
```typescript
interface TodoListProps {
  initialTodos?: Todo[];
  status?: TodoStatus;
}

// Responsibilities:
// - Display TODO list
// - Provide initial data (SSR)
// - Pass data to child components
```

#### TodoItem (Client Component)
```typescript
interface TodoItemProps {
  todo: Todo;
  onUpdate?: (todo: Todo) => void;
  onDelete?: (id: string) => void;
}

// Responsibilities:
// - Display individual TODO
// - Handle status change, edit, delete actions
// - Reflect optimistic updates in UI
```

#### TodoForm (Client Component)
```typescript
interface TodoFormProps {
  todo?: Todo; // Only for editing
  onSubmit: (todo: CreateTodoRequest | UpdateTodoRequest) => void;
  onCancel?: () => void;
}

// Responsibilities:
// - TODO creation/editing form
// - Validation (React Hook Form + Zod)
// - Handle submission
```

## State Management Patterns

### 1. Server State (TanStack Query)
```typescript
// Custom hook example
export function useTodos(status?: TodoStatus) {
  return useQuery({
    queryKey: ['todos', status],
    queryFn: () => todoApi.getList({ status }),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

export function useCreateTodo() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: todoApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['todos'] });
    },
    // Optimistic update
    onMutate: async (newTodo) => {
      await queryClient.cancelQueries({ queryKey: ['todos'] });
      const previousTodos = queryClient.getQueryData(['todos']);
      queryClient.setQueryData(['todos'], (old: Todo[]) => [
        ...old,
        { ...newTodo, id: 'temp-id', createdAt: new Date() }
      ]);
      return { previousTodos };
    },
  });
}
```

### 2. Local State (useState/useReducer)
```typescript
// Form state
const [isEditing, setIsEditing] = useState(false);
const [selectedTodos, setSelectedTodos] = useState<string[]>([]);

// UI state
const [isModalOpen, setIsModalOpen] = useState(false);
const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
```

## Data Flow

### 1. Data Fetching Flow
```
Server Component → API Call → Initial Data
       ↓
Client Component → TanStack Query → Cache → UI Update
```

### 2. Data Update Flow
```
User Action → Form Validation → Mutation
     ↓              ↓             ↓
UI Update ← Optimistic Update ← API Call
```

## Component Implementation Patterns

### 1. Server Component
```typescript
// app/todos/page.tsx
import { TodoList } from '@/components/todos/TodoList';
import { todoApi } from '@/services/todo';

export default async function TodoPage() {
  // Server-side data fetching
  const initialTodos = await todoApi.getList();
  
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">TODO List</h1>
      <TodoList initialTodos={initialTodos} />
    </div>
  );
}
```

### 2. Client Component
```typescript
'use client';

import { useState } from 'react';
import { useTodos, useCreateTodo } from '@/hooks/useTodos';
import { TodoItem } from './TodoItem';
import { TodoForm } from './TodoForm';

interface TodoListProps {
  initialTodos?: Todo[];
}

export function TodoList({ initialTodos }: TodoListProps) {
  const [isFormOpen, setIsFormOpen] = useState(false);
  
  const { data: todos = initialTodos } = useTodos();
  const createTodo = useCreateTodo();
  
  const handleCreate = async (data: CreateTodoRequest) => {
    try {
      await createTodo.mutateAsync(data);
      setIsFormOpen(false);
    } catch (error) {
      // Error handling
    }
  };
  
  return (
    <div>
      {/* TODO list display */}
      {todos?.map(todo => (
        <TodoItem key={todo.id} todo={todo} />
      ))}
      
      {/* Form */}
      {isFormOpen && (
        <TodoForm 
          onSubmit={handleCreate}
          onCancel={() => setIsFormOpen(false)}
        />
      )}
    </div>
  );
}
```

## Error Handling

### 1. Error Boundary
```typescript
// app/error.tsx
'use client';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <h2 className="text-xl font-semibold mb-4">An error occurred</h2>
      <button
        onClick={reset}
        className="px-4 py-2 bg-blue-500 text-white rounded"
      >
        Retry
      </button>
    </div>
  );
}
```

### 2. API Error Handling
```typescript
// TanStack Query error handling
export function useTodos() {
  return useQuery({
    queryKey: ['todos'],
    queryFn: todoApi.getList,
    retry: (failureCount, error) => {
      // Don't retry for 401/403
      if (error instanceof ApiError && [401, 403].includes(error.status)) {
        return false;
      }
      return failureCount < 3;
    },
    onError: (error) => {
      toast.error(`Failed to fetch TODOs: ${error.message}`);
    },
  });
}
```

## Accessibility

### 1. Semantic HTML
```typescript
// Use appropriate HTML elements
<main>
  <h1>TODO List</h1>
  <section aria-label="TODO Creation">
    <form>
      <fieldset>
        <legend>New TODO</legend>
        <label htmlFor="title">Title</label>
        <input id="title" type="text" required />
      </fieldset>
    </form>
  </section>
</main>
```

### 2. Keyboard Navigation
```typescript
// Focus management
const handleKeyDown = (e: KeyboardEvent) => {
  if (e.key === 'Escape') {
    closeModal();
  }
  if (e.key === 'Enter' && e.ctrlKey) {
    submitForm();
  }
};
```

## Performance Optimization

### 1. Code Splitting
```typescript
// Dynamic import
const TodoForm = lazy(() => import('./TodoForm'));

// Conditional loading
{isFormOpen && (
  <Suspense fallback={<FormSkeleton />}>
    <TodoForm />
  </Suspense>
)}
```

### 2. Memoization
```typescript
// React.memo
export const TodoItem = memo(function TodoItem({ todo }: TodoItemProps) {
  // Component implementation
});

// useMemo
const filteredTodos = useMemo(() => {
  return todos.filter(todo => todo.status === selectedStatus);
}, [todos, selectedStatus]);

// useCallback
const handleStatusChange = useCallback((id: string, status: TodoStatus) => {
  updateTodo.mutate({ id, status });
}, [updateTodo]);
```