import React, { forwardRef, createContext, useContext } from 'react';
import { cn } from '@/lib/cn';

export interface RadioGroupProps extends React.HTMLAttributes<HTMLDivElement> {
  value?: string;
  onValueChange?: (value: string) => void;
  defaultValue?: string;
  disabled?: boolean;
}

export interface RadioGroupItemProps extends React.InputHTMLAttributes<HTMLInputElement> {
  value: string;
}

const RadioGroupContext = createContext<{
  value?: string;
  onValueChange?: (value: string) => void;
  disabled?: boolean;
}>({});

export const RadioGroup = forwardRef<HTMLDivElement, RadioGroupProps>(
  ({ className, value, onValueChange, defaultValue, disabled, children, ...props }, ref) => {
    const [internalValue, setInternalValue] = React.useState(defaultValue);
    
    const actualValue = value !== undefined ? value : internalValue;
    
    const handleValueChange = (newValue: string) => {
      if (value === undefined) {
        setInternalValue(newValue);
      }
      onValueChange?.(newValue);
    };

    return (
      <RadioGroupContext.Provider value={{ value: actualValue, onValueChange: handleValueChange, disabled }}>
        <div
          ref={ref}
          role="radiogroup"
          className={cn("grid gap-2", className)}
          {...props}
        >
          {children}
        </div>
      </RadioGroupContext.Provider>
    );
  }
);

RadioGroup.displayName = 'RadioGroup';

export const RadioGroupItem = forwardRef<HTMLInputElement, RadioGroupItemProps>(
  ({ className, value, disabled, ...props }, ref) => {
    const context = useContext(RadioGroupContext);
    const isChecked = context.value === value;
    const isDisabled = disabled || context.disabled;

    return (
      <input
        ref={ref}
        type="radio"
        className={cn(
          "h-4 w-4 rounded-full border border-primary text-primary ring-offset-background focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        checked={isChecked}
        disabled={isDisabled}
        value={value}
        onChange={() => context.onValueChange?.(value)}
        {...props}
      />
    );
  }
);

RadioGroupItem.displayName = 'RadioGroupItem';