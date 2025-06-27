/**
 * Centralized error handling utilities to reduce code duplication
 * and provide consistent error matching across the application
 */

export interface ErrorMatcher {
  pattern: string | RegExp;
  errorKey: string;
}

export class ErrorHandler {
  private matchers: ErrorMatcher[] = [
    { pattern: '401', errorKey: 'UNAUTHORIZED' },
    { pattern: '404', errorKey: 'NOT_FOUND' },
    { pattern: '500', errorKey: 'SERVER_ERROR' },
    { pattern: /timeout/i, errorKey: 'TIMEOUT_ERROR' },
    { pattern: /network|fetch/i, errorKey: 'NETWORK_ERROR' },
  ];

  constructor(customMatchers?: ErrorMatcher[]) {
    if (customMatchers) {
      this.matchers = [...this.matchers, ...customMatchers];
    }
  }

  /**
   * Match an error against configured patterns
   * @param error - The error to match
   * @returns The matched error key or null
   */
  match(error: unknown): string | null {
    if (!(error instanceof Error)) {
      return null;
    }

    const errorMessage = error.message.toLowerCase();

    // Find the first matching pattern
    for (const matcher of this.matchers) {
      if (typeof matcher.pattern === 'string') {
        if (errorMessage.includes(matcher.pattern)) {
          return matcher.errorKey;
        }
      } else if (matcher.pattern instanceof RegExp) {
        if (matcher.pattern.test(errorMessage)) {
          return matcher.errorKey;
        }
      }
    }

    return null;
  }

  /**
   * Add a custom matcher
   */
  addMatcher(matcher: ErrorMatcher): void {
    this.matchers.push(matcher);
  }

  /**
   * Get all configured matchers
   */
  getMatchers(): ReadonlyArray<ErrorMatcher> {
    return [...this.matchers];
  }
}

/**
 * Default error handler instance
 */
export const defaultErrorHandler = new ErrorHandler();

/**
 * Helper function to check if an error matches any predefined keys
 * @param error - The error to check
 * @param errorKeys - Object containing error key mappings
 * @returns The matched error key or null
 */
export function findErrorKey(
  error: unknown,
  errorKeys: Record<string, string>
): string | null {
  if (!(error instanceof Error)) {
    return null;
  }

  const errorMessage = error.message;
  
  // Check if the error message matches any of the error keys
  const matchedKey = Object.keys(errorKeys).find(key =>
    errorMessage.includes(key) || errorMessage.toLowerCase().includes(key.toLowerCase())
  );

  return matchedKey ? errorKeys[matchedKey as keyof typeof errorKeys] : null;
}

/**
 * Extract error message with fallback
 * @param error - The error to extract message from
 * @param fallback - Fallback message if extraction fails
 * @returns The extracted error message
 */
export function extractErrorMessage(error: unknown, fallback: string): string {
  if (error instanceof Error) {
    return error.message;
  }
  
  if (typeof error === 'string') {
    return error;
  }
  
  if (error && typeof error === 'object' && 'message' in error) {
    return String(error.message);
  }
  
  return fallback;
}