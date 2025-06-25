import { forwardRef, type ReactNode } from 'react';
import { Loader2 } from 'lucide-react';
import { cn, cva } from '@/lib/cn';

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 font-medium transition-all duration-200 disabled:pointer-events-none disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
  {
    variants: {
      variant: {
        primary: 'bg-gradient-to-b from-primary-600 to-primary-700 text-white shadow-sm hover:shadow-md hover:-translate-y-[1px] active:translate-y-0 active:shadow-sm',
        secondary: 'bg-white dark:bg-card text-foreground shadow-sm hover:shadow-md hover:-translate-y-[1px] active:translate-y-0 active:shadow-sm border border-border',
        ghost: 'text-foreground hover:bg-neutral-100 dark:hover:bg-neutral-800 hover:text-foreground active:scale-[0.98]',
        danger: 'bg-gradient-to-b from-red-600 to-red-700 text-white shadow-sm hover:shadow-md hover:-translate-y-[1px] active:translate-y-0 active:shadow-sm',
        outline: 'border-[1.5px] border-primary-600 bg-transparent text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-950/20 hover:border-primary-700 active:scale-[0.98]',
        accent: 'bg-gradient-to-b from-accent-600 to-accent-700 text-white shadow-sm hover:shadow-md hover:-translate-y-[1px] active:translate-y-0 active:shadow-sm',
      },
      size: {
        sm: 'h-8 px-3 text-sm rounded-md',
        md: 'h-10 px-5 text-sm rounded-lg',
        lg: 'h-12 px-6 text-base rounded-lg',
        xl: 'h-14 px-8 text-lg rounded-xl',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
    },
  }
);

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'outline' | 'accent';
  size?: 'sm' | 'md' | 'lg' | 'xl';
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