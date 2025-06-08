// Mock implementation of next-intl for testing
export const useTranslations = (namespace?: string) => {
  return (key: string, params?: Record<string, string>) => {
    // Mock translations for specific keys used in tests
    const translations: Record<string, string> = {
      'theme.toggle': '切り替え: {mode}',
      'theme.lightMode': 'ライトモード',
      'theme.darkMode': 'ダークモード',
      'common.save': '保存',
      'common.cancel': 'キャンセル',
      'notes.creating': '保存中...',
      'notes.newTagPlaceholder': 'タグを追加'
    };

    let result = translations[key] || key;
    
    // Handle parameter substitution
    if (params) {
      Object.entries(params).forEach(([param, value]) => {
        result = result.replace(`{${param}}`, value);
      });
    }

    if (namespace && !translations[key]) {
      return `${namespace}.${key}`;
    }
    return result;
  };
};

export const useLocale = () => 'ja';

export const NextIntlClientProvider = ({ children }: { children: React.ReactNode }) => {
  return children;
};