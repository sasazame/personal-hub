import React, { forwardRef, useState } from 'react';
import { cn } from '@/lib/cn';
import { ChevronDown } from 'lucide-react';

export interface SelectProps {
  children: React.ReactNode;
  value?: string;
  onValueChange?: (value: string) => void;
  defaultValue?: string;
  disabled?: boolean;
}

export interface SelectTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
}

export interface SelectValueProps {
  placeholder?: string;
}

export interface SelectContentProps {
  children: React.ReactNode;
}

export interface SelectItemProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  value: string;
  children: React.ReactNode;
}

// Context for Select component
const SelectContext = React.createContext<{
  value?: string;
  onValueChange?: (value: string) => void;
  open: boolean;
  setOpen: (open: boolean) => void;
}>({
  open: false,
  setOpen: () => {},
});

export function Select({ children, value, onValueChange, defaultValue, disabled }: SelectProps) {
  const [open, setOpen] = useState(false);
  const [internalValue, setInternalValue] = useState(defaultValue);
  
  const actualValue = value !== undefined ? value : internalValue;
  
  const handleValueChange = (newValue: string) => {
    if (disabled) return;
    if (value === undefined) {
      setInternalValue(newValue);
    }
    onValueChange?.(newValue);
    setOpen(false);
  };

  return (
    <SelectContext.Provider value={{ value: actualValue, onValueChange: handleValueChange, open, setOpen }}>
      <div className="relative">
        {React.Children.map(children, child =>
          React.isValidElement(child) ? React.cloneElement(child, { disabled } as Partial<SelectTriggerProps>) : child
        )}
      </div>
    </SelectContext.Provider>
  );
}

export const SelectTrigger = forwardRef<HTMLButtonElement, SelectTriggerProps>(
  ({ className, children, ...props }, ref) => {
    const { open, setOpen } = React.useContext(SelectContext);
    
    return (
      <button
        ref={ref}
        type="button"
        className={cn(
          "flex h-11 w-full items-center justify-between rounded-lg border bg-input border-input-border px-3.5 py-2.5 text-sm font-normal",
          "transition-all duration-200",
          "hover:border-border-strong",
          "focus:border-primary focus:bg-background",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
          "disabled:cursor-not-allowed disabled:opacity-50",
          "placeholder:text-muted-foreground",
          className
        )}
        onClick={() => setOpen(!open)}
        {...props}
      >
        {children}
        <ChevronDown className="h-4 w-4 opacity-50" />
      </button>
    );
  }
);

SelectTrigger.displayName = 'SelectTrigger';

export function SelectValue({ placeholder }: SelectValueProps) {
  const { value } = React.useContext(SelectContext);
  
  // Find the selected item's text
  const [selectedText, setSelectedText] = useState<string | null>(null);
  
  React.useEffect(() => {
    if (value) {
      // This will be set by SelectItem when it mounts
      const item = document.querySelector(`[data-value="${value}"]`);
      if (item) {
        setSelectedText(item.textContent || value);
      }
    }
  }, [value]);
  
  return <span>{selectedText || placeholder || 'Select...'}</span>;
}

export function SelectContent({ children }: SelectContentProps) {
  const { open } = React.useContext(SelectContext);
  
  if (!open) return null;
  
  return (
    <div className="absolute z-50 mt-2 w-full rounded-xl border border-border bg-card shadow-lg p-1.5 text-card-foreground animate-fade-in-scale">
      {children}
    </div>
  );
}

export function SelectItem({ value, children, className, ...props }: SelectItemProps) {
  const { value: selectedValue, onValueChange } = React.useContext(SelectContext);
  
  return (
    <button
      type="button"
      className={cn(
        "relative flex w-full cursor-default select-none items-center rounded-lg py-2 px-3 text-sm outline-none transition-all duration-200",
        "hover:bg-neutral-100 dark:hover:bg-neutral-800",
        "focus-visible:bg-neutral-100 dark:focus-visible:bg-neutral-800",
        "data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
        selectedValue === value && "bg-primary-100 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300 font-medium",
        className
      )}
      onClick={() => onValueChange?.(value)}
      data-value={value}
      {...props}
    >
      {children}
    </button>
  );
}