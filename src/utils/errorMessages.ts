import { useTranslations } from 'next-intl';
import { ErrorHandler, findErrorKey, extractErrorMessage } from './errorHandling';

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

// Create a custom error handler with application-specific matchers
const appErrorHandler = new ErrorHandler([
  // Add application-specific matchers
  { pattern: 'INVALID_CREDENTIALS', errorKey: ERROR_KEYS.INVALID_CREDENTIALS },
  { pattern: 'USER_ALREADY_EXISTS', errorKey: ERROR_KEYS.USER_ALREADY_EXISTS },
  { pattern: 'EMAIL_NOT_FOUND', errorKey: ERROR_KEYS.EMAIL_NOT_FOUND },
  { pattern: 'INVALID_EMAIL', errorKey: ERROR_KEYS.INVALID_EMAIL },
  { pattern: 'WEAK_PASSWORD', errorKey: ERROR_KEYS.WEAK_PASSWORD },
  { pattern: 'TOKEN_EXPIRED', errorKey: ERROR_KEYS.TOKEN_EXPIRED },
  { pattern: 'TODO_NOT_FOUND', errorKey: ERROR_KEYS.TODO_NOT_FOUND },
]);

// Custom hook to get translated error messages
export function useErrorMessages() {
  const t = useTranslations();
  
  return {
    getErrorMessage: (error: unknown): string => {
      // First try to find a matching error key
      const errorKey = findErrorKey(error, ERROR_KEYS);
      if (errorKey) {
        return t(errorKey);
      }
      
      // Then try the error handler for HTTP status codes and patterns
      const matchedKey = appErrorHandler.match(error);
      if (matchedKey) {
        return t(matchedKey);
      }
      
      // Extract and return the error message or use default
      const message = extractErrorMessage(error, ERROR_KEYS.UNKNOWN_ERROR);
      
      // If it's the default unknown error key, translate it
      if (message === ERROR_KEYS.UNKNOWN_ERROR) {
        return t(message);
      }
      
      // Otherwise return the original message if it's user-friendly
      return error instanceof Error ? error.message : t(ERROR_KEYS.UNKNOWN_ERROR);
    }
  };
}

// Legacy function for backward compatibility - should be updated to use the hook
export function getErrorMessage(error: unknown): string {
  // First try to find a matching error key
  const errorKey = findErrorKey(error, ERROR_KEYS);
  if (errorKey) {
    return errorKey;
  }
  
  // Then try the error handler for HTTP status codes and patterns
  const matchedKey = appErrorHandler.match(error);
  if (matchedKey) {
    return matchedKey;
  }
  
  // Extract and return the error message or use default
  const message = extractErrorMessage(error, ERROR_KEYS.UNKNOWN_ERROR);
  
  // If it's the default unknown error key, return it
  if (message === ERROR_KEYS.UNKNOWN_ERROR) {
    return message;
  }
  
  // Otherwise return the original message if it's user-friendly
  return error instanceof Error ? error.message : ERROR_KEYS.UNKNOWN_ERROR;
}