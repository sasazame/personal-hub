# i18n Implementation Details / 国際化実装詳細

## Implementation Summary / 実装概要

This document provides technical details about the internationalization (i18n) implementation in the TODO application.

このドキュメントでは、TODOアプリケーションの国際化（i18n）実装の技術的詳細を説明します。

## Technical Stack / 技術スタック

- **Framework**: Next.js 15 with App Router
- **i18n Library**: next-intl v4.1.0
- **Supported Languages**: Japanese (ja), English (en)
- **Default Language**: Japanese
- **Persistence**: Cookie-based language preference

## Key Components / 主要コンポーネント

### 1. Configuration Files / 設定ファイル

#### `src/i18n/config.ts`
```typescript
export const locales = ['ja', 'en'] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = 'ja';
```

#### `src/i18n/request.ts`
```typescript
import { getRequestConfig } from 'next-intl/server';
import { cookies } from 'next/headers';

export default getRequestConfig(async () => {
  const cookieStore = await cookies();
  const locale = cookieStore.get('locale')?.value || 'ja';

  return {
    locale,
    messages: (await import(`../../messages/${locale}.json`)).default
  };
});
```

### 2. Context Provider / コンテキストプロバイダー

#### `src/contexts/LocaleContext.tsx`
Provides client-side locale management with cookie persistence.

クライアントサイドでロケール管理とCookie永続化を提供。

```typescript
export const LocaleProvider: React.FC<LocaleProviderProps> = ({
  children,
  initialLocale = defaultLocale,
}) => {
  const [locale, setLocaleState] = useState<Locale>(initialLocale);

  const setLocale = (newLocale: Locale) => {
    setLocaleState(newLocale);
    document.cookie = `locale=${newLocale}; path=/; max-age=31536000`;
    window.location.reload();
  };
  // ...
};
```

### 3. Language Switcher / 言語切り替え

#### `src/components/ui/LanguageSwitcher.tsx`
Modal-based language selection with flag icons and current language indication.

フラグアイコンと現在の言語表示を含むモーダルベースの言語選択。

Features / 機能:
- Responsive design (full name on desktop, flag on mobile)
- Modal interface for language selection
- Visual indication of current language
- Smooth transitions and hover effects

## Translation Structure / 翻訳構造

### Namespace Organization / 名前空間の組織

```json
{
  "common": "通用的なUI要素",
  "app": "アプリケーション全体",
  "header": "ヘッダーコンポーネント",
  "auth": "認証関連",
  "todo": "TODO機能",
  "profile": "プロフィール機能",
  "errors": "エラーメッセージ",
  "validation": "バリデーションメッセージ"
}
```

### Key Naming Conventions / キー命名規則

1. **Hierarchical Structure**: `category.item.subitem`
2. **Action-based**: `addTodo`, `deleteTodo`, `updateProfile`
3. **Status-based**: `completed`, `pending`, `inProgress`
4. **UI-based**: `loading`, `save`, `cancel`

## Updated Components / 更新されたコンポーネント

### Core Components / コアコンポーネント

1. **`src/app/layout.tsx`**
   - Added NextIntlClientProvider
   - Added LocaleProvider
   - Dynamic locale detection

2. **`src/components/layout/Header.tsx`**
   - Added LanguageSwitcher
   - Translated UI text
   - Removed email display as requested

3. **`src/app/page.tsx`**
   - Translated all user-facing text
   - Updated success/error messages
   - Modal confirmation dialogs

4. **`src/app/(auth)/login/page.tsx`**
   - Translated form labels and messages
   - Dynamic success messages

### UI Enhancement / UI改善

- Added language switcher in header
- Responsive language indicator (text/flag)
- Consistent translation usage across components
- Proper error message localization

## Server-Side Integration / サーバーサイド統合

### Next.js App Router Integration

```typescript
// next.config.ts
import createNextIntlPlugin from 'next-intl/plugin';
const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts');
export default withNextIntl(nextConfig);
```

### Locale Detection Flow / ロケール検出フロー

1. Server reads `locale` cookie
2. Falls back to default locale ('ja') if not set
3. Loads appropriate message file
4. Renders page with correct translations
5. Client-side hydration preserves locale state

## Performance Considerations / パフォーマンス考慮事項

### Bundle Optimization / バンドル最適化

- Translation files loaded on-demand per locale
- Tree-shaking eliminates unused translations
- Server-side locale detection prevents hydration mismatches

### Caching Strategy / キャッシュ戦略

- Cookie-based persistence (1 year expiry)
- Server-side translation file caching
- Client-side locale state management

## Testing Strategy / テスト戦略

### Areas to Test / テスト対象領域

1. **Translation Coverage**: All UI text properly translated
2. **Language Switching**: Cookie persistence and page reload
3. **Fallback Behavior**: Default locale when cookie missing
4. **Component Integration**: Translation hooks in all components

### Test Scenarios / テストシナリオ

```typescript
// Example test structure
describe('i18n Integration', () => {
  test('displays Japanese by default', () => {});
  test('switches to English when selected', () => {});
  test('persists language preference', () => {});
  test('handles missing translation keys gracefully', () => {});
});
```

## Deployment Considerations / デプロイ考慮事項

### Build Process / ビルドプロセス

- Translation files included in build
- next-intl plugin processes translations at build time
- Static generation supports both locales

### Environment Variables / 環境変数

No additional environment variables required for basic i18n functionality.

基本的なi18n機能に追加の環境変数は不要。

## Future Enhancements / 今後の改善

### Planned Features / 予定機能

1. **URL-based Routing**: `/ja/...` and `/en/...` paths
2. **ICU Message Format**: Complex pluralization and formatting
3. **Additional Languages**: Easy addition of more locales
4. **Admin Interface**: Translation management system

### Technical Improvements / 技術的改善

1. **Lazy Loading**: Load translations only when needed
2. **Validation**: Runtime translation key validation
3. **Automation**: Translation file synchronization tools
4. **Analytics**: Language usage tracking

## Migration Guide / 移行ガイド

### For Developers / 開発者向け

1. Import `useTranslations` hook in components
2. Replace hardcoded strings with translation keys
3. Add new keys to both language files
4. Test language switching functionality

### For Content Managers / コンテンツ管理者向け

1. Update translation files in `messages/` directory
2. Maintain key consistency across languages
3. Test translations in context
4. Follow naming conventions

## Troubleshooting / トラブルシューティング

### Common Issues / よくある問題

1. **Hydration Mismatches**: Ensure server/client locale consistency
2. **Missing Translations**: Check both ja.json and en.json files
3. **Cookie Issues**: Verify cookie settings and browser support
4. **Build Errors**: Validate JSON syntax in translation files

### Debug Tools / デバッグツール

```typescript
// Debug current locale
console.log('Current locale:', useLocale().locale);

// Debug available translations
console.log('Available keys:', Object.keys(translations));
```

This implementation provides a solid foundation for multilingual support while maintaining performance and developer experience.

この実装は、パフォーマンスと開発者体験を維持しながら、多言語サポートの堅実な基盤を提供します。