import { renderHook, act, waitFor } from '@testing-library/react';
import { ReactNode } from 'react';
import { useLogin, useRegister, useLogout } from '../useAuth';
import { AuthProvider } from '@/contexts/AuthContext';
import { AuthAPIError } from '@/services/auth';
import { LoginResponse, RegisterResponse } from '@/types/auth';

// Mock the auth API
jest.mock('@/services/auth', () => ({
  authAPI: {
    login: jest.fn(),
    register: jest.fn(),
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

describe('useAuth hooks', () => {
  const wrapper = ({ children }: { children: ReactNode }) => (
    <AuthProvider>{children}</AuthProvider>
  );

  beforeEach(() => {
    jest.clearAllMocks();
    localStorageMock.getItem.mockReturnValue(null);
    mockedOIDCAuthService.isAuthenticated.mockReturnValue(false);
  });

  describe('useLogin', () => {
    it('successfully logs in user', async () => {
      const mockResponse = {
        accessToken: 'access-token',
        refreshToken: 'refresh-token',
        user: {
          id: '1',
          username: 'testuser',
          email: 'test@example.com',
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: '2024-01-01T00:00:00Z',
        },
      };
      mockedOIDCAuthService.login.mockResolvedValue(mockResponse);

      const { result } = renderHook(() => useLogin(), { wrapper });

      // Wait for initial load
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      await act(async () => {
        await result.current.login('test@example.com', 'password');
      });

      expect(mockedOIDCAuthService.login).toHaveBeenCalledWith('test@example.com', 'password');
      expect(result.current.error).toBe(null);
    });

    it('handles login error', async () => {
      const errorMessage = 'Invalid credentials';
      mockedOIDCAuthService.login.mockRejectedValue(new AuthAPIError(errorMessage));

      const { result } = renderHook(() => useLogin(), { wrapper });

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

      expect(result.current.error).toBe(errorMessage);
    });

    it('shows loading state during login', async () => {
      let resolveLogin: (value: LoginResponse) => void;
      const loginPromise = new Promise<LoginResponse>((resolve) => {
        resolveLogin = resolve;
      });
      mockedOIDCAuthService.login.mockReturnValue(loginPromise);

      const { result } = renderHook(() => useLogin(), { wrapper });

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
          user: {
            id: '1',
            username: 'testuser',
            email: 'test@example.com',
            createdAt: '2024-01-01T00:00:00Z',
            updatedAt: '2024-01-01T00:00:00Z',
          },
        });
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });
    });

    it('clears error when clearError is called', async () => {
      mockedOIDCAuthService.login.mockRejectedValue(new Error('Login failed'));

      const { result } = renderHook(() => useLogin(), { wrapper });

      // Wait for initial load
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      // Generate error
      await act(async () => {
        try {
          await result.current.login('test@example.com', 'wrong-password');
        } catch {
          // Expected to throw
        }
      });

      expect(result.current.error).toBe('Login failed');

      // Clear error
      act(() => {
        result.current.clearError();
      });

      expect(result.current.error).toBe(null);
    });
  });

  describe('useRegister', () => {
    it('successfully registers user', async () => {
      const mockResponse = {
        user: {
          id: '1',
          username: 'testuser',
          email: 'test@example.com',
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: '2024-01-01T00:00:00Z',
        },
        accessToken: 'mock-access-token',
        refreshToken: 'mock-refresh-token',
      };
      mockedOIDCAuthService.register.mockResolvedValue(mockResponse);

      const { result } = renderHook(() => useRegister(), { wrapper });

      // Wait for initial load
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      await act(async () => {
        await result.current.register('testuser', 'test@example.com', 'password123');
      });

      expect(mockedOIDCAuthService.register).toHaveBeenCalledWith('test@example.com', 'password123', 'testuser');
      expect(result.current.error).toBe(null);
    });

    it('handles registration error', async () => {
      const errorMessage = 'Email already exists';
      mockedOIDCAuthService.register.mockRejectedValue(new AuthAPIError(errorMessage));

      const { result } = renderHook(() => useRegister(), { wrapper });

      // Wait for initial load
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      await act(async () => {
        try {
          await result.current.register('testuser', 'test@example.com', 'password123');
        } catch {
          // Expected to throw
        }
      });

      expect(result.current.error).toBe(errorMessage);
    });

    it('shows loading state during registration', async () => {
      let resolveRegister: (value: RegisterResponse) => void;
      const registerPromise = new Promise<RegisterResponse>((resolve) => {
        resolveRegister = resolve;
      });
      mockedOIDCAuthService.register.mockReturnValue(registerPromise);

      const { result } = renderHook(() => useRegister(), { wrapper });

      // Start registration
      act(() => {
        result.current.register('testuser', 'test@example.com', 'password123');
      });

      expect(result.current.isLoading).toBe(true);

      // Resolve registration
      act(() => {
        resolveRegister!({
          user: {
            id: '1',
            username: 'testuser',
            email: 'test@example.com',
            createdAt: '2024-01-01T00:00:00Z',
            updatedAt: '2024-01-01T00:00:00Z',
          },
          accessToken: 'mock-access-token',
          refreshToken: 'mock-refresh-token',
        });
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });
    });

    it('clears error when clearError is called', async () => {
      mockedOIDCAuthService.register.mockRejectedValue(new Error('Registration failed'));

      const { result } = renderHook(() => useRegister(), { wrapper });

      // Wait for initial load
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      // Generate error
      await act(async () => {
        try {
          await result.current.register('testuser', 'test@example.com', 'password123');
        } catch {
          // Expected to throw
        }
      });

      expect(result.current.error).toBe('Registration failed');

      // Clear error
      act(() => {
        result.current.clearError();
      });

      expect(result.current.error).toBe(null);
    });
  });

  describe('useLogout', () => {
    it('successfully logs out user', async () => {
      mockedOIDCAuthService.logout.mockResolvedValue(undefined);

      const { result } = renderHook(() => useLogout(), { wrapper });

      await act(async () => {
        await result.current.logout();
      });

      expect(mockedOIDCAuthService.logout).toHaveBeenCalled();
      expect(result.current.isLoading).toBe(false);
    });

    it('handles logout error gracefully', async () => {
      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();
      mockedOIDCAuthService.logout.mockRejectedValue(new Error('Network error'));

      const { result } = renderHook(() => useLogout(), { wrapper });

      await act(async () => {
        await result.current.logout();
      });

      expect(consoleSpy).toHaveBeenCalledWith('Logout request failed:', expect.any(Error));
      expect(result.current.isLoading).toBe(false);

      consoleSpy.mockRestore();
    });

    it('shows loading state during logout', async () => {
      let resolveLogout: (value: void) => void;
      const logoutPromise = new Promise<void>((resolve) => {
        resolveLogout = resolve;
      });
      mockedOIDCAuthService.logout.mockReturnValue(logoutPromise);

      const { result } = renderHook(() => useLogout(), { wrapper });

      // Start logout
      act(() => {
        result.current.logout();
      });

      expect(result.current.isLoading).toBe(true);

      // Resolve logout
      act(() => {
        resolveLogout!(undefined);
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });
    });
  });
});