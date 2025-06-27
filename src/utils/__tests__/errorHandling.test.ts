import {
  ErrorHandler,
  defaultErrorHandler,
  findErrorKey,
  extractErrorMessage,
  ErrorMatcher
} from '../errorHandling';

describe('ErrorHandler', () => {
  describe('constructor', () => {
    it('should initialize with default matchers', () => {
      const handler = new ErrorHandler();
      const matchers = handler.getMatchers();
      
      expect(matchers.length).toBeGreaterThan(0);
      expect(matchers).toContainEqual({ pattern: '401', errorKey: 'UNAUTHORIZED' });
      expect(matchers).toContainEqual({ pattern: '404', errorKey: 'NOT_FOUND' });
    });

    it('should accept custom matchers', () => {
      const customMatchers: ErrorMatcher[] = [
        { pattern: 'custom', errorKey: 'CUSTOM_ERROR' }
      ];
      
      const handler = new ErrorHandler(customMatchers);
      const matchers = handler.getMatchers();
      
      expect(matchers).toContainEqual({ pattern: 'custom', errorKey: 'CUSTOM_ERROR' });
    });
  });

  describe('match', () => {
    let handler: ErrorHandler;

    beforeEach(() => {
      handler = new ErrorHandler();
    });

    it('should match string patterns', () => {
      const error = new Error('Unauthorized: 401');
      expect(handler.match(error)).toBe('UNAUTHORIZED');
    });

    it('should match regex patterns', () => {
      const error = new Error('Network timeout occurred');
      expect(handler.match(error)).toBe('TIMEOUT_ERROR');
    });

    it('should be case insensitive for regex patterns', () => {
      const error = new Error('TIMEOUT error');
      expect(handler.match(error)).toBe('TIMEOUT_ERROR');
    });

    it('should match network errors', () => {
      const error1 = new Error('Network request failed');
      const error2 = new Error('Fetch error occurred');
      
      expect(handler.match(error1)).toBe('NETWORK_ERROR');
      expect(handler.match(error2)).toBe('NETWORK_ERROR');
    });

    it('should return null for non-Error objects', () => {
      expect(handler.match('string error')).toBeNull();
      expect(handler.match({ message: 'object error' })).toBeNull();
      expect(handler.match(null)).toBeNull();
      expect(handler.match(undefined)).toBeNull();
    });

    it('should return null for unmatched errors', () => {
      const error = new Error('Unknown error type');
      expect(handler.match(error)).toBeNull();
    });

    it('should match the first matching pattern', () => {
      handler.addMatcher({ pattern: 'test', errorKey: 'FIRST_MATCH' });
      handler.addMatcher({ pattern: 'test', errorKey: 'SECOND_MATCH' });
      
      const error = new Error('This is a test error');
      expect(handler.match(error)).toBe('FIRST_MATCH');
    });
  });

  describe('addMatcher', () => {
    it('should add new matchers', () => {
      const handler = new ErrorHandler();
      const initialLength = handler.getMatchers().length;
      
      handler.addMatcher({ pattern: 'new', errorKey: 'NEW_ERROR' });
      
      expect(handler.getMatchers().length).toBe(initialLength + 1);
      expect(handler.getMatchers()).toContainEqual({ pattern: 'new', errorKey: 'NEW_ERROR' });
    });
  });

  describe('getMatchers', () => {
    it('should return a copy of matchers array', () => {
      const handler = new ErrorHandler();
      const matchers1 = handler.getMatchers();
      const matchers2 = handler.getMatchers();
      
      expect(matchers1).not.toBe(matchers2);
      expect(matchers1).toEqual(matchers2);
    });
  });
});

describe('defaultErrorHandler', () => {
  it('should be an instance of ErrorHandler', () => {
    expect(defaultErrorHandler).toBeInstanceOf(ErrorHandler);
  });

  it('should have default matchers', () => {
    expect(defaultErrorHandler.getMatchers().length).toBeGreaterThan(0);
  });
});

describe('findErrorKey', () => {
  const errorKeys = {
    'INVALID_CREDENTIALS': 'auth.invalidCredentials',
    'USER_ALREADY_EXISTS': 'auth.accountExists',
    'NETWORK_ERROR': 'errors.network',
  };

  it('should find exact matches', () => {
    const error = new Error('INVALID_CREDENTIALS');
    expect(findErrorKey(error, errorKeys)).toBe('auth.invalidCredentials');
  });

  it('should find case-insensitive matches', () => {
    const error = new Error('invalid_credentials');
    expect(findErrorKey(error, errorKeys)).toBe('auth.invalidCredentials');
  });

  it('should find partial matches', () => {
    const error = new Error('Error: USER_ALREADY_EXISTS in database');
    expect(findErrorKey(error, errorKeys)).toBe('auth.accountExists');
  });

  it('should return null for non-Error objects', () => {
    expect(findErrorKey('string', errorKeys)).toBeNull();
    expect(findErrorKey(null, errorKeys)).toBeNull();
    expect(findErrorKey(undefined, errorKeys)).toBeNull();
  });

  it('should return null for unmatched errors', () => {
    const error = new Error('Unknown error');
    expect(findErrorKey(error, errorKeys)).toBeNull();
  });
});

describe('extractErrorMessage', () => {
  it('should extract message from Error objects', () => {
    const error = new Error('Test error message');
    expect(extractErrorMessage(error, 'fallback')).toBe('Test error message');
  });

  it('should return string errors as-is', () => {
    expect(extractErrorMessage('String error', 'fallback')).toBe('String error');
  });

  it('should extract message from objects with message property', () => {
    const error = { message: 'Object error message' };
    expect(extractErrorMessage(error, 'fallback')).toBe('Object error message');
  });

  it('should return fallback for null/undefined', () => {
    expect(extractErrorMessage(null, 'fallback')).toBe('fallback');
    expect(extractErrorMessage(undefined, 'fallback')).toBe('fallback');
  });

  it('should return fallback for objects without message', () => {
    expect(extractErrorMessage({}, 'fallback')).toBe('fallback');
    expect(extractErrorMessage({ error: 'test' }, 'fallback')).toBe('fallback');
  });

  it('should convert non-string message to string', () => {
    const error = { message: 123 };
    expect(extractErrorMessage(error, 'fallback')).toBe('123');
  });
});