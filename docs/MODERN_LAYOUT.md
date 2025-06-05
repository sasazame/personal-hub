# モダンなレイアウトとナビゲーション実装

## 概要

Issue #10の実装として、TODOアプリケーションに新しいモダンなレイアウトとナビゲーションシステムを導入しました。この実装では、グラスモーフィズムデザイン、レスポンシブナビゲーション、ページトランジションなどの最新のUIパターンを採用しています。

## 実装内容

### 1. グラスモーフィズムヘッダー

#### 特徴
- 半透明の背景とbackdrop-blurによるガラス効果
- ブランドロゴにグラデーションとSparklesアイコンを使用
- レスポンシブ対応（デスクトップ/モバイル）
- ダークモード対応

#### コンポーネント: `src/components/layout/Header.tsx`
```typescript
// グラスモーフィズム効果
className="bg-white/10 dark:bg-gray-900/10 backdrop-blur-xl border-b border-white/20"
```

### 2. サイドバーナビゲーション

#### 特徴
- 折りたたみ可能なサイドバー
- アクティブリンクのハイライト表示
- グラデーションによる選択状態の表示
- アイコン付きナビゲーション項目

#### コンポーネント: `src/components/layout/Sidebar.tsx`
- Home、TODOs、Calendar、Tags、Starred、Archive、Settingsのナビゲーション項目
- 折りたたみ時はアイコンのみ表示
- ツールチップによるラベル表示

### 3. ブレッドクラム

#### 特徴
- 現在のページ階層を表示
- 動的なパス解析
- 多言語対応（i18n）

#### コンポーネント: `src/components/layout/Breadcrumb.tsx`
- URLパスを自動解析
- 翻訳可能なセグメント名
- ホームアイコン付きのルートリンク

### 4. ページトランジション

#### 特徴
- Framer Motionによるスムーズなページ遷移
- フェードイン/アウト効果
- Y軸方向のスライドアニメーション

#### コンポーネント: `src/components/layout/PageTransition.tsx`
```typescript
// アニメーション設定
initial: { opacity: 0, y: 20 }
animate: { opacity: 1, y: 0 }
exit: { opacity: 0, y: -20 }
```

### 5. 統合レイアウト

#### 特徴
- すべてのレイアウトコンポーネントを統合
- グリッドパターン背景
- レスポンシブコンテナ

#### コンポーネント: `src/components/layout/AppLayout.tsx`
- Header、Sidebar、Breadcrumb、PageTransitionを統合
- サイドバーの状態に応じたメインコンテンツの調整

## 技術的な実装詳細

### CSS カスタマイズ

`src/app/globals.css`に追加されたグリッドパターン：
```css
.bg-grid-pattern {
  background-image: 
    linear-gradient(to right, rgb(107 114 128 / 0.1) 1px, transparent 1px),
    linear-gradient(to bottom, rgb(107 114 128 / 0.1) 1px, transparent 1px);
  background-size: 20px 20px;
}
```

### 翻訳キー

以下の翻訳キーが追加されました：
- `nav.home` - ホーム
- `nav.todos` - TODO
- `nav.calendar` - カレンダー
- `nav.tags` - タグ
- `nav.starred` - スター付き
- `nav.archive` - アーカイブ
- `nav.settings` - 設定
- `nav.profile` - プロフィール
- `header.loggingOut` - ログアウト中...
- `app.subtitle` - タスクを効率的に整理する

### 依存関係

新しく追加されたパッケージ：
- `framer-motion` - ページトランジションとアニメーション効果

## 使用方法

認証済みのページで新しいレイアウトを使用するには、`AppLayout`コンポーネントでラップします：

```tsx
import { AppLayout } from '@/components/layout';

export default function MyPage() {
  return (
    <AppLayout>
      {/* ページコンテンツ */}
    </AppLayout>
  );
}
```

## アクセシビリティ

- すべてのインタラクティブ要素に適切なaria-label
- キーボードナビゲーション対応
- フォーカスインジケーター
- スクリーンリーダー対応

## パフォーマンス最適化

- Client Componentsの最小化
- 遅延レンダリング（モバイルメニュー）
- CSS transitionによる滑らかなアニメーション
- 条件付きレンダリングによる不要なDOMの削減

## 今後の拡張予定

1. サイドバーの永続的な折りたたみ状態の保存
2. カスタマイズ可能なナビゲーション項目
3. ドラッグ＆ドロップによるナビゲーション項目の並び替え
4. キーボードショートカットの追加
5. 検索機能の統合