'use client';

import { forwardRef } from 'react';
import { cn } from '@/lib/cn';
import { useTheme } from '@/hooks/useTheme';

export type SwitchProps = React.InputHTMLAttributes<HTMLInputElement>;

export const Switch = forwardRef<HTMLInputElement, SwitchProps>(
  ({ className, ...props }, ref) => {
    const { theme } = useTheme();
    
    return (
      <label className="relative inline-flex items-center cursor-pointer">
        <input
          type="checkbox"
          className="sr-only peer"
          ref={ref}
          {...props}
        />
        <div
          className={cn(
            "w-11 h-6 peer-focus:outline-none peer-focus:ring-4 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600",
            theme === 'dark'
              ? "bg-gray-700 peer-focus:ring-blue-800 border-gray-600"
              : "bg-gray-200 peer-focus:ring-blue-300",
            className
          )}
        />
      </label>
    );
  }
);

Switch.displayName = 'Switch';