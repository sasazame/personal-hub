import { type ClassValue } from 'clsx';

/**
 * Utility for merging CSS classes with conditional logic
 * This is a simplified version of the popular `cn` utility
 */
export function cn(...inputs: ClassValue[]): string {
  const classes: string[] = [];
  
  for (const input of inputs) {
    if (!input) continue;
    
    if (typeof input === 'string') {
      classes.push(input);
    } else if (Array.isArray(input)) {
      const result = cn(...input);
      if (result) classes.push(result);
    } else if (typeof input === 'object') {
      for (const [key, value] of Object.entries(input)) {
        if (value) classes.push(key);
      }
    }
  }
  
  return classes.join(' ');
}

/**
 * Variants utility for creating component variants
 */
export interface VariantProps<T extends Record<string, Record<string, string>>> {
  variants: T;
  defaultVariants?: {
    [K in keyof T]?: keyof T[K];
  };
}

export function cva<T extends Record<string, Record<string, string>>>(
  base: string,
  config: VariantProps<T>
) {
  return (props?: {
    [K in keyof T]?: keyof T[K];
  } & { className?: string }) => {
    const { className, ...variantProps } = props || {};
    
    const classes = [base];
    
    // First apply default variants
    if (config.defaultVariants) {
      for (const [variantKey, defaultValue] of Object.entries(config.defaultVariants)) {
        if ((!(variantKey in variantProps) || (variantProps as Record<string, unknown>)[variantKey] === undefined) && defaultValue && config.variants[variantKey]?.[defaultValue as string]) {
          classes.push(config.variants[variantKey][defaultValue as string]);
        }
      }
    }
    
    // Then apply specified variants (overriding defaults)
    for (const [variantKey, variantValue] of Object.entries(variantProps)) {
      if (variantValue && config.variants[variantKey]?.[variantValue as string]) {
        classes.push(config.variants[variantKey][variantValue as string]);
      }
    }
    
    return cn(classes.join(' '), className);
  };
}