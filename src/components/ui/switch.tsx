import { forwardRef } from 'react';
import { cn } from '@/lib/cn';

export type SwitchProps = React.InputHTMLAttributes<HTMLInputElement>;

export const Switch = forwardRef<HTMLInputElement, SwitchProps>(
  ({ className, disabled, ...props }, ref) => {
    return (
      <label className={cn(
        "relative inline-flex items-center",
        disabled ? "cursor-not-allowed opacity-50" : "cursor-pointer"
      )}>
        <input
          type="checkbox"
          className="sr-only peer"
          ref={ref}
          disabled={disabled}
          {...props}
        />
        <div
          className={cn(
            "w-12 h-7 rounded-full transition-all duration-200",
            "bg-neutral-200 dark:bg-neutral-700",
            "peer-checked:bg-gradient-to-r peer-checked:from-primary-600 peer-checked:to-primary-700",
            "peer-focus-visible:outline-none peer-focus-visible:ring-2 peer-focus-visible:ring-ring peer-focus-visible:ring-offset-2",
            "shadow-inner",
            className
          )}
        >
          <div
            className={cn(
              "absolute top-0.5 left-0.5 h-6 w-6 rounded-full bg-white shadow-sm",
              "transition-transform duration-200 ease-in-out",
              "peer-checked:translate-x-5"
            )}
          />
        </div>
      </label>
    );
  }
);

Switch.displayName = 'Switch';