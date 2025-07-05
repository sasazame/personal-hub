/**
 * Common test setup utilities
 */

import { QueryClient } from '@tanstack/react-query';
import { toastMock, routerMock, createTranslationsMock, defaultTranslations } from './mocks/common';

/**
 * Setup common mocks that are used in most tests
 */
export function setupCommonMocks() {
  // Mock toast
  jest.mock('@/components/ui/toast', () => toastMock);
  
  // Mock next/navigation
  jest.mock('next/navigation', () => ({
    useRouter: () => routerMock,
    usePathname: () => '/',
    useSearchParams: () => new URLSearchParams(),
  }));
  
  // Mock next-intl
  jest.mock('next-intl', () => ({
    useTranslations: () => createTranslationsMock(defaultTranslations),
  }));
  
  // Clear all mocks between tests
  beforeEach(() => {
    jest.clearAllMocks();
  });
}

/**
 * Create a test query client with default options
 */
export function createTestQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        staleTime: 0,
        gcTime: 0,
      },
      mutations: {
        retry: false,
      },
    },
  });
}

/**
 * Wait for async updates in tests
 */
export async function waitForAsync() {
  // Wait for promises to resolve
  await new Promise(resolve => setTimeout(resolve, 0));
  
  // Wait for React updates
  const { act } = await import('@testing-library/react');
  await act(async () => {
    await new Promise(resolve => setTimeout(resolve, 0));
  });
}

/**
 * Mock fetch for API calls
 */
export function mockFetch(responses: Array<{ url: string | RegExp; response: unknown; status?: number }>) {
  global.fetch = jest.fn((url: RequestInfo | URL) => {
    const urlString = typeof url === 'string' ? url : url.toString();
    
    for (const mock of responses) {
      const matches = mock.url instanceof RegExp 
        ? mock.url.test(urlString)
        : urlString.includes(mock.url);
        
      if (matches) {
        return Promise.resolve({
          ok: (mock.status || 200) < 400,
          status: mock.status || 200,
          json: () => Promise.resolve(mock.response),
          text: () => Promise.resolve(JSON.stringify(mock.response)),
        } as Response);
      }
    }
    
    // Default 404 response
    return Promise.resolve({
      ok: false,
      status: 404,
      json: () => Promise.resolve({ error: 'Not found' }),
      text: () => Promise.resolve('Not found'),
    } as Response);
  }) as jest.Mock;
}

/**
 * Mock window.matchMedia for responsive tests
 */
export function mockMatchMedia(matches: boolean = false) {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: jest.fn().mockImplementation(query => ({
      matches,
      media: query,
      onchange: null,
      addListener: jest.fn(), // deprecated
      removeListener: jest.fn(), // deprecated
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      dispatchEvent: jest.fn(),
    })),
  });
}

/**
 * Mock IntersectionObserver for components that use it
 */
export function mockIntersectionObserver() {
  global.IntersectionObserver = jest.fn().mockImplementation(() => ({
    observe: jest.fn(),
    unobserve: jest.fn(),
    disconnect: jest.fn(),
  }));
}

/**
 * Mock ResizeObserver for components that use it
 */
export function mockResizeObserver() {
  global.ResizeObserver = jest.fn().mockImplementation(() => ({
    observe: jest.fn(),
    unobserve: jest.fn(),
    disconnect: jest.fn(),
  }));
}

/**
 * Setup all browser API mocks
 */
export function setupBrowserMocks() {
  mockMatchMedia();
  mockIntersectionObserver();
  mockResizeObserver();
  
  // Mock scrollTo
  window.scrollTo = jest.fn();
  
  // Mock localStorage
  const localStorageMock = {
    getItem: jest.fn(),
    setItem: jest.fn(),
    removeItem: jest.fn(),
    clear: jest.fn(),
  };
  Object.defineProperty(window, 'localStorage', {
    value: localStorageMock,
    writable: true,
  });
  
  // Mock sessionStorage
  const sessionStorageMock = {
    getItem: jest.fn(),
    setItem: jest.fn(),
    removeItem: jest.fn(),
    clear: jest.fn(),
  };
  Object.defineProperty(window, 'sessionStorage', {
    value: sessionStorageMock,
    writable: true,
  });
}

/**
 * Helper to test async errors
 */
export async function expectAsyncError(fn: () => Promise<unknown>, errorMessage?: string) {
  let error: Error | null = null;
  
  try {
    await fn();
  } catch (e) {
    error = e as Error;
  }
  
  expect(error).not.toBeNull();
  if (errorMessage) {
    expect(error?.message).toContain(errorMessage);
  }
}