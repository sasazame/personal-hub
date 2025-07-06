import { ReactNode } from 'react';

/**
 * Base props for components that render children
 */
export interface WithChildren {
  children: ReactNode;
}

/**
 * Base props for components with optional className
 */
export interface WithClassName {
  className?: string;
}

/**
 * Base props for guard components
 */
export interface GuardProps extends WithChildren {
  redirectTo?: string;
}

/**
 * Base props for chart components
 */
export interface ChartProps<T> {
  data: T;
}

/**
 * Base props for modal/form components
 */
export interface ModalFormProps<T> {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: T) => void;
  isSubmitting?: boolean;
}

/**
 * Common button variant and size props
 */
export interface ButtonVariantProps {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'outline';
  size?: 'sm' | 'md' | 'lg';
}