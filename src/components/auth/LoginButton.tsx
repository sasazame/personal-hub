'use client';

import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { AuthProvider } from '@/types/auth-provider';
import { Button } from '@/components/ui/Button';
import { Icons } from '@/components/ui/icons';

interface LoginButtonProps {
  provider?: AuthProvider;
  className?: string;
  children?: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'outline';
  size?: 'sm' | 'md' | 'lg';
}

export const LoginButton: React.FC<LoginButtonProps> = ({
  provider,
  className,
  children,
  variant = 'primary',
  size = 'md',
}) => {
  const { loginWithOIDC, isLoading } = useAuth();

  const handleLogin = async () => {
    try {
      if (provider && (provider === 'google' || provider === 'github')) {
        await loginWithOIDC(provider);
      }
    } catch (error) {
      console.error('Login error:', error);
    }
  };

  const getProviderIcon = () => {
    switch (provider) {
      case 'google':
        return <Icons.google className="mr-2 h-4 w-4" />;
      case 'github':
        return <Icons.gitHub className="mr-2 h-4 w-4" />;
      case 'email':
        return <Icons.mail className="mr-2 h-4 w-4" />;
      default:
        return <Icons.login className="mr-2 h-4 w-4" />;
    }
  };

  const getProviderLabel = () => {
    switch (provider) {
      case 'google':
        return 'Login with Google';
      case 'github':
        return 'Login with GitHub';
      case 'email':
        return 'Login with Email';
      default:
        return 'Login';
    }
  };

  return (
    <Button
      onClick={handleLogin}
      disabled={isLoading}
      variant={variant}
      size={size}
      className={className}
    >
      {isLoading ? (
        <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
      ) : (
        getProviderIcon()
      )}
      {children || getProviderLabel()}
    </Button>
  );
};