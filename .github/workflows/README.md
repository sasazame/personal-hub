# GitHub Actions CI/CD Pipeline

## 概要
このディレクトリには、TODO App FrontendのCI/CDパイプライン設定が含まれています。

## ワークフロー

### CI/CD Pipeline (`ci.yml`)
Pull RequestとmainブランチへのプッシュでトリガーされるCI/CDパイプライン。

#### ジョブ構成

1. **lint-and-type-check** - コード品質チェック
   - TypeScript型チェック
   - ESLintによるコード規約チェック

2. **unit-test** - 単体テスト
   - Jestによる単体テスト実行
   - カバレッジレポート生成
   - Codecovへのアップロード

3. **build** - ビルド検証
   - Next.jsアプリケーションのビルド
   - ビルド成果物の保存

4. **e2e-test** - E2Eテスト
   - Playwrightによる統合テスト
   - テストレポートの生成

5. **deploy** - 自動デプロイ（mainブランチのみ）
   - Vercelへの本番デプロイ

6. **lighthouse** - パフォーマンス測定（mainブランチのみ）
   - Lighthouseによるパフォーマンス分析

## 必要な設定

### リポジトリシークレット
以下のシークレットをGitHubリポジトリに設定してください：

#### 必須
- `VERCEL_TOKEN`: Vercel APIトークン
- `VERCEL_ORG_ID`: Vercel組織ID
- `VERCEL_PROJECT_ID`: VercelプロジェクトID

#### オプション
- `CODECOV_TOKEN`: Codecovアップロード用トークン

### Vercelトークンの取得方法
1. [Vercel Dashboard](https://vercel.com/account/tokens)にアクセス
2. "Create Token"をクリック
3. トークン名を入力して作成
4. GitHubリポジトリのSettings > Secrets and variablesに追加

### ブランチ保護ルール
mainブランチに以下の保護ルールを設定することを推奨：
- Pull Request必須
- ステータスチェック必須
  - lint-and-type-check
  - unit-test
  - build
  - e2e-test
- ブランチを最新に保つ

## ローカルでのテスト実行

```bash
# TypeScript型チェック
npm run type-check

# ESLint
npm run lint

# 単体テスト
npm test

# カバレッジ付きテスト
npm test -- --coverage

# E2Eテスト
npm run test:e2e

# ビルド
npm run build
```

## キャッシュ戦略
以下のキャッシュを使用してビルド時間を短縮：
- Node.js依存関係（node_modules）
- Next.jsビルドキャッシュ（.next/cache）
- Playwrightブラウザ

## トラブルシューティング

### TypeScriptエラー
`type-check`スクリプトが定義されていない場合は、`npx tsc --noEmit`が代替として実行されます。

### E2Eテストの失敗
- バックエンドAPIが起動していることを確認
- `NEXT_PUBLIC_API_URL`環境変数が正しく設定されているか確認

### Vercelデプロイエラー
- Vercelシークレットが正しく設定されているか確認
- Vercelプロジェクトが存在するか確認

## 関連ドキュメント
- [Next.js CI/CD](https://nextjs.org/docs/deployment)
- [Vercel GitHub Integration](https://vercel.com/docs/concepts/git/vercel-for-github)
- [Playwright CI](https://playwright.dev/docs/ci)
- [GitHub Actions](https://docs.github.com/en/actions)