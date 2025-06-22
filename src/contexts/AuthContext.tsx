'use client';

import { createContext, useContext, useReducer, useEffect, ReactNode, useCallback } from 'react';
import { User } from '@/types/auth';
import { authAPI } from '@/services/auth';
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
  loginWithOIDC: (provider?: string) => Promise<void>;
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
      const data = await authAPI.login({ email, password });
      
      // Store tokens in localStorage
      localStorage.setItem('accessToken', data.accessToken);
      localStorage.setItem('refreshToken', data.refreshToken);
      
      dispatch({ type: 'AUTH_SUCCESS', payload: data.user });
      showSuccess(`Welcome back, ${data.user.username}!`);
    } catch (error) {
      const message = getErrorMessage(error);
      dispatch({ type: 'AUTH_ERROR', payload: message });
      showError(message);
      throw error;
    }
  };

  const loginWithOIDC = useCallback(async (provider?: string) => {
    try {
      dispatch({ type: 'AUTH_LOADING' });
      
      // Placeholder for OIDC implementation
      showError(`${provider} ログインは現在開発中です。`);
      dispatch({ type: 'AUTH_ERROR', payload: `${provider} login not implemented yet` });
      
    } catch (error) {
      const message = getErrorMessage(error);
      dispatch({ type: 'AUTH_ERROR', payload: message });
      showError(message);
      throw error;
    }
  }, []);

  const register = async (username: string, email: string, password: string): Promise<void> => {
    dispatch({ type: 'AUTH_LOADING' });
    
    try {
      const data = await authAPI.register({ username, email, password });
      
      // Backend returns tokens on registration, so we can log the user in automatically
      if (data.accessToken && data.refreshToken) {
        localStorage.setItem('accessToken', data.accessToken);
        localStorage.setItem('refreshToken', data.refreshToken);
        dispatch({ type: 'AUTH_SUCCESS', payload: data.user });
        showSuccess(`Welcome, ${data.user.username}! Account created successfully.`);
      } else {
        // Fallback if backend doesn't return tokens
        dispatch({ type: 'AUTH_LOGOUT' });
        showSuccess('Account created successfully! Please log in to continue.');
      }
    } catch (error) {
      const message = getErrorMessage(error);
      dispatch({ type: 'AUTH_ERROR', payload: message });
      showError(message);
      throw error;
    }
  };

  const logout = async (): Promise<void> => {
    try {
      // Attempt to notify the server about logout
      await authAPI.logout();
    } catch (error) {
      // Ignore logout errors - we'll clear local storage anyway
      console.warn('Logout request failed:', error);
    } finally {
      // Always clear local storage and update state
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      dispatch({ type: 'AUTH_LOGOUT' });
      showSuccess('You have been logged out successfully.');
    }
  };

  const clearError = (): void => {
    dispatch({ type: 'CLEAR_ERROR' });
  };

  const checkAuth = async (): Promise<void> => {
    dispatch({ type: 'AUTH_LOADING' });
    
    try {
      const token = localStorage.getItem('accessToken');
      
      if (!token) {
        dispatch({ type: 'AUTH_LOGOUT' });
        return;
      }

      const user = await authAPI.getCurrentUser();
      dispatch({ type: 'AUTH_SUCCESS', payload: user });
    } catch (error) {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      dispatch({ type: 'AUTH_LOGOUT' });
      
      // Log error for debugging
      console.error('Auth check failed:', error);
    }
  };

  // Check authentication on mount
  useEffect(() => {
    checkAuth();
  }, []);

  const value: AuthContextType = {
    ...state,
    login,
    loginWithOIDC,
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