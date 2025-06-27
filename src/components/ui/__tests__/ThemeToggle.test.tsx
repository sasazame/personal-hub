import React from 'react';
import { render, screen, fireEvent } from '@/test/test-utils';
import { ThemeToggle } from '../ThemeToggle';

// Mock next-intl
jest.mock('next-intl', () => ({
  useTranslations: () => (key: string, params?: Record<string, string>) => {
    const translations: Record<string, string> = {
      'theme.toggle': '切り替え: {mode}',
      'theme.lightMode': 'ライトモード',
      'theme.darkMode': 'ダークモード'
    };

    let result = translations[key] || key;
    
    if (params) {
      Object.entries(params).forEach(([param, value]) => {
        result = result.replace(`{${param}}`, value);
      });
    }

    return result;
  }
}));

describe('ThemeToggle', () => {

  it('renders theme toggle button', () => {
    render(<ThemeToggle />);
    const button = screen.getByRole('button', { name: /切り替え: ダークモード/i });
    expect(button).toBeInTheDocument();
  });

  it('toggles theme on click', () => {
    render(<ThemeToggle />);
    const button = screen.getByRole('button');
    
    // Initially in light mode
    expect(button).toHaveAttribute('aria-label', '切り替え: ダークモード');
    
    // Click to switch to dark mode
    fireEvent.click(button);
    expect(button).toHaveAttribute('aria-label', '切り替え: ライトモード');
    
    // Click to switch back to light mode
    fireEvent.click(button);
    expect(button).toHaveAttribute('aria-label', '切り替え: ダークモード');
  });

  it('has proper accessibility attributes', () => {
    render(<ThemeToggle />);
    const button = screen.getByRole('button');
    const srText = screen.getByText('ライトモード', { selector: '.sr-only' });
    
    expect(button).toHaveAttribute('aria-label');
    expect(srText).toBeInTheDocument();
  });

  it('shows sun icon in light mode', () => {
    render(<ThemeToggle />);
    const button = screen.getByRole('button');
    const svgs = button.querySelectorAll('svg');
    const sunIcon = svgs[0];
    const moonIcon = svgs[1];
    
    expect(sunIcon).toHaveClass('opacity-100');
    expect(moonIcon).toHaveClass('opacity-0');
  });

  it('shows moon icon in dark mode', () => {
    render(<ThemeToggle />);
    const button = screen.getByRole('button');
    
    fireEvent.click(button);
    
    const svgs = button.querySelectorAll('svg');
    const sunIcon = svgs[0];
    const moonIcon = svgs[1];
    
    expect(sunIcon).toHaveClass('opacity-0');
    expect(moonIcon).toHaveClass('opacity-100');
  });
});