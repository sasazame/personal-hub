import { renderHook, act, waitFor } from '@testing-library/react';
import { ReactNode } from 'react';
import { useLogin, useRegister, useLogout } from '../useAuth';
import { AuthProvider } from '@/contexts/AuthContext';
import { authAPI, AuthAPIError } from '@/services/auth';
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

const mockedAuthAPI = authAPI as jest.Mocked<typeof authAPI>;

describe('useAuth hooks', () => {
  const wrapper = ({ children }: { children: ReactNode }) => (
    <AuthProvider>{children}</AuthProvider>
  );

  beforeEach(() => {
    jest.clearAllMocks();
    localStorageMock.getItem.mockReturnValue(null);
  });

  describe('useLogin', () => {
    it('successfully logs in user', async () => {
      const mockResponse = {
        accessToken: 'access-token',
        refreshToken: 'refresh-token',
        user: {
          id: 1,
          username: 'testuser',
          email: 'test@example.com',
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: '2024-01-01T00:00:00Z',
        },
      };
      mockedAuthAPI.login.mockResolvedValue(mockResponse);

      const { result } = renderHook(() => useLogin(), { wrapper });

      await act(async () => {
        await result.current.login('test@example.com', 'password');
      });

      expect(mockedAuthAPI.login).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password',
      });
      expect(result.current.error).toBe(null);
    });

    it('handles login error', async () => {
      const errorMessage = 'Invalid credentials';
      mockedAuthAPI.login.mockRejectedValue(new AuthAPIError(errorMessage));

      const { result } = renderHook(() => useLogin(), { wrapper });

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
      mockedAuthAPI.login.mockReturnValue(loginPromise);

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
            id: 1,
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
      mockedAuthAPI.login.mockRejectedValue(new AuthAPIError('Login failed'));

      const { result } = renderHook(() => useLogin(), { wrapper });

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
          id: 1,
          username: 'testuser',
          email: 'test@example.com',
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: '2024-01-01T00:00:00Z',
        },
        accessToken: 'mock-access-token',
        refreshToken: 'mock-refresh-token',
      };
      mockedAuthAPI.register.mockResolvedValue(mockResponse);

      const { result } = renderHook(() => useRegister(), { wrapper });

      await act(async () => {
        await result.current.register('testuser', 'test@example.com', 'password123');
      });

      expect(mockedAuthAPI.register).toHaveBeenCalledWith({
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123',
      });
      expect(result.current.error).toBe(null);
    });

    it('handles registration error', async () => {
      const errorMessage = 'Email already exists';
      mockedAuthAPI.register.mockRejectedValue(new AuthAPIError(errorMessage));

      const { result } = renderHook(() => useRegister(), { wrapper });

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
      mockedAuthAPI.register.mockReturnValue(registerPromise);

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
            id: 1,
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
      mockedAuthAPI.register.mockRejectedValue(new AuthAPIError('Registration failed'));

      const { result } = renderHook(() => useRegister(), { wrapper });

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
      mockedAuthAPI.logout.mockResolvedValue();

      const { result } = renderHook(() => useLogout(), { wrapper });

      await act(async () => {
        await result.current.logout();
      });

      expect(mockedAuthAPI.logout).toHaveBeenCalled();
      expect(result.current.isLoading).toBe(false);
    });

    it('handles logout error gracefully', async () => {
      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();
      mockedAuthAPI.logout.mockRejectedValue(new Error('Network error'));

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
      mockedAuthAPI.logout.mockReturnValue(logoutPromise);

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