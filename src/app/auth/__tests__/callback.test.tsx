import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { useRouter, useSearchParams } from 'next/navigation';
import OAuthCallbackPage from '../callback/page';
import { useAuth } from '@/contexts/AuthContext';

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
  useSearchParams: jest.fn(),
}));

// Mock next-intl
jest.mock('next-intl', () => ({
  useTranslations: () => (key: string) => {
    const translations: Record<string, string> = {
      'auth.processingCallback': 'Processing authentication...',
      'auth.authenticationSuccess': 'Authentication successful',
      'auth.authenticationError': 'Authentication failed',
      'auth.backToLogin': 'Back to Login',
    };
    return translations[key] || key;
  },
}));

// Mock AuthContext
jest.mock('@/contexts/AuthContext', () => ({
  useAuth: jest.fn(),
}));

// Mock LanguageSwitcher
jest.mock('@/components/ui/LanguageSwitcher', () => ({
  LanguageSwitcher: () => <div data-testid="language-switcher">Language Switcher</div>,
}));

// Mock next/link
jest.mock('next/link', () => {
  return function MockLink({ children, href }: { children: React.ReactNode; href: string }) {
    return <a href={href}>{children}</a>;
  };
});

const mockPush = jest.fn();
const mockHandleOAuthCallback = jest.fn();

describe('OAuthCallbackPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    (useRouter as jest.Mock).mockReturnValue({
      push: mockPush,
    });

    (useAuth as jest.Mock).mockReturnValue({
      handleOAuthCallback: mockHandleOAuthCallback,
    });
  });

  it('renders processing state initially', async () => {
    (useSearchParams as jest.Mock).mockReturnValue({
      get: jest.fn((param: string) => {
        if (param === 'code') return 'test-code';
        if (param === 'state') return 'test-state';
        return null;
      }),
    });

    mockHandleOAuthCallback.mockResolvedValueOnce({
      accessToken: 'test-token',
      user: { id: '1', email: 'test@example.com' }
    });

    render(<OAuthCallbackPage />);

    // The component shows the raw translation key since our mock returns it unchanged
    expect(screen.getByText('Processing authentication...')).toBeInTheDocument();
  });

  it('handles successful OAuth callback', async () => {
    const mockSearchParams = {
      get: jest.fn((param: string) => {
        switch (param) {
          case 'code': return 'test-auth-code';
          case 'state': return 'test-state';
          case 'error': return null;
          case 'error_description': return null;
          default: return null;
        }
      }),
    };

    (useSearchParams as jest.Mock).mockReturnValue(mockSearchParams);
    mockHandleOAuthCallback.mockResolvedValueOnce({ success: true });

    render(<OAuthCallbackPage />);

    await waitFor(() => {
      expect(screen.getByText('Authentication successful')).toBeInTheDocument();
    });

    expect(mockHandleOAuthCallback).toHaveBeenCalledWith(
      'test-auth-code',
      'test-state',
      undefined,
      undefined
    );

    // Should redirect after delay
    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/dashboard');
    }, { timeout: 3000 });
  });

  it('handles OAuth callback error', async () => {
    const mockSearchParams = {
      get: jest.fn((param: string) => {
        switch (param) {
          case 'code': return 'test-auth-code';
          case 'state': return 'test-state';
          case 'error': return null;
          case 'error_description': return null;
          default: return null;
        }
      }),
    };

    (useSearchParams as jest.Mock).mockReturnValue(mockSearchParams);
    mockHandleOAuthCallback.mockResolvedValueOnce({ 
      success: false, 
      error: 'Authentication failed' 
    });

    render(<OAuthCallbackPage />);

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: 'Authentication failed' })).toBeInTheDocument();
      expect(screen.getAllByText('Authentication failed')).toHaveLength(2); // Title and error message
    });

    expect(screen.getByRole('link', { name: /Back to Login/ })).toBeInTheDocument();
  });

  it('handles missing parameters', async () => {
    const mockSearchParams = {
      get: jest.fn(() => null), // No parameters
    };

    (useSearchParams as jest.Mock).mockReturnValue(mockSearchParams);

    render(<OAuthCallbackPage />);

    await waitFor(() => {
      expect(screen.getByText('Authentication failed')).toBeInTheDocument();
      expect(screen.getByText('Missing authorization parameters')).toBeInTheDocument();
    });

    expect(mockHandleOAuthCallback).not.toHaveBeenCalled();
  });

  it('includes language switcher', () => {
    (useSearchParams as jest.Mock).mockReturnValue({
      get: jest.fn().mockReturnValue('test-value'),
    });

    render(<OAuthCallbackPage />);

    expect(screen.getByTestId('language-switcher')).toBeInTheDocument();
  });

  it('has proper accessibility structure', () => {
    (useSearchParams as jest.Mock).mockReturnValue({
      get: jest.fn().mockReturnValue('test-value'),
    });

    render(<OAuthCallbackPage />);

    const mainHeading = screen.getByRole('heading', { level: 1 });
    expect(mainHeading).toBeInTheDocument();
  });
});