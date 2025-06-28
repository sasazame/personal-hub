import '@testing-library/jest-dom'

// Suppress console warnings in tests
const originalConsoleError = console.error;
const originalConsoleWarn = console.warn;

console.error = (...args) => {
  // Suppress specific React warnings during tests
  if (
    typeof args[0] === 'string' && (
      (args[0].includes('An update to') && args[0].includes('was not wrapped in act(...)')) ||
      args[0].includes('Query data cannot be undefined') ||
      args[0].includes('Form submission error:') ||
      args[0].includes('Password reset failed:')
    )
  ) {
    return;
  }
  originalConsoleError.apply(console, args);
};

console.warn = (...args) => {
  // Suppress specific warnings during tests
  if (
    typeof args[0] === 'string' && (
      args[0].includes('Logout request failed:') ||
      args[0].includes('Failed to schedule token refresh:') ||
      args[0].includes('Auth check failed:') ||
      args[0].includes('Failed to parse stored user:') ||
      args[0].includes('Removing expired access token') ||
      args[0].includes('Removing expired refresh token')
    )
  ) {
    return;
  }
  originalConsoleWarn.apply(console, args);
};

// Mock matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(), // deprecated
    removeListener: jest.fn(), // deprecated
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

// Mock ResizeObserver
global.ResizeObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}));

// Mock next-intl
jest.mock('next-intl', () => ({
  useTranslations: () => (key) => key,
  useLocale: () => 'ja',
  NextIntlClientProvider: ({ children }) => children,
}));

// Mock LocaleContext
jest.mock('@/contexts/LocaleContext', () => ({
  useLocale: () => ({
    locale: 'ja',
    setLocale: jest.fn(),
  }),
  LocaleProvider: ({ children }) => children,
}));

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    back: jest.fn(),
    forward: jest.fn(),
    refresh: jest.fn(),
    replace: jest.fn(),
    prefetch: jest.fn(),
  }),
  usePathname: () => '/',
  useSearchParams: () => new URLSearchParams(),
}));