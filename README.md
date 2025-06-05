# Personal Hub

個人の生産性向上を目的とした統合ワークスペースアプリケーション

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
- ✅ **TODO管理**: CRUD操作、ステータス管理、優先度設定
- 🗓️ **カレンダー**: イベント管理、スケジュール表示
- 📝 **メモ機能**: ノート作成・編集、カテゴリ分類
- 📊 **ダッシュボード**: 統合ビュー、進捗状況、分析
- 👤 **ユーザー管理**: プロフィール、認証、設定
- 🎨 **UI/UX**: レスポンシブ、ダークモード、アクセシビリティ対応

## ⚡ クイックスタート

### 前提条件
- Node.js 18+
- npm 9+
- バックエンドAPI（localhost:8080）

### 起動手順
```bash
# 1. リポジトリをクローン
git clone https://github.com/sasazame/personal-hub.git
cd personal-hub

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

# アプリケーション設定
NEXT_PUBLIC_APP_NAME=Personal Hub
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

# 型チェック
npm run type-check

# テスト実行
npm test

# E2Eテスト
npm run test:e2e
```

### ブランチ戦略
```bash
# 新機能開発
git checkout -b feat/feature-name

# バグ修正
git checkout -b fix/bug-description

# ローカルでテスト実行（PR前に必須）
npm run type-check && npm run lint && npm test && npm run build

# プルリクエスト作成
git push origin feat/feature-name
gh pr create --assignee sasazame
```

## 🧩 アーキテクチャ

### ディレクトリ構造
```
src/
├── app/                    # App Router（pages）
│   ├── dashboard/         # ダッシュボード
│   ├── todos/             # TODO管理
│   ├── calendar/          # カレンダー
│   ├── notes/             # メモ機能
│   └── profile/           # ユーザー設定
├── components/
│   ├── ui/                # 基本UIコンポーネント
│   ├── todos/             # TODO関連コンポーネント
│   ├── calendar/          # カレンダー関連
│   ├── notes/             # メモ関連
│   ├── dashboard/         # ダッシュボード関連
│   ├── auth/              # 認証関連
│   └── layout/            # レイアウト
├── hooks/                 # カスタムフック
├── lib/                   # 外部ライブラリ設定
├── services/              # API 通信ロジック
├── types/                 # 型定義
└── utils/                 # ヘルパー関数
```

### モジュール設計
- **todos/**: TODO機能の完全実装
- **calendar/**: イベント・スケジュール管理
- **notes/**: メモ・ノート機能
- **dashboard/**: 統合ビュー・分析
- **shared/**: 共通コンポーネント・ユーティリティ

## 🧪 テスト

### テスト実行
```bash
# 単体テスト
npm test

# テスト（ウォッチモード）
npm run test:watch

# カバレッジ
npm run test:coverage

# E2Eテスト
npm run test:e2e
```

### テスト戦略
- **単体テスト**: コンポーネント、フック、ユーティリティ
- **統合テスト**: 機能間連携、API通信
- **E2Eテスト**: ユーザーフロー、クリティカルパス

## 📡 API 連携

### TanStack Query ベースの状態管理
```typescript
// hooks/useTodos.ts
export function useTodos(status?: TodoStatus) {
  return useQuery({
    queryKey: ['todos', status],
    queryFn: () => todoApi.getList({ status }),
    staleTime: 1000 * 60 * 5,
  });
}

// hooks/useCalendarEvents.ts
export function useCalendarEvents(date: Date) {
  return useQuery({
    queryKey: ['calendar', 'events', format(date, 'yyyy-MM')],
    queryFn: () => calendarApi.getEvents({ date }),
  });
}
```

## 🎨 デザインシステム

### テーマ設定
- **カラーパレット**: Primary (Blue), Secondary (Gray), Accent colors
- **タイポグラフィ**: Inter フォント、統一された階層
- **スペーシング**: 8px grid system
- **レスポンシブ**: Mobile-first approach

### コンポーネント設計
- **UI Components**: 再利用可能な基本要素
- **Feature Components**: 機能特化型コンポーネント
- **Layout Components**: ページ構造・ナビゲーション

## 🚧 開発ロードマップ

### Phase 1: 基盤整備 ✅
- [x] プロジェクト構成
- [x] TODO機能移植
- [x] 認証システム
- [x] 基本UI コンポーネント

### Phase 2: 新機能開発 🚧
- [ ] カレンダー機能実装
- [ ] メモ機能実装
- [ ] ダッシュボード開発

### Phase 3: 統合・最適化
- [ ] 機能間連携
- [ ] パフォーマンス最適化
- [ ] PWA対応

### Phase 4: 拡張機能
- [ ] データエクスポート
- [ ] 高度な分析機能
- [ ] 外部API連携

## 📝 開発ガイドライン

### コーディング規約
- TypeScript strict モード
- React functional components
- Server Components優先
- Tailwind CSS でのスタイリング

### コミット規約
```
<type>(<scope>): <subject>

🤖 Generated with [Claude Code](https://claude.ai/code)
Co-Authored-By: Claude <noreply@anthropic.com>
```

## 📚 ドキュメント

詳細な開発情報は `CLAUDE.md` および `docs/` フォルダーを参照してください。

## 🤝 貢献

1. このリポジトリをフォーク
2. feature ブランチを作成
3. 変更をコミット
4. テスト実行（必須）
5. プルリクエストを作成

---

**開発者**: sasazame  
**最終更新**: 2025年6月