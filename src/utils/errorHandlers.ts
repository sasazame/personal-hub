import { showError } from '@/components/ui/toast';

/**
 * Standard error handler that shows a toast notification
 */
export function createErrorHandler(t: (key: string) => string, defaultKey = 'errors.general') {
  return (error: unknown, customKey?: string) => {
    let message: string;
    
    if (error instanceof Error) {
      message = error.message;
    } else if (typeof error === 'string') {
      message = error;
    } else {
      message = t(customKey || defaultKey);
    }
    
    showError(message);
  };
}

/**
 * Error handler with context
 */
export function createContextualErrorHandler(t: (key: string, options?: { defaultValue?: string }) => string, context: string) {
  return (error: unknown, action?: string) => {
    const key = action ? `${context}.${action}Failed` : `${context}.error`;
    const fallback = t('errors.general');
    
    let message: string;
    if (error instanceof Error && error.message) {
      message = error.message;
    } else {
      message = t(key, { defaultValue: fallback });
    }
    
    showError(message);
  };
}

/**
 * Parse API error responses
 */
export interface ApiError {
  message?: string;
  error?: string;
  errors?: Record<string, string[]>;
  statusCode?: number;
}

export function parseApiError(error: unknown): string {
  if (typeof error === 'string') {
    return error;
  }
  
  if (error instanceof Error) {
    return error.message;
  }
  
  if (typeof error === 'object' && error !== null) {
    const apiError = error as ApiError;
    
    // Check for message field
    if (apiError.message) {
      return apiError.message;
    }
    
    // Check for error field
    if (apiError.error) {
      return apiError.error;
    }
    
    // Check for validation errors
    if (apiError.errors) {
      const firstError = Object.values(apiError.errors).flat()[0];
      if (firstError) {
        return firstError;
      }
    }
  }
  
  return 'An unexpected error occurred';
}

/**
 * Mutation error handler factory
 */
export interface MutationErrorHandlerOptions {
  t: (key: string, options?: { defaultValue?: string }) => string;
  entityName: string;
  action: string;
  showToast?: boolean;
}

export function createMutationErrorHandler({
  t,
  entityName,
  action,
  showToast = true,
}: MutationErrorHandlerOptions) {
  return (error: unknown) => {
    const message = parseApiError(error);
    const fallbackKey = `${entityName}.${action}Failed`;
    const fallbackMessage = t(fallbackKey, { defaultValue: message });
    
    if (showToast) {
      showError(fallbackMessage);
    }
    
    return fallbackMessage;
  };
}

/**
 * Form submission error handler
 */
export interface FormError {
  field?: string;
  message: string;
}

export function handleFormError(
  error: unknown,
  setFieldError?: (field: string, message: string) => void
): FormError[] {
  const errors: FormError[] = [];
  
  if (typeof error === 'object' && error !== null) {
    const apiError = error as ApiError;
    
    // Handle field-specific errors
    if (apiError.errors && setFieldError) {
      Object.entries(apiError.errors).forEach(([field, messages]) => {
        if (messages.length > 0) {
          setFieldError(field, messages[0]);
          errors.push({ field, message: messages[0] });
        }
      });
    } else if (apiError.message) {
      errors.push({ message: apiError.message });
    }
  } else {
    const message = parseApiError(error);
    errors.push({ message });
  }
  
  return errors;
}

/**
 * Retry with exponential backoff
 */
export interface RetryOptions {
  maxAttempts?: number;
  initialDelay?: number;
  maxDelay?: number;
  backoffMultiplier?: number;
  shouldRetry?: (error: unknown, attempt: number) => boolean;
}

export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  options: RetryOptions = {}
): Promise<T> {
  const {
    maxAttempts = 3,
    initialDelay = 1000,
    maxDelay = 10000,
    backoffMultiplier = 2,
    shouldRetry = () => true,
  } = options;
  
  let lastError: unknown;
  
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      
      if (attempt === maxAttempts - 1 || !shouldRetry(error, attempt)) {
        throw error;
      }
      
      const delay = Math.min(
        initialDelay * Math.pow(backoffMultiplier, attempt),
        maxDelay
      );
      
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  throw lastError;
}

/**
 * Error boundary fallback component props
 */
export interface ErrorFallbackProps {
  error: Error;
  resetErrorBoundary: () => void;
}

/**
 * Log error to monitoring service
 */
export function logError(error: Error, context?: Record<string, unknown>) {
  // In production, this would send to a monitoring service
  console.error('Error logged:', {
    message: error.message,
    stack: error.stack,
    context,
    timestamp: new Date().toISOString(),
  });
}

/**
 * Check if error is network-related
 */
export function isNetworkError(error: unknown): boolean {
  if (error instanceof Error) {
    const message = error.message.toLowerCase();
    return (
      message.includes('network') ||
      message.includes('fetch') ||
      message.includes('timeout') ||
      message.includes('connection')
    );
  }
  return false;
}

/**
 * Check if error is authentication-related
 */
export function isAuthError(error: unknown): boolean {
  if (typeof error === 'object' && error !== null) {
    const apiError = error as ApiError;
    return apiError.statusCode === 401 || apiError.statusCode === 403;
  }
  return false;
}