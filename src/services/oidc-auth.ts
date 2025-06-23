import apiClient from '@/lib/api-client';
import { hasValidAccessToken, debugToken, isTokenExpired as isJWTExpired } from '@/utils/jwt';

export interface AuthResponse {
  accessToken: string;
  refreshToken?: string;
  user: {
    id: string;
    email: string;
    username: string;
    createdAt: string;
    updatedAt: string;
  };
}

export interface OAuthInitResponse {
  authorizationUrl: string;
  state: string;
  provider: string;
}

export class OIDCAuthService {
  /**
   * Traditional email/password login
   */
  static async login(email: string, password: string): Promise<AuthResponse> {
    const response = await apiClient.post('/auth/login', { email, password });
    const data = response.data;
    
    // Store tokens and user info
    localStorage.setItem('accessToken', data.accessToken);
    if (data.refreshToken) {
      localStorage.setItem('refreshToken', data.refreshToken);
    }
    if (data.user) {
      localStorage.setItem('user', JSON.stringify(data.user));
    }
    
    // Debug token in development
    if (process.env.NODE_ENV === 'development') {
      console.log('OIDC Login: Stored access token and user info');
      debugToken(data.accessToken);
    }
    
    return data;
  }
  
  /**
   * User registration
   */
  static async register(email: string, password: string, username: string): Promise<AuthResponse> {
    const response = await apiClient.post('/auth/register', { 
      email, 
      password, 
      username 
    });
    const data = response.data;
    
    localStorage.setItem('accessToken', data.accessToken);
    if (data.refreshToken) {
      localStorage.setItem('refreshToken', data.refreshToken);
    }
    if (data.user) {
      localStorage.setItem('user', JSON.stringify(data.user));
    }
    
    // Debug token in development
    if (process.env.NODE_ENV === 'development') {
      console.log('OIDC Register: Stored access token and user info');
      debugToken(data.accessToken);
    }
    
    return data;
  }
  
  /**
   * Initiate OAuth flow for social login
   */
  static async initiateOAuth(provider: 'google' | 'github'): Promise<OAuthInitResponse> {
    // Include frontend redirect URL so backend knows where to redirect after OAuth
    const frontendRedirectUrl = process.env.NEXT_PUBLIC_OAUTH_REDIRECT_URI || 'http://localhost:3000/auth/callback';
    const response = await apiClient.get(`/auth/oidc/${provider}/authorize`, {
      params: {
        redirect_url: frontendRedirectUrl
      }
    });
    return response.data;
  }
  
  /**
   * Handle OAuth callback
   */
  static async handleOAuthCallback(
    provider: string, 
    code: string, 
    state: string
  ): Promise<AuthResponse> {
    const response = await apiClient.post(`/auth/oidc/${provider}/callback`, {
      code,
      state,
    });
    const data = response.data;
    
    localStorage.setItem('accessToken', data.accessToken);
    if (data.refreshToken) {
      localStorage.setItem('refreshToken', data.refreshToken);
    }
    if (data.user) {
      localStorage.setItem('user', JSON.stringify(data.user));
    }
    
    // Debug token in development
    if (process.env.NODE_ENV === 'development') {
      console.log('OIDC OAuth Callback: Stored access token and user info');
      debugToken(data.accessToken);
    }
    
    return data;
  }
  
  /**
   * Get current user info
   */
  static async getUserInfo(): Promise<AuthResponse['user']> {
    // Try to get user info from localStorage first (stored during login)
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        return JSON.parse(storedUser);
      } catch (error) {
        console.warn('Failed to parse stored user:', error);
      }
    }
    
    // If no stored user, try to fetch from backend
    // Note: Both /oauth2/userinfo and /auth/me endpoints return 403 currently
    try {
      const response = await apiClient.get('/auth/me');
      return response.data;
    } catch (error) {
      // If backend endpoints are not available, return null
      console.warn('Unable to fetch user info from backend:', error);
      throw error;
    }
  }
  
  /**
   * Refresh access token
   */
  static async refreshToken(): Promise<AuthResponse> {
    const refreshToken = localStorage.getItem('refreshToken');
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }
    
    const response = await apiClient.post('/auth/refresh', { refreshToken });
    const data = response.data;
    
    localStorage.setItem('accessToken', data.accessToken);
    if (data.refreshToken) {
      localStorage.setItem('refreshToken', data.refreshToken);
    }
    if (data.user) {
      localStorage.setItem('user', JSON.stringify(data.user));
    }
    
    // Debug token in development
    if (process.env.NODE_ENV === 'development') {
      console.log('OIDC Refresh: Stored new access token and user info');
      debugToken(data.accessToken);
    }
    
    return data;
  }

  /**
   * Get valid token (refresh if needed)
   */
  static async getValidToken(): Promise<string | null> {
    const accessToken = localStorage.getItem('accessToken');
    
    if (!accessToken) {
      return null;
    }

    // Check if token is expired (with 1 minute buffer)
    if (isJWTExpired(accessToken, 60)) {
      try {
        const response = await this.refreshToken();
        return response.accessToken;
      } catch (error) {
        if (process.env.NODE_ENV === 'development') {
          console.warn('Failed to refresh token:', error);
        }
        return null;
      }
    }

    return accessToken;
  }
  
  /**
   * Logout user
   */
  static async logout(): Promise<void> {
    try {
      await apiClient.post('/auth/logout');
    } catch (error) {
      // Ignore logout errors - we'll clear local storage anyway
      console.warn('Logout request failed:', error);
    } finally {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
      // Clear OAuth state if exists
      sessionStorage.removeItem('oauth_state');
      sessionStorage.removeItem('oauth_provider');
    }
  }
  
  /**
   * Check if user is authenticated
   */
  static isAuthenticated(): boolean {
    return hasValidAccessToken();
  }
  
  // Removed decodeJWT method - now using unified JWT utilities from @/utils/jwt
  
  /**
   * Check if token is expired
   */
  static isTokenExpired(token: string): boolean {
    return isJWTExpired(token);
  }
  
  /**
   * Get stored access token
   */
  static getAccessToken(): string | null {
    return localStorage.getItem('accessToken');
  }
  
  /**
   * Get stored refresh token
   */
  static getRefreshToken(): string | null {
    return localStorage.getItem('refreshToken');
  }
}