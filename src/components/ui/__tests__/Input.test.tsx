import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Input } from '../Input';
import { Search, Mail } from 'lucide-react';

describe('Input', () => {
  it('renders with basic props', () => {
    render(<Input label="Email" placeholder="Enter email" />);
    
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/enter email/i)).toBeInTheDocument();
  });

  it('shows required indicator when required', () => {
    render(<Input label="Required Field" required />);
    
    expect(screen.getByText('*')).toBeInTheDocument();
    expect(screen.getByText('*')).toHaveClass('text-destructive');
  });

  it('displays error state correctly', () => {
    render(<Input label="Email" error="Invalid email format" />);
    
    const input = screen.getByLabelText(/email/i);
    expect(input).toHaveClass('border-destructive');
    
    expect(screen.getByText('Invalid email format')).toBeInTheDocument();
    expect(screen.getByText('Invalid email format')).toHaveClass('text-destructive');
  });

  it('displays helper text when provided', () => {
    render(<Input label="Password" helperText="At least 8 characters" />);
    
    expect(screen.getByText('At least 8 characters')).toBeInTheDocument();
    expect(screen.getByText('At least 8 characters')).toHaveClass('text-muted-foreground');
  });

  it('prioritizes error over helper text', () => {
    render(
      <Input 
        label="Password" 
        error="Password too short"
        helperText="At least 8 characters" 
      />
    );
    
    expect(screen.getByText('Password too short')).toBeInTheDocument();
    expect(screen.queryByText('At least 8 characters')).not.toBeInTheDocument();
  });

  it('handles password type with toggle', async () => {
    const user = userEvent.setup();
    render(<Input label="Password" type="password" />);
    
    const input = screen.getByLabelText(/password/i);
    expect(input).toHaveAttribute('type', 'password');
    
    // Find and click the password toggle button
    const toggleButton = screen.getByRole('button');
    await user.click(toggleButton);
    
    expect(input).toHaveAttribute('type', 'text');
    
    await user.click(toggleButton);
    expect(input).toHaveAttribute('type', 'password');
  });

  it('renders with left and right icons', () => {
    render(
      <Input 
        label="Search"
        leftIcon={<Search data-testid="search-icon" />}
        rightIcon={<Mail data-testid="mail-icon" />}
      />
    );
    
    expect(screen.getByTestId('search-icon')).toBeInTheDocument();
    expect(screen.getByTestId('mail-icon')).toBeInTheDocument();
  });

  it('handles floating label variant', async () => {
    const user = userEvent.setup();
    render(<Input label="Floating Label" variant="floating" />);
    
    const input = screen.getByLabelText(/floating label/i);
    const label = screen.getByText('Floating Label');
    
    // Initially, label should be in placeholder position
    expect(label).toHaveClass('top-1/2', '-translate-y-1/2');
    
    // When focused, label should move up
    await user.click(input);
    expect(label).toHaveClass('top-2', 'translate-y-0', 'text-xs');
    
    // When typing, label should stay up
    await user.type(input, 'test');
    expect(label).toHaveClass('top-2', 'translate-y-0', 'text-xs');
    
    // When blurred with value, label should stay up
    await user.tab();
    expect(label).toHaveClass('top-2', 'translate-y-0', 'text-xs');
  });

  it('handles disabled state', () => {
    render(<Input label="Disabled" disabled />);
    
    const input = screen.getByLabelText(/disabled/i);
    expect(input).toBeDisabled();
    expect(input).toHaveClass('disabled:cursor-not-allowed', 'disabled:opacity-50');
  });

  it('handles focus and blur events', async () => {
    const user = userEvent.setup();
    const onFocus = jest.fn();
    const onBlur = jest.fn();
    
    render(<Input label="Test" onFocus={onFocus} onBlur={onBlur} />);
    
    const input = screen.getByLabelText(/test/i);
    
    await user.click(input);
    expect(onFocus).toHaveBeenCalledTimes(1);
    
    await user.tab();
    expect(onBlur).toHaveBeenCalledTimes(1);
  });

  it('handles change events', async () => {
    const user = userEvent.setup();
    const onChange = jest.fn();
    
    render(<Input label="Test" onChange={onChange} />);
    
    const input = screen.getByLabelText(/test/i);
    await user.type(input, 'hello');
    
    expect(onChange).toHaveBeenCalledTimes(5); // Called for each character
  });

  it('forwards ref correctly', () => {
    const ref = jest.fn();
    render(<Input label="Ref test" ref={ref} />);
    
    expect(ref).toHaveBeenCalledWith(expect.any(HTMLInputElement));
  });

  it('applies custom className', () => {
    render(<Input label="Custom" className="custom-class" />);
    
    const input = screen.getByLabelText(/custom/i);
    expect(input).toHaveClass('custom-class');
  });

  it('adjusts padding for icons', () => {
    const { rerender } = render(
      <Input label="With Left Icon" leftIcon={<Search />} />
    );
    
    const input = screen.getByLabelText(/with left icon/i);
    expect(input).toHaveClass('pl-10');

    rerender(
      <Input label="With Right Icon" rightIcon={<Mail />} />
    );
    
    const inputWithRightIcon = screen.getByLabelText(/with right icon/i);
    expect(inputWithRightIcon).toHaveClass('pr-10');
  });

  it('shows error icon when in error state', () => {
    render(<Input label="Error" error="Something went wrong" />);
    
    // Error icon should be present (AlertCircle from lucide-react)
    const container = screen.getByRole('textbox').closest('.space-y-1');
    const errorIcon = container?.querySelector('.lucide-circle-alert');
    expect(errorIcon).toBeInTheDocument();
  });
});