'use client';

import { createContext, useContext, useReducer, useEffect, ReactNode, useCallback } from 'react';
import { User } from '@/types/auth';
import { showSuccess, showError } from '@/components/ui/toast';
import { getErrorMessage } from '@/utils/errorMessages';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

type AuthAction =
  | { type: 'AUTH_LOADING' }
  | { type: 'AUTH_SUCCESS'; payload: User }
  | { type: 'AUTH_ERROR'; payload: string }
  | { type: 'AUTH_LOGOUT' }
  | { type: 'CLEAR_ERROR' };

const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  isLoading: true,
  error: null,
};

function authReducer(state: AuthState, action: AuthAction): AuthState {
  switch (action.type) {
    case 'AUTH_LOADING':
      return {
        ...state,
        isLoading: true,
        error: null,
      };
    case 'AUTH_SUCCESS':
      return {
        ...state,
        user: action.payload,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      };
    case 'AUTH_ERROR':
      return {
        ...state,
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: action.payload,
      };
    case 'AUTH_LOGOUT':
      return {
        ...state,
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      };
    case 'CLEAR_ERROR':
      return {
        ...state,
        error: null,
      };
    default:
      return state;
  }
}

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<void>;
  loginWithOIDC: (provider: 'google' | 'github') => Promise<void>;
  handleOAuthCallback: (code: string, state: string, errorParam?: string, errorDescription?: string) => Promise<{ success: boolean; error?: string }>;
  register: (username: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  clearError: () => void;
  checkAuth: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [state, dispatch] = useReducer(authReducer, initialState);

  const login = async (email: string, password: string): Promise<void> => {
    dispatch({ type: 'AUTH_LOADING' });
    
    try {
      const { OIDCAuthService } = await import('@/services/oidc-auth');
      const data = await OIDCAuthService.login(email, password);
      
      dispatch({ type: 'AUTH_SUCCESS', payload: data.user });
      showSuccess(`Welcome back, ${data.user.username}!`);
    } catch (error) {
      const message = getErrorMessage(error);
      dispatch({ type: 'AUTH_ERROR', payload: message });
      showError(message);
      throw error;
    }
  };

  const loginWithOIDC = useCallback(async (provider: 'google' | 'github') => {
    try {
      dispatch({ type: 'AUTH_LOADING' });
      
      // Import the OIDC service dynamically to avoid SSR issues
      const { OIDCAuthService } = await import('@/services/oidc-auth');
      
      // Initiate OAuth flow
      const { authorizationUrl, state } = await OIDCAuthService.initiateOAuth(provider);
      
      // Store state and provider in session storage for callback verification
      sessionStorage.setItem('oauth_state', state);
      sessionStorage.setItem('oauth_provider', provider);
      
      // Redirect to authorization URL
      window.location.href = authorizationUrl;
    } catch (error) {
      const message = getErrorMessage(error);
      dispatch({ type: 'AUTH_ERROR', payload: message });
      showError(message);
      throw error;
    }
  }, []);

  const handleOAuthCallback = useCallback(async (
    code: string,
    state: string,
    errorParam?: string,
    errorDescription?: string
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      const { handleOAuthCallback: handleCallback } = await import('@/lib/oauth-callback-handler');
      const result = await handleCallback(code, state, errorParam, errorDescription);
      
      if (result.success && result.user) {
        dispatch({ type: 'AUTH_SUCCESS', payload: result.user });
        showSuccess(`Welcome back, ${result.user.username}!`);
        return { success: true };
      } else {
        dispatch({ type: 'AUTH_ERROR', payload: result.error || 'Authentication failed' });
        return { success: false, error: result.error };
      }
    } catch (error) {
      const message = getErrorMessage(error);
      dispatch({ type: 'AUTH_ERROR', payload: message });
      return { success: false, error: message };
    }
  }, []);

  const register = async (username: string, email: string, password: string): Promise<void> => {
    dispatch({ type: 'AUTH_LOADING' });
    
    try {
      const { OIDCAuthService } = await import('@/services/oidc-auth');
      const data = await OIDCAuthService.register(email, password, username);
      
      dispatch({ type: 'AUTH_SUCCESS', payload: data.user });
      showSuccess(`Welcome, ${data.user.username}! Account created successfully.`);
    } catch (error) {
      const message = getErrorMessage(error);
      dispatch({ type: 'AUTH_ERROR', payload: message });
      showError(message);
      throw error;
    }
  };

  const logout = async (): Promise<void> => {
    try {
      const { OIDCAuthService } = await import('@/services/oidc-auth');
      await OIDCAuthService.logout();
    } catch (error) {
      // Ignore logout errors - we'll clear local storage anyway
      console.warn('Logout request failed:', error);
    } finally {
      // Always clear local storage and update state
      const { clearAuthTokens } = await import('@/lib/api-client');
      clearAuthTokens();
      dispatch({ type: 'AUTH_LOGOUT' });
      showSuccess('You have been logged out successfully.');
    }
  };

  const clearError = (): void => {
    dispatch({ type: 'CLEAR_ERROR' });
  };

  const checkAuth = async (): Promise<void> => {
    try {
      // Clean up expired tokens first
      const { cleanupExpiredTokens } = await import('@/lib/api-client');
      cleanupExpiredTokens();
      
      const { OIDCAuthService } = await import('@/services/oidc-auth');
      
      if (!OIDCAuthService.isAuthenticated()) {
        dispatch({ type: 'AUTH_LOGOUT' });
        return;
      }

      dispatch({ type: 'AUTH_LOADING' });
      const user = await OIDCAuthService.getUserInfo();
      dispatch({ type: 'AUTH_SUCCESS', payload: user });
    } catch (error) {
      // Clear tokens and logout on auth check failure
      const { clearAuthTokens } = await import('@/lib/api-client');
      clearAuthTokens();
      dispatch({ type: 'AUTH_LOGOUT' });
      
      // Log error for debugging, don't show to user during silent auth check
      console.warn('Auth check failed:', error);
    }
  };

  // Check authentication on mount
  useEffect(() => {
    checkAuth();
  }, []);

  // Set up automatic token refresh timer
  useEffect(() => {
    if (!state.isAuthenticated || !state.user) {
      return;
    }

    const token = localStorage.getItem('accessToken');
    if (!token) {
      return;
    }

    try {
      // Decode JWT to get expiration time
      const payload = JSON.parse(atob(token.split('.')[1]));
      const expiresAt = payload.exp * 1000; // Convert to milliseconds
      const now = Date.now();
      const expiresIn = expiresAt - now;
      
      // If token expires within next hour, set up refresh timer
      if (expiresIn > 0 && expiresIn <= 60 * 60 * 1000) { // 1 hour
        // Schedule refresh 1 minute before expiration
        const refreshTime = Math.max(expiresIn - 60 * 1000, 0);
        
        if (process.env.NODE_ENV === 'development') {
          console.log(`Token refresh scheduled in ${Math.round(refreshTime / 1000)} seconds`);
        }
        
        const timeoutId = setTimeout(async () => {
          try {
            const { OIDCAuthService } = await import('@/services/oidc-auth');
            await OIDCAuthService.refreshToken();
            
            if (process.env.NODE_ENV === 'development') {
              console.log('Proactive token refresh completed successfully');
            }
          } catch (error) {
            console.warn('Proactive token refresh failed:', error);
            // Don't logout here - let the response interceptor handle it
          }
        }, refreshTime);

        return () => clearTimeout(timeoutId);
      }
    } catch (error) {
      console.warn('Failed to schedule token refresh:', error);
    }
  }, [state.isAuthenticated, state.user]);

  const value: AuthContextType = {
    ...state,
    login,
    loginWithOIDC,
    handleOAuthCallback,
    register,
    logout,
    clearError,
    checkAuth,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}