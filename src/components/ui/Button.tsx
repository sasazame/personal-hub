import { forwardRef, type ReactNode } from 'react';
import { Loader2 } from 'lucide-react';
import { cn, cva } from '@/lib/cn';

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        primary: 'bg-blue-600 text-white shadow-lg hover:bg-blue-700 hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] focus:ring-blue-500',
        secondary: 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100 shadow-md hover:bg-gray-200 dark:hover:bg-gray-700 hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] focus:ring-gray-500',
        ghost: 'text-foreground hover:bg-muted hover:text-foreground hover:shadow-md hover:scale-[1.02] active:scale-[0.98] focus:ring-ring',
        danger: 'bg-red-600 text-white shadow-lg hover:bg-red-700 hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] focus:ring-red-500',
        outline: 'border-2 border-current bg-transparent hover:bg-gray-50 dark:hover:bg-gray-900 hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] focus:ring-current',
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
  gradient?: 'blue' | 'green' | 'purple' | 'indigo' | 'orange';
}

const gradientClasses = {
  blue: 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-lg hover:shadow-xl',
  green: 'bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white shadow-lg hover:shadow-xl',
  purple: 'bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-700 hover:to-violet-700 text-white shadow-lg hover:shadow-xl',
  indigo: 'bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white shadow-lg hover:shadow-xl',
  orange: 'bg-gradient-to-r from-orange-600 to-orange-700 hover:from-orange-700 hover:to-orange-800 text-white shadow-lg hover:shadow-xl',
};

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
    gradient,
    ...props 
  }, ref) => {
    const isDisabled = disabled || loading;

    return (
      <button
        className={cn(
          buttonVariants({ variant, size }), 
          gradient && gradientClasses[gradient],
          className
        )}
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