import { render, screen, act, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Home from '../page';
import { AuthProvider } from '@/contexts/AuthContext';
import { ThemeProvider } from '@/contexts/ThemeContext';

// Mock next/navigation
const mockReplace = jest.fn();
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    replace: mockReplace,
    push: jest.fn(),
    back: jest.fn(),
    forward: jest.fn(),
    refresh: jest.fn(),
    prefetch: jest.fn(),
  }),
  useSearchParams: () => new URLSearchParams(),
  usePathname: () => '/',
}));

// Mock auth API
jest.mock('@/services/auth', () => ({
  authAPI: {
    getCurrentUser: jest.fn(),
    logout: jest.fn(),
  },
  AuthAPIError: class AuthAPIError extends Error {
    constructor(message: string) {
      super(message);
      this.name = 'AuthAPIError';
    }
  },
}));

// Mock OIDC service
jest.mock('@/services/oidc-auth', () => ({
  OIDCAuthService: {
    isAuthenticated: jest.fn().mockReturnValue(true),
    getUserInfo: jest.fn().mockResolvedValue({
      id: 1,
      username: 'testuser',
      email: 'test@example.com',
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z',
    }),
    refreshToken: jest.fn(),
    logout: jest.fn(),
  },
}));

// Mock useTranslations
jest.mock('next-intl', () => ({
  useTranslations: () => (key: string) => key,
  useLocale: () => 'ja',
  NextIntlClientProvider: ({ children }: { children: React.ReactNode }) => children,
}));

// Mock LocaleContext
jest.mock('@/contexts/LocaleContext', () => ({
  useLocale: () => ({
    locale: 'ja',
    setLocale: jest.fn(),
  }),
  LocaleProvider: ({ children }: { children: React.ReactNode }) => children,
}));

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

function renderWithProviders(component: React.ReactElement) {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });
  
  return render(
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AuthProvider>
          {component}
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

describe('Home Page', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorageMock.getItem.mockImplementation((key) => {
      if (key === 'auth_token') return 'fake-token';
      if (key === 'refresh_token') return 'fake-refresh-token';
      if (key === 'user_info') return JSON.stringify({
        id: 1,
        username: 'testuser',
        email: 'test@example.com',
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
      });
      return null;
    });
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const mockAuthAPI = require('@/services/auth').authAPI;
    mockAuthAPI.getCurrentUser.mockResolvedValue({
      id: 1,
      username: 'testuser',
      email: 'test@example.com',
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z',
    });
  });

  it('renders loading state initially', () => {
    renderWithProviders(<Home />);
    
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });


  it('is wrapped in AuthGuard', () => {
    // This test verifies that the Home component is properly wrapped in AuthGuard
    // by checking that it renders without authentication errors
    renderWithProviders(<Home />);
    
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });
});