import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { ThemeToggle } from '../ThemeToggle';
import { ThemeProvider } from '@/contexts/ThemeContext';

describe('ThemeToggle', () => {
  const renderWithTheme = (ui: React.ReactElement) => {
    return render(
      <ThemeProvider>
        {ui}
      </ThemeProvider>
    );
  };

  it('renders theme toggle button', () => {
    renderWithTheme(<ThemeToggle />);
    const button = screen.getByRole('button', { name: /切り替え: ダークモード/i });
    expect(button).toBeInTheDocument();
  });

  it('toggles theme on click', () => {
    renderWithTheme(<ThemeToggle />);
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
    renderWithTheme(<ThemeToggle />);
    const button = screen.getByRole('button');
    const srText = screen.getByText('ライトモード', { selector: '.sr-only' });
    
    expect(button).toHaveAttribute('aria-label');
    expect(srText).toBeInTheDocument();
  });

  it('shows sun icon in light mode', () => {
    renderWithTheme(<ThemeToggle />);
    const button = screen.getByRole('button');
    const svgs = button.querySelectorAll('svg');
    const sunIcon = svgs[0];
    const moonIcon = svgs[1];
    
    expect(sunIcon).toHaveClass('opacity-100');
    expect(moonIcon).toHaveClass('opacity-0');
  });

  it('shows moon icon in dark mode', () => {
    renderWithTheme(<ThemeToggle />);
    const button = screen.getByRole('button');
    
    fireEvent.click(button);
    
    const svgs = button.querySelectorAll('svg');
    const sunIcon = svgs[0];
    const moonIcon = svgs[1];
    
    expect(sunIcon).toHaveClass('opacity-0');
    expect(moonIcon).toHaveClass('opacity-100');
  });
});