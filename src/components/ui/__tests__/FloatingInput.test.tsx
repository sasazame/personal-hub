import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { FloatingInput } from '../FloatingInput';

describe('FloatingInput', () => {
  it('renders with label', () => {
    render(<FloatingInput label="Email" />);
    expect(screen.getByLabelText('Email')).toBeInTheDocument();
  });

  it('floats label when focused', () => {
    render(<FloatingInput label="Email" />);
    const input = screen.getByLabelText('Email');
    const label = screen.getByText('Email');
    
    fireEvent.focus(input);
    
    expect(label).toHaveClass('top-2', 'text-xs');
  });

  it('floats label when has value', () => {
    render(<FloatingInput label="Email" value="test@example.com" onChange={() => {}} />);
    const label = screen.getByText('Email');
    
    expect(label).toHaveClass('top-2', 'text-xs');
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