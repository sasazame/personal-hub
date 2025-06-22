import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { FloatingInput } from '../FloatingInput';

// Mock next-intl
jest.mock('next-intl', () => ({
  useTranslations: () => (key: string, params?: any) => {
    if (key === 'input.emailPlaceholder') return 'Please enter your email address';
    if (key === 'input.passwordPlaceholder') return 'Please enter your password';
    if (key === 'input.placeholder') return `Please enter ${params?.field}`;
    return key;
  },
}));

describe('FloatingInput', () => {
  it('renders with label', () => {
    render(<FloatingInput label="Email" />);
    expect(screen.getByLabelText('Email')).toBeInTheDocument();
  });

  it('shows fixed label position', () => {
    render(<FloatingInput label="Email" />);
    const input = screen.getByLabelText('Email');
    const label = screen.getByText('Email');
    
    // Label should be fixed at top
    expect(label).toHaveClass('block', 'text-sm', 'font-medium', 'text-white/90');
    
    fireEvent.focus(input);
    
    // Label position should not change on focus
    expect(label).toHaveClass('block', 'text-sm', 'font-medium', 'text-white/90');
  });

  it('shows correct placeholder text for email type', () => {
    render(<FloatingInput label="Email" type="email" />);
    const input = screen.getByLabelText('Email');
    
    expect(input).toHaveAttribute('placeholder', 'Please enter your email address');
  });

  it('shows correct placeholder text for password type', () => {
    render(<FloatingInput label="Password" type="password" />);
    const input = screen.getByLabelText('Password');
    
    expect(input).toHaveAttribute('placeholder', 'Please enter your password');
  });

  it('shows generic placeholder for other types', () => {
    render(<FloatingInput label="Name" type="text" />);
    const input = screen.getByLabelText('Name');
    
    expect(input).toHaveAttribute('placeholder', 'Please enter Name');
  });

  it('uses custom placeholder key when provided', () => {
    render(<FloatingInput label="Custom Field" placeholderKey="custom.placeholder" />);
    const input = screen.getByLabelText('Custom Field');
    
    expect(input).toHaveAttribute('placeholder', 'custom.placeholder');
  });

  it('shows error message', () => {
    render(<FloatingInput label="Email" error="Invalid email" />);
    expect(screen.getByText('Invalid email')).toBeInTheDocument();
  });

  it('renders with left icon', () => {
    const LeftIcon = () => <span data-testid="left-icon">📧</span>;
    render(<FloatingInput label="Email" leftIcon={<LeftIcon />} />);
    expect(screen.getByTestId('left-icon')).toBeInTheDocument();
  });

  it('renders with right icon', () => {
    const RightIcon = () => <span data-testid="right-icon">👁️</span>;
    render(<FloatingInput label="Password" rightIcon={<RightIcon />} />);
    expect(screen.getByTestId('right-icon')).toBeInTheDocument();
  });

  it('handles disabled state', () => {
    render(<FloatingInput label="Email" disabled />);
    const input = screen.getByLabelText('Email');
    expect(input).toBeDisabled();
  });

  it('calls onChange when input value changes', () => {
    const handleChange = jest.fn();
    render(<FloatingInput label="Email" onChange={handleChange} />);
    const input = screen.getByLabelText('Email');
    
    fireEvent.change(input, { target: { value: 'test@example.com' } });
    
    expect(handleChange).toHaveBeenCalled();
  });

  it('applies error styles when error is present', () => {
    render(<FloatingInput label="Email" error="Invalid email" />);
    const input = screen.getByLabelText('Email');
    
    expect(input).toHaveClass('border-red-500/50');
  });
});