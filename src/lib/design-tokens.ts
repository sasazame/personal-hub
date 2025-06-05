/**
 * Design Token Utilities
 * Provides TypeScript interfaces and utilities for the design system
 */

export const DesignTokens = {
  colors: {
    primary: {
      50: 'var(--color-primary-50)',
      100: 'var(--color-primary-100)',
      200: 'var(--color-primary-200)',
      300: 'var(--color-primary-300)',
      400: 'var(--color-primary-400)',
      500: 'var(--color-primary-500)',
      600: 'var(--color-primary-600)',
      700: 'var(--color-primary-700)',
      800: 'var(--color-primary-800)',
      900: 'var(--color-primary-900)',
      950: 'var(--color-primary-950)',
    },
    neutral: {
      50: 'var(--color-neutral-50)',
      100: 'var(--color-neutral-100)',
      200: 'var(--color-neutral-200)',
      300: 'var(--color-neutral-300)',
      400: 'var(--color-neutral-400)',
      500: 'var(--color-neutral-500)',
      600: 'var(--color-neutral-600)',
      700: 'var(--color-neutral-700)',
      800: 'var(--color-neutral-800)',
      900: 'var(--color-neutral-900)',
      950: 'var(--color-neutral-950)',
    },
    success: {
      50: 'var(--color-success-50)',
      500: 'var(--color-success-500)',
      900: 'var(--color-success-900)',
    },
    warning: {
      50: 'var(--color-warning-50)',
      500: 'var(--color-warning-500)',
      900: 'var(--color-warning-900)',
    },
    error: {
      50: 'var(--color-error-50)',
      500: 'var(--color-error-500)',
      900: 'var(--color-error-900)',
    },
    semantic: {
      background: 'var(--background)',
      foreground: 'var(--foreground)',
      card: 'var(--card)',
      cardForeground: 'var(--card-foreground)',
      popover: 'var(--popover)',
      popoverForeground: 'var(--popover-foreground)',
      primary: 'var(--primary)',
      primaryForeground: 'var(--primary-foreground)',
      secondary: 'var(--secondary)',
      secondaryForeground: 'var(--secondary-foreground)',
      muted: 'var(--muted)',
      mutedForeground: 'var(--muted-foreground)',
      accent: 'var(--accent)',
      accentForeground: 'var(--accent-foreground)',
      destructive: 'var(--destructive)',
      destructiveForeground: 'var(--destructive-foreground)',
      border: 'var(--border)',
      input: 'var(--input)',
      ring: 'var(--ring)',
    },
    priority: {
      lowBg: 'var(--priority-low-bg)',
      lowText: 'var(--priority-low-text)',
      mediumBg: 'var(--priority-medium-bg)',
      mediumText: 'var(--priority-medium-text)',
      highBg: 'var(--priority-high-bg)',
      highText: 'var(--priority-high-text)',
    },
    status: {
      pendingBg: 'var(--status-pending-bg)',
      pendingText: 'var(--status-pending-text)',
      inProgressBg: 'var(--status-in-progress-bg)',
      inProgressText: 'var(--status-in-progress-text)',
      completedBg: 'var(--status-completed-bg)',
      completedText: 'var(--status-completed-text)',
    },
  },
  typography: {
    fontFamily: {
      sans: 'var(--font-family-sans)',
      mono: 'var(--font-family-mono)',
    },
    fontSize: {
      xs: 'var(--font-size-xs)',
      sm: 'var(--font-size-sm)',
      base: 'var(--font-size-base)',
      lg: 'var(--font-size-lg)',
      xl: 'var(--font-size-xl)',
      '2xl': 'var(--font-size-2xl)',
      '3xl': 'var(--font-size-3xl)',
      '4xl': 'var(--font-size-4xl)',
    },
    fontWeight: {
      normal: 'var(--font-weight-normal)',
      medium: 'var(--font-weight-medium)',
      semibold: 'var(--font-weight-semibold)',
      bold: 'var(--font-weight-bold)',
    },
    lineHeight: {
      tight: 'var(--line-height-tight)',
      normal: 'var(--line-height-normal)',
      relaxed: 'var(--line-height-relaxed)',
    },
  },
  spacing: {
    px: 'var(--spacing-px)',
    0: 'var(--spacing-0)',
    1: 'var(--spacing-1)',
    2: 'var(--spacing-2)',
    3: 'var(--spacing-3)',
    4: 'var(--spacing-4)',
    5: 'var(--spacing-5)',
    6: 'var(--spacing-6)',
    8: 'var(--spacing-8)',
    10: 'var(--spacing-10)',
    12: 'var(--spacing-12)',
    16: 'var(--spacing-16)',
    20: 'var(--spacing-20)',
    24: 'var(--spacing-24)',
  },
  borderRadius: {
    none: 'var(--radius-none)',
    sm: 'var(--radius-sm)',
    base: 'var(--radius-base)',
    md: 'var(--radius-md)',
    lg: 'var(--radius-lg)',
    xl: 'var(--radius-xl)',
    '2xl': 'var(--radius-2xl)',
    full: 'var(--radius-full)',
  },
  boxShadow: {
    xs: 'var(--shadow-xs)',
    sm: 'var(--shadow-sm)',
    base: 'var(--shadow-base)',
    md: 'var(--shadow-md)',
    lg: 'var(--shadow-lg)',
    xl: 'var(--shadow-xl)',
  },
  zIndex: {
    dropdown: 'var(--z-index-dropdown)',
    sticky: 'var(--z-index-sticky)',
    fixed: 'var(--z-index-fixed)',
    modal: 'var(--z-index-modal)',
    popover: 'var(--z-index-popover)',
    tooltip: 'var(--z-index-tooltip)',
  },
  breakpoints: {
    sm: 'var(--breakpoint-sm)',
    md: 'var(--breakpoint-md)',
    lg: 'var(--breakpoint-lg)',
    xl: 'var(--breakpoint-xl)',
    '2xl': 'var(--breakpoint-2xl)',
  },
} as const;

/**
 * Get CSS custom property value
 */
export function getCSSVar(name: string): string {
  if (typeof window !== 'undefined' && typeof getComputedStyle !== 'undefined') {
    return getComputedStyle(document.documentElement).getPropertyValue(name);
  }
  return '';
}

/**
 * Utility to create style objects with design tokens
 */
export function createStyles<T extends Record<string, unknown>>(styles: T): T {
  return styles;
}

/**
 * Type-safe design token access
 */
export type ColorToken = keyof typeof DesignTokens.colors.primary | 
                        keyof typeof DesignTokens.colors.neutral |
                        keyof typeof DesignTokens.colors.semantic;

export type SpacingToken = keyof typeof DesignTokens.spacing;
export type FontSizeToken = keyof typeof DesignTokens.typography.fontSize;
export type BorderRadiusToken = keyof typeof DesignTokens.borderRadius;