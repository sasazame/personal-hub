import { forwardRef, useState, type ReactNode } from 'react';
import { AlertCircle, Eye, EyeOff } from 'lucide-react';
import { cn } from '@/lib/cn';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  helperText?: string;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  variant?: 'default' | 'floating';
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ 
    className, 
    type = 'text',
    label,
    error,
    helperText,
    leftIcon,
    rightIcon,
    variant = 'default',
    disabled,
    placeholder,
    ...props 
  }, ref) => {
    const [showPassword, setShowPassword] = useState(false);
    const [isFocused, setIsFocused] = useState(false);
    const [hasValue, setHasValue] = useState(Boolean(props.value || props.defaultValue));

    const isPassword = type === 'password';
    const inputType = isPassword && showPassword ? 'text' : type;
    const hasError = Boolean(error);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setHasValue(Boolean(e.target.value));
      props.onChange?.(e);
    };

    const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
      setIsFocused(true);
      props.onFocus?.(e);
    };

    const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
      setIsFocused(false);
      props.onBlur?.(e);
    };

    const isFloatingActive = variant === 'floating' && (isFocused || hasValue);

    const inputClasses = cn(
      'w-full border border-input bg-background text-foreground transition-all duration-200',
      'focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent',
      'disabled:cursor-not-allowed disabled:opacity-50',
      // Default variant
      variant === 'default' && [
        'h-10 px-3 py-2 rounded-md',
        leftIcon && 'pl-10',
        (rightIcon || isPassword) && 'pr-10',
      ],
      // Floating variant
      variant === 'floating' && [
        'h-14 px-4 pt-6 pb-2 rounded-lg',
        leftIcon && 'pl-12',
        (rightIcon || isPassword) && 'pr-12',
      ],
      // Error state
      hasError && 'border-destructive focus:ring-destructive',
      className
    );

    const labelClasses = cn(
      'text-sm font-medium transition-all duration-200 pointer-events-none',
      // Default variant
      variant === 'default' && 'block mb-1 text-foreground',
      // Floating variant
      variant === 'floating' && [
        'absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground',
        leftIcon && 'left-12',
        isFloatingActive && 'top-2 translate-y-0 text-xs text-foreground',
      ],
      // Error state
      hasError && variant === 'default' && 'text-destructive',
      disabled && 'opacity-50'
    );

    const containerClasses = cn(
      'relative',
      variant === 'floating' && 'relative'
    );

    return (
      <div className="space-y-1">
        <div className={containerClasses}>
          {variant === 'default' && (
            <label className={labelClasses} htmlFor={props.id || `input-${label.toLowerCase().replace(/\s+/g, '-')}`}>
              {label}
              {props.required && <span className="text-destructive ml-1">*</span>}
            </label>
          )}
          
          {variant === 'floating' && (
            <label className={labelClasses} htmlFor={props.id || `input-${label.toLowerCase().replace(/\s+/g, '-')}`}>
              {label}
              {props.required && <span className="text-destructive ml-1">*</span>}
            </label>
          )}

          {leftIcon && (
            <div className={cn(
              'absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground',
              variant === 'floating' && 'left-4',
              disabled && 'opacity-50'
            )}>
              {leftIcon}
            </div>
          )}

          <input
            type={inputType}
            className={inputClasses}
            placeholder={variant === 'floating' ? undefined : placeholder}
            ref={ref}
            disabled={disabled}
            id={props.id || `input-${label.toLowerCase().replace(/\s+/g, '-')}`}
            onChange={handleChange}
            onFocus={handleFocus}
            onBlur={handleBlur}
            {...props}
          />

          {(rightIcon || isPassword || hasError) && (
            <div className={cn(
              'absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1',
              variant === 'floating' && 'right-4'
            )}>
              {hasError && (
                <AlertCircle className="h-4 w-4 text-destructive" />
              )}
              {isPassword && (
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-muted-foreground hover:text-foreground transition-colors focus:outline-none focus:text-foreground"
                  disabled={disabled}
                  tabIndex={-1}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              )}
              {rightIcon && !hasError && (
                <span className="text-muted-foreground">{rightIcon}</span>
              )}
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

Input.displayName = 'Input';