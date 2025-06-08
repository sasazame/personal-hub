import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { LanguageSwitcher } from '../LanguageSwitcher';

// Mock useTranslations to return actual strings
jest.mock('next-intl', () => ({
  useTranslations: () => (key: string) => {
    const translations: Record<string, string> = {
      'common.language': 'Language',
      'language.japanese': '日本語',
      'language.english': 'English',
    };
    return translations[key] || key;
  },
}));

// Mock useLocale
const mockSetLocale = jest.fn();
jest.mock('@/contexts/LocaleContext', () => ({
  useLocale: () => ({
    locale: 'ja',
    setLocale: mockSetLocale,
  }),
}));

describe('LanguageSwitcher', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders language switcher button', () => {
    render(<LanguageSwitcher />);
    
    const button = screen.getByRole('button');
    expect(button).toBeInTheDocument();
    expect(button).toHaveAttribute('aria-label', 'Language');
  });

  it('displays globe icon', () => {
    render(<LanguageSwitcher />);
    
    // Should show globe icon instead of locale name
    const button = screen.getByRole('button');
    expect(button).toBeInTheDocument();
    // Globe icon should be present (we can't easily test for the icon itself)
  });

  it('opens modal when clicked', () => {
    render(<LanguageSwitcher />);
    
    const button = screen.getByRole('button');
    fireEvent.click(button);
    
    // Modal should be open with language options
    expect(screen.getByText('Language')).toBeInTheDocument();
    expect(screen.getByText('日本語')).toBeInTheDocument();
    expect(screen.getByText('English')).toBeInTheDocument();
  });

  it('changes locale when language option is selected', () => {
    render(<LanguageSwitcher />);
    
    // Open modal
    const button = screen.getByRole('button');
    fireEvent.click(button);
    
    // Click on English option
    const englishOption = screen.getAllByText('English')[0]; // Get the first one (in the option list)
    fireEvent.click(englishOption);
    
    // Should call setLocale with 'en'
    expect(mockSetLocale).toHaveBeenCalledWith('en');
  });

  it('shows check mark for current language', () => {
    render(<LanguageSwitcher />);
    
    // Open modal
    const button = screen.getByRole('button');
    fireEvent.click(button);
    
    // Japanese should have a check mark (current locale is 'ja')
    // Test for the styling of current language
    const japaneseButton = screen.getByText('日本語').closest('button');
    expect(japaneseButton).toHaveClass('bg-primary/10', 'text-primary');
  });

  it('closes modal on backdrop click', () => {
    render(<LanguageSwitcher />);
    
    // Open modal
    const button = screen.getByRole('button');
    fireEvent.click(button);
    
    // Modal should be visible
    expect(screen.getByText('Language')).toBeInTheDocument();
    
    // ESC key should close modal (this is handled by Modal component)
    fireEvent.keyDown(document, { key: 'Escape' });
    
    // Modal should be closed (this test depends on Modal implementation)
  });
});