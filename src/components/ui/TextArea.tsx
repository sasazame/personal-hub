import { forwardRef } from 'react';
import { AlertCircle } from 'lucide-react';
import { cn } from '@/lib/cn';

export interface TextAreaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
  error?: string;
  helperText?: string;
  resize?: 'none' | 'vertical' | 'horizontal' | 'both';
}

export const TextArea = forwardRef<HTMLTextAreaElement, TextAreaProps>(
  ({ 
    className, 
    label,
    error,
    helperText,
    resize = 'vertical',
    disabled,
    rows = 3,
    ...props 
  }, ref) => {
    const hasError = Boolean(error);

    const textareaClasses = cn(
      'w-full min-h-[80px] px-3 py-2 border border-input bg-background text-foreground rounded-md',
      'focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent',
      'disabled:cursor-not-allowed disabled:opacity-50',
      'placeholder:text-muted-foreground',
      'transition-all duration-200',
      // Resize options
      {
        'resize-none': resize === 'none',
        'resize-y': resize === 'vertical',
        'resize-x': resize === 'horizontal',
        'resize': resize === 'both',
      },
      // Error state
      hasError && 'border-destructive focus:ring-destructive',
      className
    );

    const labelClasses = cn(
      'block text-sm font-medium mb-1 text-foreground transition-colors',
      hasError && 'text-destructive',
      disabled && 'opacity-50'
    );

    return (
      <div className="space-y-1">
        <label className={labelClasses} htmlFor={props.id || `textarea-${label.toLowerCase().replace(/\s+/g, '-')}`}>
          {label}
          {props.required && <span className="text-destructive ml-1">*</span>}
        </label>

        <div className="relative">
          <textarea
            className={textareaClasses}
            ref={ref}
            disabled={disabled}
            rows={rows}
            id={props.id || `textarea-${label.toLowerCase().replace(/\s+/g, '-')}`}
            {...props}
          />
          
          {hasError && (
            <div className="absolute right-3 top-3">
              <AlertCircle className="h-4 w-4 text-destructive" />
            </div>
          )}
        </div>

        {(error || helperText) && (
          <div className="text-sm">
            {error ? (
              <p className="text-destructive flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                {error}
              </p>
            ) : (
              <p className="text-muted-foreground">{helperText}</p>
            )}
          </div>
        )}
      </div>
    );
  }
);

TextArea.displayName = 'TextArea';