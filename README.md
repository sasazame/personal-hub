# TODO App Frontend

[![CI/CD Pipeline](https://github.com/sasazame/todo-app-frontend/actions/workflows/ci.yml/badge.svg)](https://github.com/sasazame/todo-app-frontend/actions/workflows/ci.yml)
[![codecov](https://codecov.io/gh/sasazame/todo-app-frontend/branch/main/graph/badge.svg)](https://codecov.io/gh/sasazame/todo-app-frontend)

Next.js 15 + React 19 + TypeScript で構築されたTODOアプリケーションのフロントエンド

## 🚀 プロジェクト概要

### 技術スタック
- **フレームワーク**: Next.js 15 (App Router)
- **言語**: TypeScript 5+
- **UIライブラリ**: React 19
- **スタイリング**: Tailwind CSS 4
- **状態管理**: TanStack Query + React Hook Form
- **テスト**: Jest, React Testing Library, Playwright
- **ツール**: ESLint, Prettier, Turbopack

### 主な機能
- ✅ TODO の CRUD 操作
- ✅ ステータス管理（TODO/進行中/完了）
- ✅ 優先度設定（高/中/低）
- ✅ 期限日設定
- ✅ 親子タスク（サブタスク）管理
- ✅ ステータスフィルタリング
- ✅ ユーザープロフィール管理
- ✅ パスワード変更機能
- ✅ アカウント削除機能
- ✅ 改善されたカードデザイン（視覚的な分離、チェックボックス）
- ✅ 直感的なボタン配置（編集ボタンを右下、削除を編集フォーム内に移動）
- ✅ リアルタイム更新
- ✅ レスポンシブデザイン
- ✅ ダークモード対応
- ✅ アクセシビリティ対応

## 📋 目次
1. [クイックスタート](#クイックスタート)
2. [環境構築](#環境構築)
3. [開発ガイド](#開発ガイド)
4. [コンポーネント設計](#コンポーネント設計)
5. [テスト](#テスト)
6. [設計資料](#設計資料)

## ⚡ クイックスタート

### 前提条件
- Node.js 18+
- npm 9+
- バックエンドAPI（localhost:8080）

### 起動手順
```bash
# 1. リポジトリをクローン
git clone https://github.com/sasazame/todo-app-frontend.git
cd todo-app-frontend

# 2. 依存関係をインストール
npm install

# 3. 開発サーバー起動
npm run dev

# 4. ブラウザで確認
open http://localhost:3000
```

## 🛠️ 環境構築

### 環境変数設定
`.env.local` ファイルを作成:
```bash
# API エンドポイント
NEXT_PUBLIC_API_URL=http://localhost:8080/api/v1

# その他の設定
NEXT_PUBLIC_APP_NAME=TODO App
```

### バックエンド連携
バックエンドAPIが localhost:8080 で動作している必要があります。
詳細は [todo-app-backend](https://github.com/sasazame/todo-app-backend) を参照。

## 👨‍💻 開発ガイド

### 開発サーバー
```bash
# Turbopack を使用した高速開発サーバー
npm run dev

# 本番ビルド
npm run build

# 本番サーバー起動
npm start
```

### コード品質
```bash
# ESLint チェック
npm run lint

# Prettier フォーマット
npm run format

# 型チェック
npm run type-check
```

### ブランチ戦略
```bash
# 新機能開発
git checkout -b feat/feature-name

# バグ修正
git checkout -b fix/bug-description

# ローカルでテスト実行（PR前に必須）
npm run type-check && npm run lint && npm test && npm run test:e2e

# プルリクエスト作成
git push origin feat/feature-name
gh pr create --assignee sasazame
```

> 📋 PRマージ要件の詳細は[PR要件ドキュメント](./docs/PR_REQUIREMENTS.md)を参照してください。

## 🧩 コンポーネント設計

### ディレクトリ構造
```
src/
├── app/                 # App Router（pages）
│   ├── layout.tsx      # ルートレイアウト
│   ├── page.tsx        # ホームページ
│   └── todos/          # TODO関連ページ
├── components/
│   ├── ui/             # 基本UIコンポーネント
│   │   ├── Button.tsx
│   │   ├── Input.tsx
│   │   └── Select.tsx
│   ├── features/       # 機能別コンポーネント
│   │   └── todo/
│   │       ├── TodoList.tsx
│   │       ├── TodoItem.tsx
│   │       └── TodoForm.tsx
│   └── layouts/        # レイアウトコンポーネント
├── hooks/              # カスタムフック
│   └── useTodos.ts
├── lib/                # 外部ライブラリ設定
│   ├── api.ts         # API クライアント
│   └── utils.ts       # ユーティリティ
├── services/           # API 通信ロジック
│   └── todo.ts
├── types/              # 型定義
│   └── todo.ts
└── utils/              # ヘルパー関数
    └── cn.ts          # クラス名結合
```

### コンポーネント分類

#### 1. UI Components（ui/）
- **目的**: 再利用可能な基本UIコンポーネント
- **特徴**: ビジネスロジック無し、スタイルのみ
- **例**: Button, Input, Modal, Card

#### 2. Feature Components（features/）
- **目的**: 特定機能に特化したコンポーネント
- **特徴**: ビジネスロジック含む、API連携
- **例**: TodoList, TodoForm, UserProfile

### Server Components vs Client Components

#### Server Components（デフォルト）
```typescript
// app/todos/page.tsx
import { TodoList } from '@/components/features/TodoList';

export default async function TodoPage() {
  // サーバーサイドでのデータ取得
  const initialTodos = await fetch('/api/todos').then(r => r.json());
  
  return (
    <main className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">TODOリスト</h1>
      <TodoList initialTodos={initialTodos} />
    </main>
  );
}
```

#### Client Components（必要時のみ）
```typescript
'use client';

import { useState } from 'react';
import { useTodos } from '@/hooks/useTodos';

export function TodoList({ initialTodos }: { initialTodos: Todo[] }) {
  const [filter, setFilter] = useState<TodoStatus>('ALL');
  const { data: todos } = useTodos({ initialData: initialTodos });
  
  // インタラクションロジック
}
```

## 🧪 テスト

### テスト実行

> ⚠️ **重要**: E2Eテストは現在CI環境で一時的に無効化されています。PRマージ前にローカルでE2Eテストを実行してください。詳細は[PR要件](./docs/PR_REQUIREMENTS.md)を参照。

```bash
# 単体テスト
npm test

# テスト（ウォッチモード）
npm run test:watch

# カバレッジ
npm run test:coverage

# E2Eテスト（ローカル実行必須）
npm run test:e2e

# E2Eテスト（UIモード）
npm run test:e2e:ui
```

### テスト構成

#### 1. 単体テスト（Jest + RTL）
```typescript
// components/ui/Button.test.tsx
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Button } from './Button';

describe('Button', () => {
  it('クリックイベントが正しく発火する', async () => {
    const handleClick = jest.fn();
    render(<Button onClick={handleClick}>クリック</Button>);
    
    await userEvent.click(screen.getByRole('button'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });
});
```

#### 2. E2Eテスト（Playwright）
```typescript
// tests/todo-crud.spec.ts
import { test, expect } from '@playwright/test';

test('TODOの作成・編集・削除', async ({ page }) => {
  await page.goto('/');
  
  // TODO作成
  await page.fill('[data-testid="todo-title"]', '新しいTODO');
  await page.click('[data-testid="submit-button"]');
  
  // 作成確認
  await expect(page.locator('[data-testid="todo-item"]')).toContainText('新しいTODO');
});
```

## 📡 API 連携

### TanStack Query を使用した状態管理
```typescript
// hooks/useTodos.ts
export function useTodos(status?: TodoStatus) {
  return useQuery({
    queryKey: ['todos', status],
    queryFn: () => todoApi.getList({ status }),
    staleTime: 1000 * 60 * 5, // 5分間キャッシュ
  });
}

export function useCreateTodo() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: todoApi.create,
    onSuccess: () => {
      // キャッシュの無効化
      queryClient.invalidateQueries({ queryKey: ['todos'] });
    },
    // 楽観的更新
    onMutate: async (newTodo) => {
      await queryClient.cancelQueries({ queryKey: ['todos'] });
      const previousTodos = queryClient.getQueryData(['todos']);
      
      queryClient.setQueryData(['todos'], (old: Todo[]) => [
        ...old,
        { ...newTodo, id: 'temp-' + Date.now() }
      ]);
      
      return { previousTodos };
    },
  });
}
```

## 🎨 スタイリング（Tailwind CSS）

### デザインシステム
```typescript
// tailwind.config.ts
export default {
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#eff6ff',
          500: '#3b82f6',
          900: '#1e3a8a',
        },
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/typography'),
  ],
};
```

### コンポーネントスタイル例
```typescript
// components/ui/Button.tsx
const buttonVariants = {
  primary: 'bg-primary-500 hover:bg-primary-600 text-white',
  secondary: 'bg-gray-200 hover:bg-gray-300 text-gray-900',
  danger: 'bg-red-500 hover:bg-red-600 text-white',
};

export function Button({ variant = 'primary', ...props }) {
  return (
    <button
      className={cn(
        'px-4 py-2 rounded-md font-medium transition-colors',
        buttonVariants[variant],
        props.className
      )}
      {...props}
    />
  );
}
```

## 📚 設計資料

### 詳細ドキュメント
- [コンポーネント設計](docs/COMPONENT_DESIGN.md) - React コンポーネントの設計方針
- [状態管理](docs/STATE_MANAGEMENT.md) - TanStack Query の使用方法
- [スタイリング](docs/STYLING.md) - Tailwind CSS の設計原則

## 🔧 パフォーマンス最適化

### 1. コード分割
```typescript
// 動的インポート
const TodoForm = lazy(() => import('./TodoForm'));

// 条件付きレンダリング
{showForm && (
  <Suspense fallback={<FormSkeleton />}>
    <TodoForm />
  </Suspense>
)}
```

### 2. メモ化
```typescript
// React.memo
export const TodoItem = memo(function TodoItem({ todo }) {
  // ...
});

// useMemo / useCallback
const filteredTodos = useMemo(() => 
  todos.filter(todo => todo.status === filter), 
  [todos, filter]
);
```

## 🚧 今後の開発予定

### 近期予定
- [ ] ダークモード実装
- [ ] PWA対応
- [ ] オフライン同期
- [ ] プッシュ通知

### 中長期予定
- [ ] 多言語対応（i18n）
- [ ] ドラッグ&ドロップ
- [ ] 高度な検索・フィルター
- [ ] データエクスポート機能

## 📝 ライセンス

このプロジェクトは MIT ライセンスの下で公開されています。

## 🤝 貢献

1. このリポジトリをフォーク
2. feature ブランチを作成 (`git checkout -b feat/amazing-feature`)
3. 変更をコミット (`git commit -m 'feat: 素晴らしい機能を追加'`)
4. ローカルでテスト実行（必須）:
   ```bash
   npm run type-check && npm run lint && npm test && npm run test:e2e
   ```
5. ブランチにプッシュ (`git push origin feat/amazing-feature`)
6. プルリクエストを作成（[PR要件](./docs/PR_REQUIREMENTS.md)を確認）

---

**開発者**: sasazame  
**最終更新**: 2025年1月