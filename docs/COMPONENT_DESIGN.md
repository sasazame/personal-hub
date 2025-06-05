# コンポーネント設計書

## 概要
Next.js 15 (App Router) + React 19を使用したTODOアプリケーションのコンポーネント設計

## 設計原則

### 1. Server Components First
- **デフォルト**: Server Components
- **Client Components**: ユーザーインタラクションが必要な場合のみ
- **境界の明確化**: `'use client'`は最小単位で適用

### 2. コンポーネント分類
```
components/
├── ui/                 # 基本UIコンポーネント（再利用性重視）
├── features/           # 機能別コンポーネント（ビジネスロジック含む）
└── layouts/            # レイアウトコンポーネント
```

## コンポーネント階層

### 1. UI Components（ui/）
**特徴**: 再利用可能、スタイルのみ、ビジネスロジック無し

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

### 2. Feature Components（features/）
**特徴**: ビジネスロジック含む、特定機能に特化

#### TodoList（Server Component）
```typescript
interface TodoListProps {
  initialTodos?: Todo[];
  status?: TodoStatus;
}

// 責務：
// - TODOリストの表示
// - 初期データの提供（SSR）
// - 子コンポーネントへのデータ受け渡し
```

#### TodoItem（Client Component）
```typescript
interface TodoItemProps {
  todo: Todo;
  onUpdate?: (todo: Todo) => void;
  onDelete?: (id: string) => void;
}

// 責務：
// - 個別TODOの表示
// - ステータス変更、編集、削除のアクション
// - 楽観的更新のUI反映
```

#### TodoForm（Client Component）
```typescript
interface TodoFormProps {
  todo?: Todo; // 編集時のみ
  onSubmit: (todo: CreateTodoRequest | UpdateTodoRequest) => void;
  onCancel?: () => void;
}

// 責務：
// - TODO作成・編集フォーム
// - バリデーション（React Hook Form + Zod）
// - 送信処理
```

## 状態管理パターン

### 1. Server State（TanStack Query）
```typescript
// カスタムフック例
export function useTodos(status?: TodoStatus) {
  return useQuery({
    queryKey: ['todos', status],
    queryFn: () => todoApi.getList({ status }),
    staleTime: 1000 * 60 * 5, // 5分
  });
}

export function useCreateTodo() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: todoApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['todos'] });
    },
    // 楽観的更新
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

### 2. Local State（useState/useReducer）
```typescript
// フォーム状態
const [isEditing, setIsEditing] = useState(false);
const [selectedTodos, setSelectedTodos] = useState<string[]>([]);

// UI状態
const [isModalOpen, setIsModalOpen] = useState(false);
const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
```

## データフロー

### 1. データ取得フロー
```
Server Component → API Call → Initial Data
       ↓
Client Component → TanStack Query → Cache → UI Update
```

### 2. データ更新フロー
```
User Action → Form Validation → Mutation
     ↓              ↓             ↓
UI Update ← Optimistic Update ← API Call
```

## コンポーネント実装パターン

### 1. Server Component
```typescript
// app/todos/page.tsx
import { TodoList } from '@/components/features/TodoList';
import { todoApi } from '@/services/todo';

export default async function TodoPage() {
  // サーバーサイドでデータ取得
  const initialTodos = await todoApi.getList();
  
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">TODOリスト</h1>
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
      // エラーハンドリング
    }
  };
  
  return (
    <div>
      {/* TODOリスト表示 */}
      {todos?.map(todo => (
        <TodoItem key={todo.id} todo={todo} />
      ))}
      
      {/* フォーム */}
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

## エラーハンドリング

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
      <h2 className="text-xl font-semibold mb-4">エラーが発生しました</h2>
      <button
        onClick={reset}
        className="px-4 py-2 bg-blue-500 text-white rounded"
      >
        再試行
      </button>
    </div>
  );
}
```

### 2. API エラーハンドリング
```typescript
// TanStack Query のエラーハンドリング
export function useTodos() {
  return useQuery({
    queryKey: ['todos'],
    queryFn: todoApi.getList,
    retry: (failureCount, error) => {
      // 401/403は再試行しない
      if (error instanceof ApiError && [401, 403].includes(error.status)) {
        return false;
      }
      return failureCount < 3;
    },
    onError: (error) => {
      toast.error(`TODOの取得に失敗しました: ${error.message}`);
    },
  });
}
```

## アクセシビリティ

### 1. セマンティックHTML
```typescript
// 適切なHTML要素を使用
<main>
  <h1>TODOリスト</h1>
  <section aria-label="TODO作成">
    <form>
      <fieldset>
        <legend>新しいTODO</legend>
        <label htmlFor="title">タイトル</label>
        <input id="title" type="text" required />
      </fieldset>
    </form>
  </section>
</main>
```

### 2. キーボードナビゲーション
```typescript
// フォーカス管理
const handleKeyDown = (e: KeyboardEvent) => {
  if (e.key === 'Escape') {
    closeModal();
  }
  if (e.key === 'Enter' && e.ctrlKey) {
    submitForm();
  }
};
```

## パフォーマンス最適化

### 1. コード分割
```typescript
// 動的インポート
const TodoForm = lazy(() => import('./TodoForm'));

// 条件付きロード
{isFormOpen && (
  <Suspense fallback={<FormSkeleton />}>
    <TodoForm />
  </Suspense>
)}
```

### 2. メモ化
```typescript
// React.memo
export const TodoItem = memo(function TodoItem({ todo }: TodoItemProps) {
  // コンポーネント実装
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