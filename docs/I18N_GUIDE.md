# 国際化(i18n)実装ガイド

## 概要
TODOアプリケーションは`next-intl`を使用して日本語と英語をサポートしています。

## 技術仕様
- **ライブラリ**: next-intl v4.1.0
- **対応言語**: 日本語(ja)、英語(en)
- **デフォルト言語**: 日本語
- **言語設定保存**: Cookie (`locale`)

## アーキテクチャ

### ファイル構成
```
src/
├── i18n/
│   ├── config.ts          # 言語設定
│   └── request.ts         # next-intl設定
├── contexts/
│   └── LocaleContext.tsx  # 言語切り替えContext
├── components/ui/
│   └── LanguageSwitcher.tsx # 言語切り替えコンポーネント
└── messages/
    ├── ja.json           # 日本語翻訳
    └── en.json           # 英語翻訳
```

### 設定ファイル
- `next.config.ts`: next-intlプラグインの設定
- `src/app/layout.tsx`: 言語プロバイダーの設定

## 使用方法

### 翻訳の使用
```tsx
import { useTranslations } from 'next-intl';

function MyComponent() {
  const t = useTranslations();
  
  return (
    <div>
      <h1>{t('app.title')}</h1>
      <p>{t('todo.noTodos')}</p>
    </div>
  );
}
```

### 言語切り替え
```tsx
import { useLocale } from '@/contexts/LocaleContext';

function LanguageButton() {
  const { locale, setLocale } = useLocale();
  
  const toggleLanguage = () => {
    setLocale(locale === 'ja' ? 'en' : 'ja');
  };
  
  return (
    <button onClick={toggleLanguage}>
      {locale === 'ja' ? 'English' : '日本語'}
    </button>
  );
}
```

## 翻訳キー構造

### 共通キー (`common`)
```json
{
  "common": {
    "loading": "読み込み中...",
    "save": "保存",
    "cancel": "キャンセル",
    "delete": "削除"
  }
}
```

### 認証関連 (`auth`)
```json
{
  "auth": {
    "login": "ログイン",
    "register": "新規登録",
    "email": "メールアドレス",
    "password": "パスワード"
  }
}
```

### TODO関連 (`todo`)
```json
{
  "todo": {
    "title": "TODO",
    "addTodo": "TODOを追加",
    "noTodos": "TODOがありません",
    "completed": "完了"
  }
}
```

### エラーメッセージ (`errors`)
```json
{
  "errors": {
    "general": "エラーが発生しました",
    "network": "ネットワークエラーが発生しました",
    "validation": "入力内容を確認してください"
  }
}
```

## 新しい翻訳の追加

### 1. 翻訳ファイルの更新
両方のファイルに同じキーを追加：
- `messages/ja.json`
- `messages/en.json`

### 2. 使用例
```tsx
// 新しいキーを追加
{
  "newFeature": {
    "title": "新機能",
    "description": "説明文"
  }
}

// コンポーネントで使用
const t = useTranslations('newFeature');
<h1>{t('title')}</h1>
```

## ベストプラクティス

### 1. キーの命名規則
- 機能別に階層化: `auth.login`, `todo.addTodo`
- 具体的で明確な名前を使用
- 動詞 + 目的語の形式: `addTodo`, `deleteTodo`

### 2. 翻訳の品質
- 自然な表現を使用
- UIコンテキストを考慮
- 一貫したトーン・アンド・マナー

### 3. 開発時の注意点
- 翻訳キーは両言語で必ず定義
- タイポに注意（実行時エラーの原因）
- 長いテキストは適切に改行

## 言語切り替えの動作

### Cookie保存
- 言語設定は`locale` Cookieに保存
- 有効期限: 1年
- パス: `/`（全体で共有）

### 言語変更時の動作
1. `setLocale()`呼び出し
2. Cookieに新しい言語を保存
3. ページリロード（新しい言語で表示）

## トラブルシューティング

### よくある問題

#### 翻訳が表示されない
- 翻訳キーの確認
- 両言語ファイルでキーが定義されているか確認
- タイポチェック

#### 言語切り替えが機能しない
- `LocaleProvider`が正しく設定されているか確認
- Cookieの設定確認
- ブラウザのCookieが有効か確認

#### ビルドエラー
- 翻訳ファイルのJSONシンタックス確認
- next-intl設定の確認

## 今後の拡張

### 新しい言語の追加
1. `src/i18n/config.ts`の`locales`配列に追加
2. 新しい言語ファイル`messages/{locale}.json`作成
3. `LanguageSwitcher.tsx`に言語選択肢追加

### 高度な機能
- 複数形対応（next-intlのICU message format使用）
- 日付・数値のローカライゼーション
- RTL言語サポート

## 関連リンク
- [next-intl公式ドキュメント](https://next-intl-docs.vercel.app/)
- [Next.js国際化](https://nextjs.org/docs/app/building-your-application/routing/internationalization)
- [ICU Message Format](https://unicode-org.github.io/icu/userguide/format_parse/messages/)