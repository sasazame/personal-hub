import { type Theme } from '@/contexts/ThemeContext';
import { cn } from '@/lib/cn';

/**
 * Utility function to apply theme-based class names
 * @param theme - Current theme ('light' | 'dark')
 * @param lightClasses - Classes to apply in light mode
 * @param darkClasses - Classes to apply in dark mode
 * @param commonClasses - Classes to apply in both modes (optional)
 * @returns Combined class string
 */
export function themeClasses(
  theme: Theme,
  lightClasses: string,
  darkClasses: string,
  commonClasses?: string
): string {
  return cn(
    commonClasses,
    theme === 'dark' ? darkClasses : lightClasses
  );
}

/**
 * Utility function for conditional theme values
 * @param theme - Current theme ('light' | 'dark')
 * @param lightValue - Value to return in light mode
 * @param darkValue - Value to return in dark mode
 * @returns The appropriate value based on theme
 */
export function themeValue<T>(
  theme: Theme,
  lightValue: T,
  darkValue: T
): T {
  return theme === 'dark' ? darkValue : lightValue;
}