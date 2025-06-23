import { OIDCAuthService } from '../oidc-auth';
import apiClient from '@/lib/api-client';

// Mock the API client
jest.mock('@/lib/api-client');
const mockedApiClient = apiClient as jest.Mocked<typeof apiClient>;

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

// Mock sessionStorage
const sessionStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
Object.defineProperty(window, 'sessionStorage', {
  value: sessionStorageMock,
});

describe('OIDCAuthService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorageMock.getItem.mockReturnValue(null);
    sessionStorageMock.getItem.mockReturnValue(null);
  });

  describe('login', () => {
    it('should login and store tokens', async () => {
      const mockResponse = {
        data: {
          accessToken: 'test-access-token',
          refreshToken: 'test-refresh-token',
          user: {
            id: '123',
            email: 'test@example.com',
            username: 'testuser',
            createdAt: '2023-01-01',
            updatedAt: '2023-01-01',
          },
        },
      };

      mockedApiClient.post.mockResolvedValueOnce(mockResponse);

      const result = await OIDCAuthService.login('test@example.com', 'password');

      expect(mockedApiClient.post).toHaveBeenCalledWith('/auth/login', {
        email: 'test@example.com',
        password: 'password',
      });
      expect(localStorageMock.setItem).toHaveBeenCalledWith('accessToken', 'test-access-token');
      expect(localStorageMock.setItem).toHaveBeenCalledWith('refreshToken', 'test-refresh-token');
      expect(result).toEqual(mockResponse.data);
    });
  });

  describe('register', () => {
    it('should register and store tokens', async () => {
      const mockResponse = {
        data: {
          accessToken: 'test-access-token',
          refreshToken: 'test-refresh-token',
          user: {
            id: '123',
            email: 'test@example.com',
            username: 'testuser',
            createdAt: '2023-01-01',
            updatedAt: '2023-01-01',
          },
        },
      };

      mockedApiClient.post.mockResolvedValueOnce(mockResponse);

      const result = await OIDCAuthService.register('test@example.com', 'password', 'testuser');

      expect(mockedApiClient.post).toHaveBeenCalledWith('/auth/register', {
        email: 'test@example.com',
        password: 'password',
        username: 'testuser',
      });
      expect(localStorageMock.setItem).toHaveBeenCalledWith('accessToken', 'test-access-token');
      expect(localStorageMock.setItem).toHaveBeenCalledWith('refreshToken', 'test-refresh-token');
      expect(result).toEqual(mockResponse.data);
    });
  });

  describe('initiateOAuth', () => {
    it('should initiate OAuth flow', async () => {
      const mockResponse = {
        data: {
          authorizationUrl: 'https://accounts.google.com/oauth/authorize?...',
          state: 'random-state-string',
          provider: 'google',
        },
      };

      mockedApiClient.get.mockResolvedValueOnce(mockResponse);

      const result = await OIDCAuthService.initiateOAuth('google');

      expect(mockedApiClient.get).toHaveBeenCalledWith('/auth/oidc/google/authorize');
      expect(result).toEqual(mockResponse.data);
    });
  });

  describe('handleOAuthCallback', () => {
    it('should handle OAuth callback and store tokens', async () => {
      const mockResponse = {
        data: {
          accessToken: 'test-access-token',
          refreshToken: 'test-refresh-token',
          user: {
            id: '123',
            email: 'test@example.com',
            username: 'testuser',
            createdAt: '2023-01-01',
            updatedAt: '2023-01-01',
          },
        },
      };

      mockedApiClient.post.mockResolvedValueOnce(mockResponse);

      const result = await OIDCAuthService.handleOAuthCallback('google', 'auth-code', 'state-string');

      expect(mockedApiClient.post).toHaveBeenCalledWith('/auth/oidc/google/callback', {
        code: 'auth-code',
        state: 'state-string',
      });
      expect(localStorageMock.setItem).toHaveBeenCalledWith('accessToken', 'test-access-token');
      expect(localStorageMock.setItem).toHaveBeenCalledWith('refreshToken', 'test-refresh-token');
      expect(result).toEqual(mockResponse.data);
    });
  });

  describe('getUserInfo', () => {
    it('should get user info', async () => {
      const mockUser = {
        id: '123',
        email: 'test@example.com',
        username: 'testuser',
        createdAt: '2023-01-01',
        updatedAt: '2023-01-01',
      };

      mockedApiClient.get.mockResolvedValueOnce({ data: mockUser });

      const result = await OIDCAuthService.getUserInfo();

      expect(mockedApiClient.get).toHaveBeenCalledWith('/oauth2/userinfo');
      expect(result).toEqual(mockUser);
    });
  });

  describe('logout', () => {
    it('should logout and clear tokens', async () => {
      mockedApiClient.post.mockResolvedValueOnce({});

      await OIDCAuthService.logout();

      expect(mockedApiClient.post).toHaveBeenCalledWith('/auth/logout');
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('accessToken');
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('refreshToken');
      expect(sessionStorageMock.removeItem).toHaveBeenCalledWith('oauth_state');
      expect(sessionStorageMock.removeItem).toHaveBeenCalledWith('oauth_provider');
    });

    it('should clear tokens even if logout request fails', async () => {
      mockedApiClient.post.mockRejectedValueOnce(new Error('Network error'));

      // The logout method should not throw, it should handle the error gracefully
      await expect(OIDCAuthService.logout()).resolves.toBeUndefined();

      expect(localStorageMock.removeItem).toHaveBeenCalledWith('accessToken');
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('refreshToken');
      expect(sessionStorageMock.removeItem).toHaveBeenCalledWith('oauth_state');
      expect(sessionStorageMock.removeItem).toHaveBeenCalledWith('oauth_provider');
    });
  });

  describe('isAuthenticated', () => {
    it('should return false if no token', () => {
      localStorageMock.getItem.mockReturnValue(null);

      const result = OIDCAuthService.isAuthenticated();

      expect(result).toBe(false);
    });

    it('should return false if token is expired', () => {
      // Create an expired JWT token (simplified mock)
      const expiredToken = 'header.' + btoa(JSON.stringify({ exp: Date.now() / 1000 - 3600 })) + '.signature';
      localStorageMock.getItem.mockReturnValue(expiredToken);

      const result = OIDCAuthService.isAuthenticated();

      expect(result).toBe(false);
    });

    it('should return true if token is valid', () => {
      // Create a valid JWT token (simplified mock)
      const validToken = 'header.' + btoa(JSON.stringify({ exp: Date.now() / 1000 + 3600 })) + '.signature';
      localStorageMock.getItem.mockReturnValue(validToken);

      const result = OIDCAuthService.isAuthenticated();

      expect(result).toBe(true);
    });
  });

  describe('token helpers', () => {
    it('should get access token', () => {
      localStorageMock.getItem.mockReturnValue('test-token');

      const result = OIDCAuthService.getAccessToken();

      expect(localStorageMock.getItem).toHaveBeenCalledWith('accessToken');
      expect(result).toBe('test-token');
    });

    it('should get refresh token', () => {
      localStorageMock.getItem.mockReturnValue('test-refresh-token');

      const result = OIDCAuthService.getRefreshToken();

      expect(localStorageMock.getItem).toHaveBeenCalledWith('refreshToken');
      expect(result).toBe('test-refresh-token');
    });
  });
});