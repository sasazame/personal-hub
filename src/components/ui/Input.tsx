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
      'w-full border transition-all duration-200 font-normal',
      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
      'disabled:cursor-not-allowed disabled:opacity-50',
      // Default variant
      variant === 'default' && [
        'h-11 px-3.5 py-2.5 rounded-lg',
        'bg-input border-input-border',
        'hover:border-border-strong',
        'focus:border-primary focus:bg-background',
        leftIcon && 'pl-11',
        (rightIcon || isPassword) && 'pr-11',
      ],
      // Floating variant
      variant === 'floating' && [
        'h-14 px-4 pt-6 pb-2 rounded-xl',
        'bg-white/50 dark:bg-card/50 backdrop-blur-sm',
        'border-white/20 dark:border-white/10',
        'hover:bg-white/60 dark:hover:bg-card/60',
        'focus:bg-white/80 dark:focus:bg-card/80',
        leftIcon && 'pl-12',
        (rightIcon || isPassword) && 'pr-12',
      ],
      // Error state
      hasError && 'border-destructive bg-red-50/50 dark:bg-red-900/10 focus:border-destructive',
      className
    );

    const labelClasses = cn(
      'transition-all duration-200 pointer-events-none',
      // Default variant
      variant === 'default' && 'block mb-2 text-sm font-medium text-foreground',
      // Floating variant
      variant === 'floating' && [
        'absolute left-4 top-1/2 -translate-y-1/2 text-sm text-muted-foreground',
        leftIcon && 'left-12',
        isFloatingActive && 'top-2.5 translate-y-0 text-xs font-medium text-primary',
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
                  className="text-muted-foreground hover:text-foreground transition-all duration-200 focus-visible:outline-none focus-visible:text-primary p-1 rounded hover:bg-neutral-100 dark:hover:bg-neutral-800"
                  disabled={disabled}
                  tabIndex={-1}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
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
          <div className="text-sm mt-1.5 animate-slide-in-top">
            {error ? (
              <p className="text-destructive flex items-center gap-1.5 font-medium">
                <AlertCircle className="h-3.5 w-3.5 flex-shrink-0" />
                {error}
              </p>
            ) : (
              <p className="text-muted-foreground pl-5">{helperText}</p>
            )}
          </div>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';