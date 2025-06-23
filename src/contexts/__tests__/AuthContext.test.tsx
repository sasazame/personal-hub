import { renderHook, act, waitFor } from '@testing-library/react';
import { ReactNode } from 'react';
import { AuthProvider, useAuth } from '../AuthContext';
import { AuthAPIError } from '@/services/auth';
import { User, LoginResponse } from '@/types/auth';

// Mock the auth API
jest.mock('@/services/auth', () => ({
  authAPI: {
    login: jest.fn(),
    register: jest.fn(),
    getCurrentUser: jest.fn(),
    logout: jest.fn(),
  },
  AuthAPIError: class AuthAPIError extends Error {
    constructor(message: string, public status?: number, public code?: string) {
      super(message);
      this.name = 'AuthAPIError';
    }
  },
}));

// Mock the OIDC auth service
const mockOIDCAuthService = {
  login: jest.fn(),
  register: jest.fn(),
  getUserInfo: jest.fn(),
  logout: jest.fn(),
  isAuthenticated: jest.fn(),
  refreshToken: jest.fn(),
  initiateOAuth: jest.fn(),
  handleOAuthCallback: jest.fn(),
};

jest.mock('@/services/oidc-auth', () => ({
  OIDCAuthService: mockOIDCAuthService,
}));

// Mock api-client
jest.mock('@/lib/api-client', () => ({
  __esModule: true,
  default: jest.fn(),
  clearAuthTokens: jest.fn(),
  cleanupExpiredTokens: jest.fn(),
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

// Mock atob for JWT decoding
global.atob = (str: string) => {
  if (!str) {
    throw new TypeError('The first argument must be of type string or an instance of Buffer, ArrayBuffer, or Array or an Array-like Object. Received undefined');
  }
  return Buffer.from(str, 'base64').toString('ascii');
};

// authAPI is mocked but not used as we're using OIDC service now
const mockedOIDCAuthService = mockOIDCAuthService;

describe('AuthContext', () => {
  const mockUser: User = {
    id: '1',
    username: 'testuser',
    email: 'test@example.com',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  };

  const wrapper = ({ children }: { children: ReactNode }) => (
    <AuthProvider>{children}</AuthProvider>
  );

  beforeEach(() => {
    jest.clearAllMocks();
    localStorageMock.getItem.mockReturnValue(null);
    mockedOIDCAuthService.isAuthenticated.mockReturnValue(false);
  });

  describe('initialization', () => {
    it('initializes and completes auth check', async () => {
      const { result } = renderHook(() => useAuth(), { wrapper });

      // Wait for the initial auth check to complete
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.isAuthenticated).toBe(false);
      expect(result.current.user).toBe(null);
      expect(result.current.error).toBe(null);
    });

    it('checks authentication on mount when token exists', async () => {
      localStorageMock.getItem.mockReturnValue('fake-token');
      mockedOIDCAuthService.isAuthenticated.mockReturnValue(true);
      mockedOIDCAuthService.getUserInfo.mockResolvedValue(mockUser);

      const { result } = renderHook(() => useAuth(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.isAuthenticated).toBe(true);
      expect(result.current.user).toEqual(mockUser);
      expect(mockedOIDCAuthService.getUserInfo).toHaveBeenCalled();
    });

    it('sets unauthenticated state when no token exists', async () => {
      localStorageMock.getItem.mockReturnValue(null);

      const { result } = renderHook(() => useAuth(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.isAuthenticated).toBe(false);
      expect(result.current.user).toBe(null);
      expect(mockedOIDCAuthService.getUserInfo).not.toHaveBeenCalled();
    });

    it('handles invalid token on mount', async () => {
      // Suppress expected console.error for this test
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
      
      localStorageMock.getItem.mockReturnValue('invalid-token');
      mockedOIDCAuthService.isAuthenticated.mockReturnValue(true);
      mockedOIDCAuthService.getUserInfo.mockRejectedValue(new AuthAPIError('Invalid token'));

      const { result } = renderHook(() => useAuth(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.isAuthenticated).toBe(false);
      expect(result.current.user).toBe(null);
      // Token removal is handled internally by OIDC service
      
      // Restore console.error
      consoleErrorSpy.mockRestore();
    });
  });

  describe('login', () => {
    it('successfully logs in user', async () => {
      const loginResponse = {
        accessToken: 'access-token',
        refreshToken: 'refresh-token',
        user: mockUser,
      };
      mockedOIDCAuthService.login.mockResolvedValue(loginResponse);

      const { result } = renderHook(() => useAuth(), { wrapper });

      // Wait for initial load
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      // Mock localStorage to return a valid JWT token after login
      localStorageMock.getItem.mockImplementation((key) => {
        if (key === 'accessToken') {
          // Return a valid JWT token with future expiration
          const payload = { exp: Math.floor(Date.now() / 1000) + 3600 };
          return 'header.' + btoa(JSON.stringify(payload)) + '.signature';
        }
        return null;
      });

      await act(async () => {
        await result.current.login('test@example.com', 'password');
      });

      expect(mockedOIDCAuthService.login).toHaveBeenCalledWith('test@example.com', 'password');
      expect(result.current.isAuthenticated).toBe(true);
      expect(result.current.user).toEqual(mockUser);
      expect(result.current.error).toBe(null);
    });

    it('handles login error', async () => {
      const errorMessage = 'Invalid credentials';
      mockedOIDCAuthService.login.mockRejectedValue(new AuthAPIError(errorMessage));

      const { result } = renderHook(() => useAuth(), { wrapper });

      // Wait for initial load
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      await act(async () => {
        try {
          await result.current.login('test@example.com', 'wrong-password');
        } catch {
          // Expected to throw
        }
      });

      expect(result.current.isAuthenticated).toBe(false);
      expect(result.current.user).toBe(null);
      expect(result.current.error).toBe(errorMessage);
      // Token storage is handled internally by OIDC service
    });

    it('shows loading state during login', async () => {
      let resolveLogin: (value: LoginResponse) => void;
      const loginPromise = new Promise<LoginResponse>((resolve) => {
        resolveLogin = resolve;
      });
      mockedOIDCAuthService.login.mockReturnValue(loginPromise);

      const { result } = renderHook(() => useAuth(), { wrapper });

      // Start login
      act(() => {
        result.current.login('test@example.com', 'password');
      });

      expect(result.current.isLoading).toBe(true);

      // Resolve login
      act(() => {
        resolveLogin!({
          accessToken: 'token',
          refreshToken: 'refresh',
          user: mockUser,
        });
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });
    });
  });

  describe('register', () => {
    it('successfully registers user', async () => {
      const registerResponse = {
        user: mockUser,
        accessToken: 'mock-access-token',
        refreshToken: 'mock-refresh-token',
      };
      mockedOIDCAuthService.register.mockResolvedValue(registerResponse);

      const { result } = renderHook(() => useAuth(), { wrapper });

      // Wait for initial load
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      // Mock localStorage to return a valid JWT token after register
      localStorageMock.getItem.mockImplementation((key) => {
        if (key === 'accessToken') {
          // Return a valid JWT token with future expiration
          const payload = { exp: Math.floor(Date.now() / 1000) + 3600 };
          return 'header.' + btoa(JSON.stringify(payload)) + '.signature';
        }
        return null;
      });

      await act(async () => {
        await result.current.register('testuser', 'test@example.com', 'password');
      });

      expect(mockedOIDCAuthService.register).toHaveBeenCalledWith('test@example.com', 'password', 'testuser');
      // After successful registration with tokens, user should be authenticated
      expect(result.current.isAuthenticated).toBe(true);
      expect(result.current.user).toEqual(mockUser);
      // Token storage is handled internally by OIDC service
      expect(result.current.error).toBe(null);
    });

    it('handles registration error', async () => {
      const errorMessage = 'Email already exists';
      mockedOIDCAuthService.register.mockRejectedValue(new AuthAPIError(errorMessage));

      const { result } = renderHook(() => useAuth(), { wrapper });

      // Wait for initial load
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      await act(async () => {
        try {
          await result.current.register('testuser', 'test@example.com', 'password');
        } catch {
          // Expected to throw
        }
      });

      expect(result.current.isAuthenticated).toBe(false);
      expect(result.current.user).toBe(null);
      expect(result.current.error).toBe(errorMessage);
    });
  });

  describe('logout', () => {
    it('successfully logs out user', async () => {
      // First, set up authenticated state
      localStorageMock.getItem.mockReturnValue('fake-token');
      mockedOIDCAuthService.isAuthenticated.mockReturnValue(true);
      mockedOIDCAuthService.getUserInfo.mockResolvedValue(mockUser);
      mockedOIDCAuthService.logout.mockResolvedValue(undefined);

      const { result } = renderHook(() => useAuth(), { wrapper });

      // Wait for initial auth check
      await waitFor(() => {
        expect(result.current.isAuthenticated).toBe(true);
      });

      // Now logout
      await act(async () => {
        await result.current.logout();
      });

      expect(mockedOIDCAuthService.logout).toHaveBeenCalled();
      // Token removal is handled internally by OIDC service
      expect(result.current.isAuthenticated).toBe(false);
      expect(result.current.user).toBe(null);
      expect(result.current.error).toBe(null);
    });

    it('clears local storage even if logout API call fails', async () => {
      // First, set up authenticated state
      localStorageMock.getItem.mockReturnValue('fake-token');
      mockedOIDCAuthService.isAuthenticated.mockReturnValue(true);
      mockedOIDCAuthService.getUserInfo.mockResolvedValue(mockUser);
      mockedOIDCAuthService.logout.mockRejectedValue(new Error('Network error'));

      const { result } = renderHook(() => useAuth(), { wrapper });

      // Wait for initial auth check
      await waitFor(() => {
        expect(result.current.isAuthenticated).toBe(true);
      });

      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();

      // Now logout
      await act(async () => {
        await result.current.logout();
      });

      // Token removal is handled internally by OIDC service
      expect(result.current.isAuthenticated).toBe(false);
      expect(result.current.user).toBe(null);
      expect(consoleSpy).toHaveBeenCalledWith('Logout request failed:', expect.any(Error));

      consoleSpy.mockRestore();
    });
  });

  describe('error management', () => {
    it('clears error when clearError is called', async () => {
      // Set up error state
      mockedOIDCAuthService.login.mockRejectedValue(new Error('Login failed'));

      const { result } = renderHook(() => useAuth(), { wrapper });

      // Wait for initial load
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      await act(async () => {
        try {
          await result.current.login('test@example.com', 'wrong-password');
        } catch {
          // Expected to throw
        }
      });

      expect(result.current.error).toBe('Login failed');

      act(() => {
        result.current.clearError();
      });

      expect(result.current.error).toBe(null);
    });
  });

  describe('checkAuth', () => {
    it('manually checks authentication status', async () => {
      localStorageMock.getItem.mockReturnValue('fake-token');
      mockedOIDCAuthService.isAuthenticated.mockReturnValue(true);
      mockedOIDCAuthService.getUserInfo.mockResolvedValue(mockUser);

      const { result } = renderHook(() => useAuth(), { wrapper });

      // Wait for initial load
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      // Clear the user state
      act(() => {
        result.current.logout();
      });

      // Now check auth manually
      localStorageMock.getItem.mockReturnValue('new-token');
      
      await act(async () => {
        await result.current.checkAuth();
      });

      expect(result.current.isAuthenticated).toBe(true);
      expect(result.current.user).toEqual(mockUser);
    });
  });
});