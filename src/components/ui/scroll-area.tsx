import { forwardRef } from 'react';
import { cn } from '@/lib/cn';

export type ScrollAreaProps = React.HTMLAttributes<HTMLDivElement>;

export const ScrollArea = forwardRef<HTMLDivElement, ScrollAreaProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "relative overflow-auto",
          className
        )}
        {...props}
      >
        <div className="h-full w-full">
          {children}
        </div>
      </div>
    );
  }
);

ScrollArea.displayName = 'ScrollArea';