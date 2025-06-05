import { forwardRef, type ReactNode } from 'react';
import { Loader2 } from 'lucide-react';
import { cn, cva } from '@/lib/cn';

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        primary: 'bg-blue-600 text-white shadow-md hover:bg-blue-700 hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] focus:ring-blue-500 border border-blue-700',
        secondary: 'bg-gray-600 text-white shadow-md hover:bg-gray-700 hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] focus:ring-gray-500 border border-gray-700',
        ghost: 'text-foreground hover:bg-muted hover:text-foreground hover:shadow-sm hover:scale-[1.02] active:scale-[0.98] focus:ring-ring border border-transparent hover:border-border',
        danger: 'bg-red-600 text-white shadow-md hover:bg-red-700 hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] focus:ring-red-500 border border-red-700',
        outline: 'border-2 border-blue-600 bg-white text-blue-600 hover:bg-blue-600 hover:text-white hover:shadow-md hover:scale-[1.02] active:scale-[0.98] focus:ring-blue-500',
      },
      size: {
        sm: 'h-8 px-3 text-sm',
        md: 'h-10 px-4 text-sm',
        lg: 'h-12 px-6 text-base',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
    },
  }
);

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  children?: ReactNode;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ 
    className, 
    variant, 
    size, 
    loading = false, 
    leftIcon, 
    rightIcon, 
    children, 
    disabled,
    ...props 
  }, ref) => {
    const isDisabled = disabled || loading;

    return (
      <button
        className={cn(buttonVariants({ variant, size }), className)}
        ref={ref}
        disabled={isDisabled}
        {...props}
      >
        {loading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          leftIcon && <span className="shrink-0">{leftIcon}</span>
        )}
        {children}
        {!loading && rightIcon && <span className="shrink-0">{rightIcon}</span>}
      </button>
    );
  }
);

Button.displayName = 'Button';