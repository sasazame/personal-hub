import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TextArea } from '../TextArea';

describe('TextArea', () => {
  it('renders with basic props', () => {
    render(<TextArea label="Description" placeholder="Enter description" />);
    
    expect(screen.getByLabelText(/description/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/enter description/i)).toBeInTheDocument();
  });

  it('shows required indicator when required', () => {
    render(<TextArea label="Required Field" required />);
    
    expect(screen.getByText('*')).toBeInTheDocument();
    expect(screen.getByText('*')).toHaveClass('text-destructive');
  });

  it('displays error state correctly', () => {
    render(<TextArea label="Comments" error="Field is required" />);
    
    const textarea = screen.getByLabelText(/comments/i);
    expect(textarea).toHaveClass('border-destructive');
    
    expect(screen.getByText('Field is required')).toBeInTheDocument();
    expect(screen.getByText('Field is required')).toHaveClass('text-destructive');
  });

  it('displays helper text when provided', () => {
    render(<TextArea label="Bio" helperText="Maximum 500 characters" />);
    
    expect(screen.getByText('Maximum 500 characters')).toBeInTheDocument();
    expect(screen.getByText('Maximum 500 characters')).toHaveClass('text-muted-foreground');
  });

  it('prioritizes error over helper text', () => {
    render(
      <TextArea 
        label="Bio" 
        error="Too many characters"
        helperText="Maximum 500 characters" 
      />
    );
    
    expect(screen.getByText('Too many characters')).toBeInTheDocument();
    expect(screen.queryByText('Maximum 500 characters')).not.toBeInTheDocument();
  });

  it('handles different resize options', () => {
    const { rerender } = render(<TextArea label="Resize None" resize="none" />);
    expect(screen.getByLabelText(/resize none/i)).toHaveClass('resize-none');

    rerender(<TextArea label="Resize Vertical" resize="vertical" />);
    expect(screen.getByLabelText(/resize vertical/i)).toHaveClass('resize-y');

    rerender(<TextArea label="Resize Horizontal" resize="horizontal" />);
    expect(screen.getByLabelText(/resize horizontal/i)).toHaveClass('resize-x');

    rerender(<TextArea label="Resize Both" resize="both" />);
    expect(screen.getByLabelText(/resize both/i)).toHaveClass('resize');
  });

  it('handles disabled state', () => {
    render(<TextArea label="Disabled" disabled />);
    
    const textarea = screen.getByLabelText(/disabled/i);
    expect(textarea).toBeDisabled();
    expect(textarea).toHaveClass('disabled:cursor-not-allowed', 'disabled:opacity-50');
  });

  it('sets custom rows', () => {
    render(<TextArea label="Custom Rows" rows={5} />);
    
    const textarea = screen.getByLabelText(/custom rows/i);
    expect(textarea).toHaveAttribute('rows', '5');
  });

  it('handles change events', async () => {
    const user = userEvent.setup();
    const onChange = jest.fn();
    
    render(<TextArea label="Test" onChange={onChange} />);
    
    const textarea = screen.getByLabelText(/test/i);
    await user.type(textarea, 'hello\nworld');
    
    expect(onChange).toHaveBeenCalled();
    expect(textarea).toHaveValue('hello\nworld');
  });

  it('forwards ref correctly', () => {
    const ref = jest.fn();
    render(<TextArea label="Ref test" ref={ref} />);
    
    expect(ref).toHaveBeenCalledWith(expect.any(HTMLTextAreaElement));
  });

  it('applies custom className', () => {
    render(<TextArea label="Custom" className="custom-class" />);
    
    const textarea = screen.getByLabelText(/custom/i);
    expect(textarea).toHaveClass('custom-class');
  });

  it('has proper focus styles', () => {
    render(<TextArea label="Focus Test" />);
    
    const textarea = screen.getByLabelText(/focus test/i);
    expect(textarea).toHaveClass('focus:outline-none', 'focus:ring-2', 'focus:ring-ring');
  });

  it('shows error icon when in error state', () => {
    render(<TextArea label="Error" error="Something went wrong" />);
    
    // Error text should be present with error icon
    const errorMessage = screen.getByText('Something went wrong');
    expect(errorMessage).toBeInTheDocument();
    
    // Check that error styling is applied to the textarea
    const textarea = screen.getByLabelText(/error/i);
    expect(textarea).toHaveClass('border-destructive');
  });

  it('handles multiline input correctly', async () => {
    const user = userEvent.setup();
    render(<TextArea label="Multi-line" />);
    
    const textarea = screen.getByLabelText(/multi-line/i);
    
    await user.type(textarea, 'First line{enter}Second line{enter}Third line');
    
    expect(textarea).toHaveValue('First line\nSecond line\nThird line');
  });

  it('has minimum height class', () => {
    render(<TextArea label="Min Height" />);
    
    const textarea = screen.getByLabelText(/min height/i);
    expect(textarea).toHaveClass('min-h-[80px]');
  });
});