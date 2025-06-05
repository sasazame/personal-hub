import { authAPI, AuthAPIError } from '../auth';
import { LoginRequest, RegisterRequest } from '@/types/auth';

// Mock fetch
global.fetch = jest.fn();
const mockedFetch = fetch as jest.MockedFunction<typeof fetch>;

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

describe('authAPI', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorageMock.getItem.mockReturnValue(null);
  });

  describe('login', () => {
    const loginData: LoginRequest = {
      email: 'test@example.com',
      password: 'password123',
    };

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

      mockedFetch.mockResolvedValue({
        ok: true,
        json: async () => mockResponse,
      } as Response);

      const result = await authAPI.login(loginData);

      expect(fetch).toHaveBeenCalledWith('http://localhost:8080/api/v1/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(loginData),
      });
      expect(result).toEqual(mockResponse);
    });

    it('throws AuthAPIError on login failure', async () => {
      const errorResponse = {
        error: {
          code: 'INVALID_CREDENTIALS',
          message: 'Invalid email or password',
          details: {},
        },
      };

      mockedFetch.mockResolvedValue({
        ok: false,
        status: 401,
        json: async () => errorResponse,
      } as Response);

      await expect(authAPI.login(loginData)).rejects.toThrow(AuthAPIError);
      await expect(authAPI.login(loginData)).rejects.toThrow('Invalid email or password');
    });

    it('handles network errors', async () => {
      mockedFetch.mockResolvedValue({
        ok: false,
        status: 500,
        json: () => Promise.reject(new Error('Invalid JSON')),
      } as unknown as Response);

      await expect(authAPI.login(loginData)).rejects.toThrow(AuthAPIError);
      await expect(authAPI.login(loginData)).rejects.toThrow('Network error occurred');
    });
  });

  describe('register', () => {
    const registerData: RegisterRequest = {
      username: 'testuser',
      email: 'test@example.com',
      password: 'password123',
    };

    it('successfully registers user', async () => {
      const mockResponse = {
        user: {
          id: 1,
          username: 'testuser',
          email: 'test@example.com',
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: '2024-01-01T00:00:00Z',
        },
        message: 'User created successfully',
      };

      mockedFetch.mockResolvedValue({
        ok: true,
        json: async () => mockResponse,
      } as Response);

      const result = await authAPI.register(registerData);

      expect(fetch).toHaveBeenCalledWith('http://localhost:8080/api/v1/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(registerData),
      });
      expect(result).toEqual(mockResponse);
    });

    it('throws AuthAPIError on registration failure', async () => {
      const errorResponse = {
        error: {
          code: 'EMAIL_EXISTS',
          message: 'Email already registered',
          details: { field: 'email' },
        },
      };

      mockedFetch.mockResolvedValue({
        ok: false,
        status: 400,
        json: async () => errorResponse,
      } as Response);

      await expect(authAPI.register(registerData)).rejects.toThrow(AuthAPIError);
      await expect(authAPI.register(registerData)).rejects.toThrow('Email already registered');
    });
  });

  describe('getCurrentUser', () => {
    it('successfully gets current user with valid token', async () => {
      const mockUser = {
        id: 1,
        username: 'testuser',
        email: 'test@example.com',
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
      };

      localStorageMock.getItem.mockReturnValue('valid-token');
      mockedFetch.mockResolvedValue({
        ok: true,
        json: async () => mockUser,
      } as Response);

      const result = await authAPI.getCurrentUser();

      expect(fetch).toHaveBeenCalledWith('http://localhost:8080/api/v1/auth/me', {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer valid-token',
        },
      });
      expect(result).toEqual(mockUser);
    });

    it('makes request without token if none exists', async () => {
      localStorageMock.getItem.mockReturnValue(null);
      mockedFetch.mockResolvedValue({
        ok: false,
        status: 401,
        json: async () => ({ error: { message: 'No token provided' } }),
      } as Response);

      await expect(authAPI.getCurrentUser()).rejects.toThrow(AuthAPIError);

      expect(fetch).toHaveBeenCalledWith('http://localhost:8080/api/v1/auth/me', {
        headers: {
          'Content-Type': 'application/json',
        },
      });
    });

    it('throws AuthAPIError on invalid token', async () => {
      localStorageMock.getItem.mockReturnValue('invalid-token');
      mockedFetch.mockResolvedValue({
        ok: false,
        status: 401,
        json: async () => ({
          error: {
            code: 'INVALID_TOKEN',
            message: 'Token has expired',
          },
        }),
      } as Response);

      await expect(authAPI.getCurrentUser()).rejects.toThrow(AuthAPIError);
      await expect(authAPI.getCurrentUser()).rejects.toThrow('Token has expired');
    });
  });

  describe('refreshToken', () => {
    it('successfully refreshes token', async () => {
      const mockResponse = {
        accessToken: 'new-access-token',
        refreshToken: 'new-refresh-token',
        user: {
          id: 1,
          username: 'testuser',
          email: 'test@example.com',
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: '2024-01-01T00:00:00Z',
        },
      };

      localStorageMock.getItem.mockReturnValue('valid-refresh-token');
      mockedFetch.mockResolvedValue({
        ok: true,
        json: async () => mockResponse,
      } as Response);

      const result = await authAPI.refreshToken();

      expect(fetch).toHaveBeenCalledWith('http://localhost:8080/api/v1/auth/refresh', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refreshToken: 'valid-refresh-token' }),
      });
      expect(result).toEqual(mockResponse);
    });

    it('throws error when no refresh token available', async () => {
      localStorageMock.getItem.mockReturnValue(null);

      await expect(authAPI.refreshToken()).rejects.toThrow(AuthAPIError);
      await expect(authAPI.refreshToken()).rejects.toThrow('No refresh token available');
    });
  });

  describe('logout', () => {
    it('successfully logs out with refresh token', async () => {
      localStorageMock.getItem.mockImplementation((key) => {
        if (key === 'accessToken') return 'access-token';
        if (key === 'refreshToken') return 'refresh-token';
        return null;
      });
      mockedFetch.mockResolvedValue({
        ok: true,
        json: async () => ({}),
      } as Response);

      await authAPI.logout();

      expect(fetch).toHaveBeenCalledWith('http://localhost:8080/api/v1/auth/logout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer access-token',
        },
        body: JSON.stringify({ refreshToken: 'refresh-token' }),
      });
    });

    it('does not make request when no refresh token', async () => {
      localStorageMock.getItem.mockReturnValue(null);

      await authAPI.logout();

      expect(fetch).not.toHaveBeenCalled();
    });

    it('ignores logout errors', async () => {
      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();
      localStorageMock.getItem.mockImplementation((key) => {
        if (key === 'accessToken') return 'access-token';
        if (key === 'refreshToken') return 'refresh-token';
        return null;
      });
      mockedFetch.mockRejectedValue(new Error('Network error'));

      await expect(authAPI.logout()).resolves.not.toThrow();
      expect(consoleSpy).toHaveBeenCalledWith('Logout request failed:', expect.any(Error));

      consoleSpy.mockRestore();
    });
  });

  describe('changePassword', () => {
    it('successfully changes password', async () => {
      localStorageMock.getItem.mockReturnValue('access-token');
      mockedFetch.mockResolvedValue({
        ok: true,
        json: async () => ({}),
      } as Response);

      await authAPI.changePassword('oldPassword', 'newPassword');

      expect(fetch).toHaveBeenCalledWith('http://localhost:8080/api/v1/auth/change-password', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer access-token',
        },
        body: JSON.stringify({
          currentPassword: 'oldPassword',
          newPassword: 'newPassword',
        }),
      });
    });
  });

  describe('requestPasswordReset', () => {
    it('successfully requests password reset', async () => {
      mockedFetch.mockResolvedValue({
        ok: true,
        json: async () => ({}),
      } as Response);

      await authAPI.requestPasswordReset('test@example.com');

      expect(fetch).toHaveBeenCalledWith('http://localhost:8080/api/v1/auth/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: 'test@example.com' }),
      });
    });
  });

  describe('resetPassword', () => {
    it('successfully resets password', async () => {
      mockedFetch.mockResolvedValue({
        ok: true,
        json: async () => ({}),
      } as Response);

      await authAPI.resetPassword('reset-token', 'newPassword');

      expect(fetch).toHaveBeenCalledWith('http://localhost:8080/api/v1/auth/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token: 'reset-token',
          newPassword: 'newPassword',
        }),
      });
    });
  });

  describe('AuthAPIError', () => {
    it('creates error with message, status, and code', () => {
      const error = new AuthAPIError('Test error', 400, 'TEST_ERROR');
      
      expect(error.message).toBe('Test error');
      expect(error.status).toBe(400);
      expect(error.code).toBe('TEST_ERROR');
      expect(error.name).toBe('AuthAPIError');
    });

    it('creates error with just message', () => {
      const error = new AuthAPIError('Simple error');
      
      expect(error.message).toBe('Simple error');
      expect(error.status).toBeUndefined();
      expect(error.code).toBeUndefined();
    });
  });
});