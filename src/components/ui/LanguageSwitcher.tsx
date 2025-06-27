'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useLocale } from '@/contexts/LocaleContext';
import { Modal, ModalHeader, ModalTitle, ModalContent } from './Modal';
import { Globe, Check } from 'lucide-react';
import { type Locale, locales } from '@/i18n/config';
import { useTheme } from '@/hooks/useTheme';
import { cn } from '@/lib/cn';

// Locale names will be translated dynamically

const localeFlags: Record<Locale, string> = {
  ja: '🇯🇵',
  en: '🇺🇸',
};

export function LanguageSwitcher() {
  const t = useTranslations();
  const { locale, setLocale } = useLocale();
  const { theme } = useTheme();
  
  const getLocaleName = (localeCode: Locale): string => {
    switch (localeCode) {
      case 'ja':
        return t('language.japanese');
      case 'en':
        return 'English';
      default:
        return localeCode;
    }
  };
  const [isOpen, setIsOpen] = useState(false);

  const handleLocaleChange = (newLocale: Locale) => {
    setLocale(newLocale);
    setIsOpen(false);
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className={cn(
          "flex items-center justify-center w-8 h-8 rounded-full transition-colors",
          theme === 'dark' ? "hover:bg-gray-800" : "hover:bg-gray-100"
        )}
        aria-label={t('common.language')}
        title={t('common.language')}
      >
        <Globe className={cn(
          "h-5 w-5 transition-colors",
          theme === 'dark' 
            ? "text-gray-400 hover:text-gray-100"
            : "text-gray-600 hover:text-gray-900"
        )} />
      </button>

      <Modal
        open={isOpen}
        onClose={() => setIsOpen(false)}
      >
        <ModalHeader onClose={() => setIsOpen(false)}>
          <ModalTitle>{t('common.language')}</ModalTitle>
        </ModalHeader>
        
        <ModalContent>
          <div className="space-y-2">
            {locales.map((loc) => (
              <button
                key={loc}
                onClick={() => handleLocaleChange(loc)}
                className={cn(
                  "flex w-full items-center justify-between rounded-lg px-4 py-3 text-left transition-colors",
                  locale === loc
                    ? "bg-primary/10 text-primary"
                    : theme === 'dark' 
                      ? "hover:bg-gray-800"
                      : "hover:bg-gray-100"
                )}
              >
                <div className="flex items-center space-x-3">
                  <span className="text-xl">{localeFlags[loc]}</span>
                  <span className="font-medium">{getLocaleName(loc)}</span>
                </div>
                {locale === loc && (
                  <Check className="h-5 w-5 text-primary" />
                )}
              </button>
            ))}
          </div>
        </ModalContent>
      </Modal>
    </>
  );
}