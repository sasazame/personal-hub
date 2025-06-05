// Mock implementation of next-intl for testing
export const useTranslations = (namespace?: string) => {
  return (key: string) => {
    // Return the key as-is for testing purposes
    // In real implementation, this would return translated strings
    if (namespace) {
      return `${namespace}.${key}`;
    }
    return key;
  };
};

export const useLocale = () => 'ja';

export const NextIntlClientProvider = ({ children }: { children: React.ReactNode }) => {
  return children;
};