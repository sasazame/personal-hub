import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import ForgotPasswordPage from '../forgot-password/page';

// Mock next-intl
jest.mock('next-intl', () => ({
  useTranslations: () => (key: string, params?: { date?: string }) => {
    const translations: Record<string, string> = {
      'auth.resetPassword': 'Reset Password',
      'auth.resetPasswordDescription': 'Enter your email address and we\'ll send you a link to reset your password',
      'auth.email': 'Email',
      'auth.sendResetLink': 'Send Reset Link',
      'auth.sendingResetLink': 'Sending reset link...',
      'auth.backToLogin': 'Back to Login',
      'auth.resetLinkSent': 'Password reset link sent',
      'auth.resetLinkSentMessage': 'If an account exists with this email, you will receive a password reset link shortly',
    };
    
    if (key === 'legal.terms.lastUpdated' && params?.date) {
      return `Last updated: ${params.date}`;
    }
    
    return translations[key] || key;
  },
}));

// Mock next/link
jest.mock('next/link', () => {
  return function MockLink({ children, href }: { children: React.ReactNode; href: string }) {
    return <a href={href}>{children}</a>;
  };
});

// Mock LanguageSwitcher
jest.mock('@/components/ui/LanguageSwitcher', () => ({
  LanguageSwitcher: () => <div data-testid="language-switcher">Language Switcher</div>,
}));

describe('ForgotPasswordPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders forgot password form', () => {
    render(<ForgotPasswordPage />);
    
    expect(screen.getByText('Reset Password')).toBeInTheDocument();
    expect(screen.getByText('Enter your email address and we\'ll send you a link to reset your password')).toBeInTheDocument();
    expect(screen.getByLabelText('Email')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Send Reset Link' })).toBeInTheDocument();
  });

  it('validates email input', async () => {
    render(<ForgotPasswordPage />);
    
    const emailInput = screen.getByLabelText('Email');
    const submitButton = screen.getByRole('button', { name: 'Send Reset Link' });
    
    // Test with invalid email - form should not submit successfully
    fireEvent.change(emailInput, { target: { value: 'invalid-email' } });
    fireEvent.click(submitButton);
    
    // Wait a bit and ensure we're not in the success state
    await new Promise(resolve => setTimeout(resolve, 100));
    expect(screen.queryByText('Password reset link sent')).not.toBeInTheDocument();
    
    // Test with valid email
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    expect(emailInput).toHaveValue('test@example.com');
  });

  it('shows loading state when submitting', async () => {
    render(<ForgotPasswordPage />);
    
    const emailInput = screen.getByLabelText('Email');
    const submitButton = screen.getByRole('button', { name: 'Send Reset Link' });
    
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(screen.getByText('Sending reset link...')).toBeInTheDocument();
    });
  });

  it('shows success message after submission', async () => {
    render(<ForgotPasswordPage />);
    
    const emailInput = screen.getByLabelText('Email');
    const submitButton = screen.getByRole('button', { name: 'Send Reset Link' });
    
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.click(submitButton);
    
    // Wait for the mock submission to complete (2 seconds)
    await waitFor(() => {
      expect(screen.getByText('Password reset link sent')).toBeInTheDocument();
    }, { timeout: 3000 });
    
    expect(screen.getByText('If an account exists with this email, you will receive a password reset link shortly')).toBeInTheDocument();
  });

  it('shows back to login link', () => {
    render(<ForgotPasswordPage />);
    
    const backLink = screen.getByRole('link', { name: /Back to Login/i });
    expect(backLink).toBeInTheDocument();
    expect(backLink).toHaveAttribute('href', '/login');
  });

  it('includes language switcher', () => {
    render(<ForgotPasswordPage />);
    
    expect(screen.getByTestId('language-switcher')).toBeInTheDocument();
  });

  it('has proper form accessibility', () => {
    render(<ForgotPasswordPage />);
    
    const emailInput = screen.getByLabelText('Email');
    expect(emailInput).toHaveAttribute('type', 'email');
    expect(emailInput).toHaveAttribute('autoComplete', 'email');
    
    const form = emailInput.closest('form');
    expect(form).toBeInTheDocument();
  });
});