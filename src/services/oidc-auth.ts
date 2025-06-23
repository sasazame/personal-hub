import apiClient from '@/lib/api-client';

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
    
    // Store tokens
    localStorage.setItem('accessToken', data.accessToken);
    if (data.refreshToken) {
      localStorage.setItem('refreshToken', data.refreshToken);
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
    
    return data;
  }
  
  /**
   * Get current user info
   */
  static async getUserInfo(): Promise<AuthResponse['user']> {
    const response = await apiClient.get('/oauth2/userinfo');
    return response.data;
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
    
    return data;
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
      // Clear OAuth state if exists
      sessionStorage.removeItem('oauth_state');
      sessionStorage.removeItem('oauth_provider');
    }
  }
  
  /**
   * Check if user is authenticated
   */
  static isAuthenticated(): boolean {
    const token = localStorage.getItem('accessToken');
    if (!token) return false;
    
    // Check if token is expired
    try {
      const decoded = this.decodeJWT(token);
      if (!decoded || !decoded.exp) return false;
      
      const currentTime = Date.now() / 1000;
      return decoded.exp > currentTime;
    } catch {
      return false;
    }
  }
  
  /**
   * Decode JWT token
   */
  private static decodeJWT(token: string): { exp?: number } | null {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      return JSON.parse(jsonPayload);
    } catch {
      return null;
    }
  }
  
  /**
   * Check if token is expired
   */
  static isTokenExpired(token: string): boolean {
    const decoded = this.decodeJWT(token);
    if (!decoded || !decoded.exp) return true;
    
    const currentTime = Date.now() / 1000;
    return decoded.exp < currentTime;
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