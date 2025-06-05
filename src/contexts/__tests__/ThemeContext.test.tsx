import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { ThemeProvider, useTheme } from '../ThemeContext';

// Mock matchMedia
const mockMatchMedia = (matches: boolean) => {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: jest.fn().mockImplementation(query => ({
      matches,
      media: query,
      onchange: null,
      addListener: jest.fn(),
      removeListener: jest.fn(),
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      dispatchEvent: jest.fn(),
    })),
  });
};

// Test component that uses the theme hook
const TestComponent = () => {
  const { theme, toggleTheme, setTheme } = useTheme();
  
  return (
    <div>
      <div data-testid="theme">{theme}</div>
      <button onClick={toggleTheme}>Toggle Theme</button>
      <button onClick={() => setTheme('light')}>Set Light</button>
      <button onClick={() => setTheme('dark')}>Set Dark</button>
    </div>
  );
};

describe('ThemeContext', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();
    jest.clearAllMocks();
    
    // Mock document.documentElement.setAttribute
    jest.spyOn(document.documentElement, 'setAttribute');
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('provides theme context values', () => {
    mockMatchMedia(false);
    
    render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>
    );
    
    expect(screen.getByTestId('theme')).toHaveTextContent('light');
    expect(screen.getByText('Toggle Theme')).toBeInTheDocument();
  });

  it('toggles theme when toggle is called', () => {
    mockMatchMedia(false);
    
    render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>
    );
    
    const toggleButton = screen.getByText('Toggle Theme');
    
    expect(screen.getByTestId('theme')).toHaveTextContent('light');
    
    act(() => {
      fireEvent.click(toggleButton);
    });
    
    expect(screen.getByTestId('theme')).toHaveTextContent('dark');
    
    act(() => {
      fireEvent.click(toggleButton);
    });
    
    expect(screen.getByTestId('theme')).toHaveTextContent('light');
  });

  it('sets specific theme when setTheme is called', () => {
    mockMatchMedia(false);
    
    render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>
    );
    
    const setDarkButton = screen.getByText('Set Dark');
    const setLightButton = screen.getByText('Set Light');
    
    act(() => {
      fireEvent.click(setDarkButton);
    });
    
    expect(screen.getByTestId('theme')).toHaveTextContent('dark');
    
    act(() => {
      fireEvent.click(setLightButton);
    });
    
    expect(screen.getByTestId('theme')).toHaveTextContent('light');
  });

  it('persists theme in localStorage', () => {
    mockMatchMedia(false);
    
    render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>
    );
    
    const toggleButton = screen.getByText('Toggle Theme');
    
    act(() => {
      fireEvent.click(toggleButton);
    });
    
    expect(localStorage.getItem('todo-app-theme')).toBe('dark');
  });

  it('loads theme from localStorage on mount', () => {
    mockMatchMedia(false);
    localStorage.setItem('todo-app-theme', 'dark');
    
    render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>
    );
    
    expect(screen.getByTestId('theme')).toHaveTextContent('dark');
  });

  it('uses system preference when no saved theme', () => {
    mockMatchMedia(true); // prefers dark mode
    
    render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>
    );
    
    expect(screen.getByTestId('theme')).toHaveTextContent('dark');
  });

  it('applies theme to document element', () => {
    mockMatchMedia(false);
    
    render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>
    );
    
    expect(document.documentElement.setAttribute).toHaveBeenCalledWith('data-theme', 'light');
    
    const toggleButton = screen.getByText('Toggle Theme');
    
    act(() => {
      fireEvent.click(toggleButton);
    });
    
    expect(document.documentElement.setAttribute).toHaveBeenCalledWith('data-theme', 'dark');
  });

  it('throws error when used outside provider', () => {
    const consoleError = jest.spyOn(console, 'error').mockImplementation(() => {});
    
    expect(() => {
      render(<TestComponent />);
    }).toThrow('useTheme must be used within a ThemeProvider');
    
    consoleError.mockRestore();
  });
});