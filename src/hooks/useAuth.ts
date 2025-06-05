import { useState } from 'react';
import { useAuth as useAuthContext } from '@/contexts/AuthContext';

export function useAuth() {
  return useAuthContext();
}

export function useLogin() {
  const { login, isLoading, error, clearError } = useAuthContext();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loginUser = async (email: string, password: string) => {
    try {
      setIsSubmitting(true);
      clearError();
      await login(email, password);
    } catch (error) {
      // Error is already handled in the context
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    login: loginUser,
    isLoading: isLoading || isSubmitting,
    error,
    clearError,
  };
}

export function useRegister() {
  const { register, isLoading, error, clearError } = useAuthContext();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const registerUser = async (username: string, email: string, password: string) => {
    try {
      setIsSubmitting(true);
      clearError();
      await register(username, email, password);
    } catch (error) {
      // Error is already handled in the context
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    register: registerUser,
    isLoading: isLoading || isSubmitting,
    error,
    clearError,
  };
}

export function useLogout() {
  const { logout } = useAuthContext();
  const [isLoading, setIsLoading] = useState(false);

  const logoutUser = async () => {
    try {
      setIsLoading(true);
      await logout();
    } catch (error) {
      // Error is already handled in the context
      console.error('Logout error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    logout: logoutUser,
    isLoading,
  };
}