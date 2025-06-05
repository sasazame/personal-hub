# Claude Code 協働開発ガイドライン

## プロジェクト概要
Personal Hub - 個人生産性向上アプリケーション
- **技術スタック**: Next.js 15+ (App Router), React 19, TypeScript, Tailwind CSS
- **状態管理**: TanStack Query + React Hook Form
- **テスト**: Jest, React Testing Library, Playwright
- **主要機能**: TODO管理（✅完成）、カレンダー（✅完成）、メモ（✅完成）、統合ダッシュボード（✅完成）
- **開発予定**: 分析機能、PWA対応、外部連携
- **目的**: 日常業務の一元管理と生産性向上

## 開発フロー（重要）
```bash
# 1. 新機能開発時はfeatブランチを作成
git checkout -b feat/feature-name

# 2. 実装・テスト・コミット（CIと同等のチェック必須）
npm run type-check && npm run lint && npm test && npm run build
git add . && git commit -m "feat: 機能の説明"

# 3. ローカルでE2Eテスト実行（CI無効化のため必須）
npm run test:e2e  # 最低限 npm run test:e2e:smoke は必須

# 4. GitHubにプッシュしてPRを作成（CI自動実行）
git push origin feat/feature-name
gh pr create --title "機能タイトル" --body "詳細説明" --assignee sasazame
```

## CI/CD パイプライン ✅
- **自動実行**: PR作成時・push時
- **必須チェック**: type-check, lint, test, build
- **テスト**: 19スイート・233テスト（全パス状態維持）
- **E2Eテスト**: ⚠️ CI環境で一時無効化中（[Issue #24](https://github.com/sasazame/todo-app-frontend/issues/24)）
- **デプロイ**: mainブランチ → Vercel自動デプロイ

## コーディング規約

### TypeScript
- `strict: true`、`any`禁止（`unknown`+型ガードを使用）
- const assertion使用（Enumの代わり）
- React.FC使用禁止、1ファイル1エクスポート
- Props命名は明確に（`onTodoClick`等）

### React/Next.js
- Server Components優先、`'use client'`は最小限
- カスタムフック: `use`プレフィックス
- ファイル名: PascalCase（`TodoItem.tsx`）

### Tailwind CSS
- モバイルファースト、`dark:`対応
- デザイントークン活用
- `cn()`ユーティリティで整理

## デザインシステム

### プレミアム認証画面デザイン
**実装概要**:
- **背景**: アニメーション付きグラデーション（blue/indigo→slate）+ ブロブアニメーション
- **ガラスモーフィズム**: `bg-white/10 backdrop-blur-xl border-white/20`
- **フローティングラベル**: `FloatingInput`コンポーネント
- **ブランドアイデンティティ**: Sparklesアイコン + ブルー系グラデーションロゴ
- **パスワード強度**: リアルタイム表示 + 5段階評価システム

**コンポーネント**:
- `FloatingInput`: ガラス効果＋フローティングラベル入力欄
- `PasswordStrength`: 強度インジケーター（Very Weak→Strong）
- プレミアムボタン: ブルー系グラデーション＋ホバー効果＋スケール変換

**アニメーション**:
- `animate-blob`: 7秒無限ループ、ブルー系ブロブ移動
- `bg-grid-pattern`: 格子パターン背景
- スムーズトランジション: 0.3秒duration
- フローティング削除: ユーザビリティ向上

**アクセシビリティ**:
- 適切なaria-label設定
- フォーカスリング対応
- スクリーンリーダー対応（sr-only）
- キーボードナビゲーション完全対応

## プロジェクト構造
```
src/
├── app/                    # App Router pages
│   ├── dashboard/         # ダッシュボード（✅完成）
│   ├── todos/             # TODO管理（✅完成）
│   ├── calendar/          # カレンダー（✅完成）
│   ├── notes/             # メモ機能（✅完成）
│   └── analytics/         # 分析機能（開発予定）
├── components/
│   ├── ui/                # 基本UIコンポーネント
│   ├── todos/             # TODO関連コンポーネント（✅完成）
│   ├── calendar/          # カレンダー関連（✅完成）
│   ├── notes/             # メモ関連（✅完成）
│   ├── auth/              # 認証関連
│   └── layout/            # レイアウト
├── hooks/                 # カスタムフック（✅包括的実装）
├── lib/                   # 外部ライブラリ設定
├── services/              # API通信・モックサービス（✅完成）
├── types/                 # 型定義（✅完成）
└── utils/                 # ユーティリティ
```

## コミット規約
```
<type>(<scope>): <subject>

🤖 Generated with [Claude Code](https://claude.ai/code)
Co-Authored-By: Claude <noreply@anthropic.com>
```
**タイプ**: feat, fix, docs, style, refactor, perf, test, chore

## テスト方針
- **単体**: Jest + RTL（ユーティリティ、フック）
- **統合**: RTL（ユーザーインタラクション）
- **E2E**: Playwright（クリティカルパス）
- **設定**: Jest除外設定（Playwright: `*.spec.ts`）
- **品質**: AAA パターン、ユーザー視点、型安全性重視

## API連携
- バックエンドURL: `http://localhost:8080/api/v1`
- TanStack Query使用
- エラーハンドリング: Error Boundary + トースト

## 重要な実装パターン
1. **Server Components**: デフォルト、データフェッチ
2. **Client Components**: インタラクション必要時のみ
3. **状態管理**: TanStack Query（サーバー状態）+ useState（ローカル状態）
4. **フォーム**: React Hook Form + Zod
5. **エラー**: Error Boundary + 適切なフォールバック

## Claude Codeへの依頼テンプレート
```markdown
## 実装したい機能
[UI/UX要件を具体的に記載]

## 現在の状況
[関連コンポーネント、既存実装]

## 期待する結果
[画面の動作、ユーザー体験]

## デザイン要件
[レスポンシブ、アクセシビリティ要件]
```

## 開発時チェックリスト
- [ ] featブランチで作業
- [ ] TypeScript型安全性（`any`禁止）
- [ ] Server/Client Components適切な分離
- [ ] レスポンシブデザイン
- [ ] アクセシビリティ（a11y）
- [ ] エラーハンドリング
- [ ] テスト作成（実際の動作に合わせる）
- [ ] **CI同等チェック**: `type-check && lint && test && build`
- [ ] 全233テスト成功確認
- [ ] **ローカルE2Eテスト実行**（必須）: `npm run test:e2e`
- [ ] PR作成（assignee: sasazame）、[PR要件](./docs/PR_REQUIREMENTS.md)確認

## 開発コマンド
```bash
npm run dev          # 開発サーバー（Turbopack）
npm run build        # プロダクションビルド
npm run type-check   # TypeScript型チェック
npm run lint         # ESLint実行
npm test             # Jest単体テスト
npm run test:e2e     # Playwright E2Eテスト

# CI同等チェック（必須）
npm run type-check && npm run lint && npm test && npm run build
```

## 環境・設定
- Node.js 18+, npm 9+
- バックエンド連携: localhost:8080
- 主要パッケージ: package.jsonを参照

## CI/CDトラブルシューティング
### よくある問題と解決法
1. **Jest + Playwright競合**
   - `jest.config.js`で`testPathIgnorePatterns: ['*.spec.ts']`
   - E2Eテストは`npm run test:e2e`で個別実行

2. **TypeScript型エラー**
   - `any`禁止→`unknown`+型ガード使用
   - CVA: `defaultVariants`のundefined対応

3. **テスト失敗パターン**
   - UIテスト: 実際のCSS出力に合わせる
   - モーダルテスト: DOM構造での特定方法
   - 非同期テスト: `waitFor`+適切なセレクタ

4. **E2Eテスト問題** ⚠️
   - CI環境で一時無効化中（[Issue #24](https://github.com/sasazame/todo-app-frontend/issues/24)）
   - ローカルでのE2Eテスト実行が必須
   - バックエンド起動確認: `http://localhost:8080`

### 修正手順
```bash
# 1. ローカルでCI同等テスト
npm run type-check && npm run lint && npm test && npm run build

# 2. E2Eテスト実行（必須）
npm run test:e2e  # または npm run test:e2e:smoke

# 3. エラーが出たら原因特定
npm test -- --verbose  # 詳細テスト結果
npm run lint -- --debug  # ESLint詳細

# 4. 修正後、再度テスト実行
# 5. 全パス確認後にpush
```

このファイルはClaude Codeが効率的に作業するための簡潔なガイドライン。
詳細な設計情報は`README.md`および`docs/`フォルダーを参照。