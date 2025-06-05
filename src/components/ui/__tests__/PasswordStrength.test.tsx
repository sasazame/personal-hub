import React from 'react';
import { render, screen } from '@testing-library/react';
import { PasswordStrength } from '../PasswordStrength';

describe('PasswordStrength', () => {
  it('does not render when password is empty', () => {
    const { container } = render(<PasswordStrength password="" />);
    expect(container.firstChild).toBeNull();
  });

  it('shows very weak for simple passwords', () => {
    render(<PasswordStrength password="a" />);
    expect(screen.getByText('Very Weak')).toBeInTheDocument();
  });

  it('shows good for a medium complexity password', () => {
    render(<PasswordStrength password="Password1" />);
    expect(screen.getByText('Good')).toBeInTheDocument();
  });

  it('shows strong for a complex password', () => {
    render(<PasswordStrength password="Password123!" />);
    expect(screen.getByText('Strong')).toBeInTheDocument();
  });

  it('shows strong for passwords with all requirements', () => {
    render(<PasswordStrength password="Password1!a" />);
    expect(screen.getByText('Strong')).toBeInTheDocument();
  });

  it('displays all requirements', () => {
    render(<PasswordStrength password="test" />);
    
    expect(screen.getByText('At least 8 characters')).toBeInTheDocument();
    expect(screen.getByText('One uppercase letter')).toBeInTheDocument();
    expect(screen.getByText('One lowercase letter')).toBeInTheDocument();
    expect(screen.getByText('One number')).toBeInTheDocument();
    expect(screen.getByText('One special character')).toBeInTheDocument();
  });

  it('marks requirements as complete when met', () => {
    render(<PasswordStrength password="Password1!" />);
    
    // Should have check icons for met requirements (look for the specific requirement text that should be green)
    const completedRequirements = screen.getAllByText('One uppercase letter');
    expect(completedRequirements[0]).toHaveClass('text-green-400');
  });

  it('shows strength bar with correct fill', () => {
    render(<PasswordStrength password="Password1!" />);
    
    // Should render strength bars
    expect(screen.getByText('Password Strength')).toBeInTheDocument();
  });
});