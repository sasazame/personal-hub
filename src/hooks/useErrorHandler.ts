import { useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import {
  createErrorHandler,
  createContextualErrorHandler,
  createMutationErrorHandler,
  isAuthError,
  isNetworkError,
  logError,
} from '@/utils/errorHandlers';
import { showError, showWarning } from '@/components/ui/toast';

export interface UseErrorHandlerOptions {
  context?: string;
  redirectOnAuth?: boolean;
  logErrors?: boolean;
}

/**
 * Hook for consistent error handling across the application
 */
export function useErrorHandler(options: UseErrorHandlerOptions = {}) {
  const t = useTranslations();
  const router = useRouter();
  const {
    context,
    redirectOnAuth = true,
    logErrors = true,
  } = options;
  
  const handleError = useCallback((error: unknown, action?: string) => {
    // Log error if enabled
    if (logErrors && error instanceof Error) {
      logError(error, { context, action });
    }
    
    // Handle auth errors
    if (isAuthError(error) && redirectOnAuth) {
      showError(t('auth.sessionExpired'));
      router.push('/login');
      return;
    }
    
    // Handle network errors
    if (isNetworkError(error)) {
      showWarning(t('errors.network'));
      return;
    }
    
    // Use contextual handler if context provided
    if (context) {
      const contextualHandler = createContextualErrorHandler(t, context);
      contextualHandler(error, action);
    } else {
      const defaultHandler = createErrorHandler(t);
      defaultHandler(error);
    }
  }, [t, router, context, redirectOnAuth, logErrors]);
  
  return {
    handleError,
    createMutationHandler: (entityName: string, action: string) =>
      createMutationErrorHandler({ t, entityName, action }),
  };
}

/**
 * Hook for form-specific error handling
 */
export interface UseFormErrorHandlerOptions {
  onFieldError?: (field: string, message: string) => void;
  showToast?: boolean;
}

export function useFormErrorHandler(options: UseFormErrorHandlerOptions = {}) {
  const t = useTranslations();
  const { onFieldError, showToast = true } = options;
  
  const handleFormError = useCallback((error: unknown) => {
    if (typeof error === 'object' && error !== null) {
      const apiError = error as any;
      
      // Handle validation errors
      if (apiError.errors && typeof apiError.errors === 'object') {
        let hasFieldErrors = false;
        
        Object.entries(apiError.errors).forEach(([field, messages]) => {
          if (Array.isArray(messages) && messages.length > 0) {
            hasFieldErrors = true;
            if (onFieldError) {
              onFieldError(field, messages[0]);
            }
          }
        });
        
        if (hasFieldErrors && showToast) {
          showError(t('errors.validationFailed'));
        }
        
        return;
      }
    }
    
    // Fallback to general error
    const message = error instanceof Error ? error.message : t('errors.general');
    if (showToast) {
      showError(message);
    }
  }, [t, onFieldError, showToast]);
  
  return { handleFormError };
}

/**
 * Hook for async operation error handling with retry
 */
export interface UseAsyncErrorHandlerOptions {
  maxRetries?: number;
  retryDelay?: number;
  shouldRetry?: (error: unknown) => boolean;
}

export function useAsyncErrorHandler(options: UseAsyncErrorHandlerOptions = {}) {
  const { handleError } = useErrorHandler();
  const {
    maxRetries = 3,
    retryDelay = 1000,
    shouldRetry = isNetworkError,
  } = options;
  
  const executeWithRetry = useCallback(async <T,>(
    operation: () => Promise<T>,
    actionName?: string
  ): Promise<T | null> => {
    let lastError: unknown;
    
    for (let attempt = 0; attempt < maxRetries; attempt++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error;
        
        if (attempt < maxRetries - 1 && shouldRetry(error)) {
          await new Promise(resolve => setTimeout(resolve, retryDelay * (attempt + 1)));
          continue;
        }
        
        break;
      }
    }
    
    handleError(lastError, actionName);
    return null;
  }, [maxRetries, retryDelay, shouldRetry, handleError]);
  
  return { executeWithRetry };
}