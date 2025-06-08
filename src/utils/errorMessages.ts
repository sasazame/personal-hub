import { useTranslations } from 'next-intl';

// Error message keys that correspond to the i18n messages
export const ERROR_KEYS = {
  // Auth errors
  INVALID_CREDENTIALS: 'auth.invalidCredentials',
  USER_ALREADY_EXISTS: 'auth.accountExists',
  EMAIL_NOT_FOUND: 'auth.invalidCredentials',
  INVALID_EMAIL: 'errors.emailFormat',
  WEAK_PASSWORD: 'auth.weakPassword',
  TOKEN_EXPIRED: 'errors.unauthorized',
  UNAUTHORIZED: 'errors.unauthorized',
  
  // Network errors
  NETWORK_ERROR: 'errors.network',
  SERVER_ERROR: 'errors.serverError',
  TIMEOUT_ERROR: 'errors.network',
  
  // TODO errors
  TODO_NOT_FOUND: 'errors.notFound',
  TODO_CREATE_FAILED: 'errors.general',
  TODO_UPDATE_FAILED: 'errors.general',
  TODO_DELETE_FAILED: 'errors.general',
  
  // Validation errors
  REQUIRED_FIELD: 'errors.required',
  INVALID_FORMAT: 'errors.validation',
  
  // Default
  UNKNOWN_ERROR: 'errors.general',
} as const;

// Custom hook to get translated error messages
export function useErrorMessages() {
  const t = useTranslations();
  
  return {
    getErrorMessage: (error: unknown): string => {
      if (error instanceof Error) {
        // Check if the error message matches any of our predefined errors
        const errorKey = Object.keys(ERROR_KEYS).find(key =>
          error.message.includes(key) || error.message.includes(key.toLowerCase())
        ) as keyof typeof ERROR_KEYS;
        
        if (errorKey) {
          return t(ERROR_KEYS[errorKey]);
        }
        
        // Check for common HTTP status codes
        if (error.message.includes('401')) {
          return t(ERROR_KEYS.UNAUTHORIZED);
        }
        if (error.message.includes('404')) {
          return t(ERROR_KEYS.TODO_NOT_FOUND);
        }
        if (error.message.includes('500')) {
          return t(ERROR_KEYS.SERVER_ERROR);
        }
        if (error.message.includes('timeout')) {
          return t(ERROR_KEYS.TIMEOUT_ERROR);
        }
        if (error.message.includes('network') || error.message.includes('fetch')) {
          return t(ERROR_KEYS.NETWORK_ERROR);
        }
        
        // Return the original message if it's already user-friendly
        return error.message;
      }
      
      return t(ERROR_KEYS.UNKNOWN_ERROR);
    }
  };
}

// Legacy function for backward compatibility - should be updated to use the hook
export function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    // Check if the error message matches any of our predefined errors
    const errorKey = Object.keys(ERROR_KEYS).find(key =>
      error.message.includes(key) || error.message.includes(key.toLowerCase())
    ) as keyof typeof ERROR_KEYS;
    
    if (errorKey) {
      // Return the key for components to handle translation
      return ERROR_KEYS[errorKey];
    }
    
    // Check for common HTTP status codes
    if (error.message.includes('401')) {
      return ERROR_KEYS.UNAUTHORIZED;
    }
    if (error.message.includes('404')) {
      return ERROR_KEYS.TODO_NOT_FOUND;
    }
    if (error.message.includes('500')) {
      return ERROR_KEYS.SERVER_ERROR;
    }
    if (error.message.includes('timeout')) {
      return ERROR_KEYS.TIMEOUT_ERROR;
    }
    if (error.message.includes('network') || error.message.includes('fetch')) {
      return ERROR_KEYS.NETWORK_ERROR;
    }
    
    // Return the original message if it's already user-friendly
    return error.message;
  }
  
  return ERROR_KEYS.UNKNOWN_ERROR;
}